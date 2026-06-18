from rest_framework import serializers
from .models import InterviewRoom


class InterviewRoomSerializer(serializers.ModelSerializer):
    room_url = serializers.SerializerMethodField()
    applicant_name = serializers.CharField(source="application.applicant.user.full_name", read_only=True)
    job_title = serializers.CharField(source="application.job.title", read_only=True)

    class Meta:
        model = InterviewRoom
        fields = ["id", "room_id", "application", "applicant_name", "job_title",
                  "scheduled_at", "duration_minutes", "notes", "is_active",
                  "room_url", "created_at"]
        read_only_fields = ["room_id", "created_at"]

    def get_room_url(self, obj):
        request = self.context.get("request")
        scheme = "wss" if request and request.is_secure() else "ws"
        host = request.get_host() if request else "localhost:8000"
        return f"{scheme}://{host}/ws/interview/{obj.room_id}/"
