from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import Application, ApplicationStatus
from jobs.serializers import JobSerializer
from core.permissions import IsJobSeeker, IsEmployer, IsVerifiedJobSeeker


class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    company_name = serializers.CharField(source="job.employer.company_name", read_only=True)
    applicant_name = serializers.CharField(source="applicant.user.full_name", read_only=True)
    interview_room_id = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "job_title",
            "company_name",
            "applicant_name",
            "interview_room_id",
            "status",
            "cover_letter",
            "applied_at",
            "updated_at",
        ]
        read_only_fields = ["applicant", "status", "applied_at", "updated_at"]

    def get_interview_room_id(self, obj):
        try:
            return str(obj.interview_room.room_id)
        except ObjectDoesNotExist:
            return None


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), IsVerifiedJobSeeker()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        base = Application.objects.select_related("interview_room")
        if user.role == "JOB_SEEKER":
            return base.filter(applicant=user.seeker_profile)
        if user.role == "EMPLOYER":
            return base.filter(job__employer=user.employer_profile)
        return base.all()

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user.seeker_profile)

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated, IsEmployer])
    def update_status(self, request, pk=None):
        """Employer updates the application status."""
        application = self.get_object()
        new_status = request.data.get("status")
        if new_status not in ApplicationStatus.values:
            return Response({"error": "Invalid status."}, status=status.HTTP_400_BAD_REQUEST)
        application.status = new_status
        application.save()
        return Response(ApplicationSerializer(application).data)
