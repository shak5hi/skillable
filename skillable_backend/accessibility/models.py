"""accessibility/models.py — Voice session log"""
from django.db import models
from users.models import User


class VoiceCommandLog(models.Model):
    """Stores voice commands for debugging and improvement."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="voice_logs")
    raw_command = models.TextField()
    resolved_action = models.CharField(max_length=100, blank=True)
    success = models.BooleanField(default=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email}: {self.raw_command[:50]}"
