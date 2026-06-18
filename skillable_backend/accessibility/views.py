import re
import httpx
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import VoiceCommandLog


# ─────────────────────────────────────────────────────────────────────────────
# Normalisation helper
# ─────────────────────────────────────────────────────────────────────────────

def normalize(raw: str) -> str:
    text = raw.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    noise = [
        r"\bplease\b", r"\bkindly\b", r"\bcan you\b", r"\bcould you\b",
        r"\bwould you\b", r"\bshow me\b", r"\btell me\b", r"\bfor me\b",
        r"\bthe\b", r"\ba\b", r"\ban\b",
    ]
    for p in noise:
        text = re.sub(p, " ", text)
    return re.sub(r"\s+", " ", text).strip()


def phrase(pattern: str, text: str):
    m = re.search(pattern, text)
    return m.group(1).strip() if m else None


# ─────────────────────────────────────────────────────────────────────────────
# COMMAND RESOLVER
# ─────────────────────────────────────────────────────────────────────────────

def resolve_command(raw: str) -> dict:
    """Flexible intent resolution — returns a structured action dict."""
    n = normalize(raw)
    if not n:
        return {
            "matched": False, "action": "unknown",
            "message": "Sorry, I couldn't hear your command. Please try again.",
        }

    # ── Deactivate ──────────────────────────────────────────────────────────
    if re.search(r"\b(stop listening|goodbye|deactivate|exit voice|quiet|exit)\b", n):
        return {
            "matched": True, "action": "deactivate",
            "message": "Voice navigation turned off. Say 'hello bandhu' to reactivate.",
        }

    # ── Read aloud ──────────────────────────────────────────────────────────
    if re.search(r"\b(read aloud|read page|read this|read content|read screen|read everything|read text)\b", n):
        return {
            "matched": True, "action": "read_aloud",
            "message": "Reading the page content aloud.",
        }

    # ── Navigation back ─────────────────────────────────────────────────────
    if re.search(r"\b(go back|back|previous page)\b", n):
        return {
            "matched": True, "action": "navigate_back",
            "message": "Going back to the previous page.",
        }

    # ── Dashboard ───────────────────────────────────────────────────────────
    if re.search(r"\b(dashboard|home screen|home page|my home)\b", n):
        return {
            "matched": True, "action": "navigate",
            "route": "/dashboard",
            "message": "Opening your dashboard.",
        }

    # ── Profile ─────────────────────────────────────────────────────────────
    if re.search(r"\b(profile|my profile|edit profile|open profile)\b", n):
        return {
            "matched": True, "action": "navigate",
            "route": "/profile",
            "message": "Opening your profile.",
        }

    # ── Resources ───────────────────────────────────────────────────────────
    if re.search(r"\b(resources|resource centre|resource center|help resources|support)\b", n):
        return {
            "matched": True, "action": "navigate",
            "route": "/resources",
            "message": "Opening resources.",
        }

    # ── Applications ────────────────────────────────────────────────────────
    if re.search(r"\b(my applications|application status|applied jobs|applications)\b", n):
        return {
            "matched": True, "action": "navigate",
            "route": "/applications",
            "message": "Opening your job applications.",
        }

    # ── Resume ──────────────────────────────────────────────────────────────
    if re.search(r"\b(resume|resumes|upload resume|my resume|cv)\b", n):
        return {
            "matched": True, "action": "navigate",
            "route": "/resumes",
            "message": "Opening the resume manager.",
        }

    # ── Interview ───────────────────────────────────────────────────────────
    if re.search(r"\b(interview|interviews|interview rooms?)\b", n):
        return {
            "matched": True, "action": "navigate",
            "route": "/interviews",
            "message": "Opening interview rooms.",
        }

    # ── Accessibility settings ───────────────────────────────────────────────
    if re.search(r"\b(accessibility|settings|preferences)\b", n):
        return {
            "matched": True, "action": "navigate",
            "route": "/accessibility",
            "message": "Opening accessibility settings.",
        }

    # ── Job FILTERS ─────────────────────────────────────────────────────────
    # Remote
    if re.search(r"\b(remote|work from home|wfh)\b", n) and re.search(r"\b(job|jobs|positions|roles|work)\b", n):
        return {
            "matched": True, "action": "filter_jobs",
            "filters": {"job_type": "REMOTE"},
            "message": "Showing remote jobs.",
        }

    # Full-time
    if re.search(r"\b(full[\s-]?time|fulltime)\b", n) and re.search(r"\b(job|jobs|positions|roles)\b", n):
        return {
            "matched": True, "action": "filter_jobs",
            "filters": {"job_type": "FULL_TIME"},
            "message": "Showing full-time jobs.",
        }

    # Part-time
    if re.search(r"\b(part[\s-]?time|parttime)\b", n) and re.search(r"\b(job|jobs|positions|roles)\b", n):
        return {
            "matched": True, "action": "filter_jobs",
            "filters": {"job_type": "PART_TIME"},
            "message": "Showing part-time jobs.",
        }

    # Contract
    if re.search(r"\b(contract|freelance|gig)\b", n) and re.search(r"\b(job|jobs|positions|roles)\b", n):
        return {
            "matched": True, "action": "filter_jobs",
            "filters": {"job_type": "CONTRACT"},
            "message": "Showing contract jobs.",
        }

    # Accessibility friendly
    if re.search(r"\b(accessibility[\s-]?friendly|accessible|inclusive)\b", n) and re.search(r"\b(job|jobs|positions|roles)\b", n):
        return {
            "matched": True, "action": "filter_jobs",
            "filters": {"is_accessibility_friendly": True},
            "message": "Showing accessibility-friendly jobs.",
        }

    # Location-based jobs
    loc = phrase(r"\b(?:in|near|at|around) ([a-z][a-z\s]{1,40})\b", n)
    if loc and re.search(r"\b(job|jobs|positions|roles|work)\b", n):
        loc = loc.strip()
        return {
            "matched": True, "action": "filter_jobs",
            "filters": {"location": loc},
            "message": f"Showing jobs near {loc}.",
        }

    # ── APPLY for a job ─────────────────────────────────────────────────────
    apply_m = re.search(
        r"\b(?:apply|applies|submit application)(?: to| for)?(?: job)?\s+([a-z][a-z\s]{2,60})\b", n
    )
    if apply_m:
        job_title = apply_m.group(1).strip()
        # Remove trailing filler
        job_title = re.sub(r"\b(job|position|role|at|in|on)\b.*$", "", job_title).strip()
        return {
            "matched": True, "action": "apply_job",
            "job_title": job_title,
            "message": f"Looking for {job_title} jobs to apply.",
        }

    # ── SEARCH / FIND jobs ──────────────────────────────────────────────────
    search_m = re.search(
        r"\b(?:search|find|look for|browse|show|look up|find me)(?: jobs?)?(?: for)? ?(.*)?", n
    )
    if search_m:
        query = (search_m.group(1) or "").strip()
        if not query:
            return {
                "matched": True, "action": "navigate",
                "route": "/jobs",
                "message": "Opening job search.",
            }
        # Check embedded filter keywords
        if re.search(r"\b(remote|work from home)\b", query):
            return {
                "matched": True, "action": "filter_jobs",
                "filters": {"job_type": "REMOTE"},
                "message": "Showing remote jobs.",
            }
        if re.search(r"\b(full[\s-]?time)\b", query):
            return {
                "matched": True, "action": "filter_jobs",
                "filters": {"job_type": "FULL_TIME"},
                "message": "Showing full-time jobs.",
            }
        return {
            "matched": True, "action": "search_jobs",
            "query": query,
            "message": f"Searching jobs for '{query}'.",
        }

    # ── Role / title + company keyword ──────────────────────────────────────
    if re.search(
        r"\b(developer|engineer|designer|analyst|manager|consultant|architect|specialist|lead|intern|director|nurse|teacher|accountant)\b",
        n
    ):
        return {
            "matched": True, "action": "search_jobs",
            "query": n,
            "message": f"Searching jobs for '{raw}'.",
        }

    # ── Catch-all: if "job" mentioned, search ───────────────────────────────
    if re.search(r"\bjobs?\b", n):
        return {
            "matched": True, "action": "search_jobs",
            "query": n,
            "message": "Searching jobs for you.",
        }

    return {
        "matched": False, "action": "unknown",
        "message": "Sorry, I didn't understand. Try: 'search Python jobs', 'show remote jobs', 'go to dashboard', or 'read aloud'.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# VIEWS
# ─────────────────────────────────────────────────────────────────────────────

class VoiceCommandView(APIView):
    """
    POST /api/accessibility/voice-command/
    Body: { "command": "Hello Bandhu search remote jobs" }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw = request.data.get("command", "").strip()
        if not raw:
            return Response({"error": "No command provided."}, status=status.HTTP_400_BAD_REQUEST)

        activation = "hello bandhu"
        raw_lower = raw.lower()
        if raw_lower.startswith(activation):
            command_text = raw[len(activation):].strip()
        else:
            command_text = raw

        result = resolve_command(command_text)

        VoiceCommandLog.objects.create(
            user=request.user,
            raw_command=raw,
            resolved_action=result.get("action", "unknown"),
            success=result.get("matched", False),
        )

        return Response(result)


class SignLanguageView(APIView):
    """
    POST /api/accessibility/sign-language/
    Body: { "landmarks": [[[x,y,z], ...], ...] }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        landmarks = request.data.get("landmarks")
        if not landmarks or not isinstance(landmarks, list):
            return Response(
                {"error": "landmarks array required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            resp = httpx.post(
                f"{settings.AI_SIGN_LANGUAGE_URL}/predict",
                json={"landmarks": landmarks},
                timeout=5.0,
            )
            return Response(resp.json())
        except httpx.TimeoutException:
            return Response({"error": "AI service timed out."}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except Exception:
            return Response({"error": "Sign language service unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
