"""
interviews/models.py — Interview rooms
"""
from django.db import models
from users.models import User
from applications.models import Application
import uuid


class InterviewRoom(models.Model):
    room_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name="interview_room")
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveSmallIntegerField(default=60)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Room {self.room_id}"
