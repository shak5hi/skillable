import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import InterviewRoom


class InterviewConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time accessible interview rooms.

    Handles:
      - user_joined / user_left : participant tracking
      - chat           : plain text chat messages
      - sign_data      : MediaPipe hand landmarks → AI sign-language prediction
                         → broadcasted sign_result (text + confidence) to ALL participants
                         → deaf candidate's signs are automatically voiced to the interviewer
      - speech_text    : interviewer's live speech transcript (from browser STT)
                         → broadcasted to ALL participants as captions for deaf users
      - error          : error payload

    ws://host/ws/interview/<room_id>/?token=<jwt>
    """

    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.group_name = f"interview_{self.room_id}"

        # Validate room exists and user has access
        access_data = await self.check_access()
        if not access_data["allowed"]:
            await self.close(code=4003)
            return

        self.seeker_user_id   = access_data["seeker_user_id"]
        self.employer_user_id = access_data["employer_user_id"]

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Notify others that this user joined
        user = self.scope["user"]
        role = "EMPLOYER" if user.id == self.employer_user_id else "SEEKER"
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "user_joined",
                "user_id": user.id,
                "full_name": getattr(user, "full_name", str(user)),
                "role": role,
            },
        )

    async def disconnect(self, close_code):
        user = self.scope["user"]
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "user_left",
                "user_id": user.id,
                "full_name": getattr(user, "full_name", str(user)),
            },
        )
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON payload.")
            return

        msg_type = data.get("type")
        user = self.scope["user"]

        # ── Plain chat message ──────────────────────────────────────────────
        if msg_type == "chat":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat",
                    "message": data.get("message", ""),
                    "sender_id": user.id,
                    "sender_name": getattr(user, "full_name", str(user)),
                },
            )

        # ── Sign-language landmarks → AI prediction ─────────────────────────
        elif msg_type == "sign_data":
            landmarks = data.get("landmarks", [])
            if not landmarks:
                return

            prediction = await self.predict_sign(landmarks)
            gesture    = prediction.get("gesture", "")
            text       = prediction.get("text", gesture)
            confidence = prediction.get("confidence", 0.0)

            # Only broadcast if we have a meaningful prediction
            if not text or confidence < 0.30:
                return

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "sign_result",
                    "sender_id": user.id,
                    "sender_name": getattr(user, "full_name", str(user)),
                    "gesture": gesture,
                    "text": text,
                    "confidence": confidence,
                },
            )

        # ── Interviewer speech → text (captions for deaf candidate) ────────
        elif msg_type == "speech_text":
            text = data.get("text", "").strip()
            if not text:
                return
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "speech_text",
                    "text": text,
                    "sender_id": user.id,
                    "sender_name": getattr(user, "full_name", str(user)),
                },
            )

        else:
            await self.send_error(f"Unknown message type: {msg_type}")

    # ── Group message handlers ──────────────────────────────────────────────

    async def user_joined(self, event):
        await self.send(text_data=json.dumps({"type": "user_joined", **event}))

    async def user_left(self, event):
        await self.send(text_data=json.dumps({"type": "user_left", **event}))

    async def chat(self, event):
        await self.send(text_data=json.dumps({"type": "chat", **event}))

    async def sign_result(self, event):
        await self.send(text_data=json.dumps({"type": "sign_result", **event}))

    async def speech_text(self, event):
        await self.send(text_data=json.dumps({"type": "speech_text", **event}))

    # ── Helpers ────────────────────────────────────────────────────────────

    async def send_error(self, message: str):
        await self.send(text_data=json.dumps({"type": "error", "message": message}))

    @database_sync_to_async
    def check_access(self) -> dict:
        """Return dict with allowed flag and participant user IDs."""
        user = self.scope["user"]
        if not user or not user.is_authenticated:
            return {"allowed": False, "seeker_user_id": None, "employer_user_id": None}
            
        if self.room_id == "demo-room":
            return {"allowed": True, "seeker_user_id": user.id, "employer_user_id": user.id}
            
        try:
            room = InterviewRoom.objects.select_related(
                "application__applicant__user",
                "application__job__employer__user",
            ).get(room_id=self.room_id, is_active=True)

            seeker_user   = room.application.applicant.user
            employer_user = room.application.job.employer.user

            allowed = user in (seeker_user, employer_user) or user.is_staff
            return {
                "allowed": allowed,
                "seeker_user_id": seeker_user.id,
                "employer_user_id": employer_user.id,
            }
        except InterviewRoom.DoesNotExist:
            return {"allowed": False, "seeker_user_id": None, "employer_user_id": None}

    async def predict_sign(self, landmarks: list) -> dict:
        """Call the sign-language AI microservice."""
        import httpx
        from django.conf import settings
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(
                    f"{settings.AI_SIGN_LANGUAGE_URL}/predict",
                    json={"landmarks": landmarks},
                )
                return resp.json()
        except Exception:
            return {"gesture": "", "text": "", "confidence": 0.0}
