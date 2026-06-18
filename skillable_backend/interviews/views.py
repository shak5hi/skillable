from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from applications.models import ApplicationStatus
from .models import InterviewRoom
from .serializers import InterviewRoomSerializer


class InterviewRoomViewSet(viewsets.ModelViewSet):
    serializer_class = InterviewRoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "EMPLOYER":
            return InterviewRoom.objects.filter(application__job__employer=user.employer_profile)
        if user.role == "JOB_SEEKER":
            return InterviewRoom.objects.filter(application__applicant=user.seeker_profile)
        return InterviewRoom.objects.all()

    def perform_create(self, serializer):
        # When employer creates a room, update application status
        room = serializer.save()
        room.application.status = ApplicationStatus.INTERVIEW_SCHEDULED
        room.application.save()
