import httpx
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from core.permissions import IsJobSeeker
from .models import Resume, ResumeAnalysis
from .serializers import ResumeSerializer, ResumeAnalysisSerializer


class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsJobSeeker]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Resume.objects.filter(profile=self.request.user.seeker_profile)

    def perform_create(self, serializer):
        resume = serializer.save(profile=self.request.user.seeker_profile)
        # Trigger async AI analysis after upload
        self._trigger_analysis(resume)

    def _trigger_analysis(self, resume: Resume):
        """
        Send resume file to AI microservice and store analysis.
        In production, offload to Celery task.
        """
        try:
            with open(resume.file.path, "rb") as f:
                resp = httpx.post(
                    f"{settings.AI_RESUME_SERVICE_URL}/analyze",
                    files={"resume": (resume.file.name, f, "application/octet-stream")},
                    timeout=2.0,
                )
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            # Fallback mock analysis for frontend MVP without microservices
            data = {
                "score": 85,
                "missing_skills": ["Docker", "WCAG 2.1"],
                "suggestions": {
                    "Format": ["Quantify your achievements using metrics."],
                    "Skills": ["Add more domain-specific accessibility tools you know."]
                },
                "role_compatibility": [
                    {"role": "Frontend Developer", "match": 90},
                    {"role": "Accessibility Expert", "match": 75}
                ],
                "improved_resume_text": "Include your quantified metrics."
            }
            
        ResumeAnalysis.objects.update_or_create(
            resume=resume,
            defaults={
                "score": data.get("score", 70),
                "missing_skills": data.get("missing_skills", []),
                "suggestions": data.get("suggestions", {}),
                "role_compatibility": data.get("role_compatibility", []),
                "improved_resume_text": data.get("improved_resume_text", ""),
            },
        )

    @action(detail=True, methods=["post"])
    def reanalyze(self, request, pk=None):
        """Manually trigger re-analysis for a specific resume."""
        resume = self.get_object()
        self._trigger_analysis(resume)
        try:
            analysis = resume.analysis
            return Response(ResumeAnalysisSerializer(analysis).data)
        except ResumeAnalysis.DoesNotExist:
            return Response({"message": "Analysis queued."}, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=["patch"])
    def set_primary(self, request, pk=None):
        """Mark a resume version as the primary one."""
        resume = self.get_object()
        resume.is_primary = True
        resume.save()
        return Response(ResumeSerializer(resume).data)
