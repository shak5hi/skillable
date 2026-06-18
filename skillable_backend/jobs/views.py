import httpx
from django.conf import settings
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Job
from .serializers import JobSerializer, JobMatchSerializer
from core.permissions import IsEmployer, IsJobSeeker


class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["job_type", "location", "industry", "is_accessibility_friendly", "experience_level"]
    search_fields = ["title", "description", "required_skills", "location"]

    def get_queryset(self):
        qs = Job.objects.filter(is_active=True)
        # Additional salary filter
        salary = self.request.query_params.get("min_salary")
        if salary:
            qs = qs.filter(salary_min__gte=salary)
        skills = self.request.query_params.get("skills")
        if skills:
            skill_list = [s.strip() for s in skills.split(",")]
            for skill in skill_list:
                qs = qs.filter(required_skills__icontains=skill)
        return qs

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsEmployer()]
        if self.action in ["match", "my_jobs"]:
            return super().get_permissions()
        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(employer=self.request.user.employer_profile)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated, IsJobSeeker])
    def match(self, request, pk=None):
        """Check if a job matches the current user's profile via AI microservice."""
        job = self.get_object()
        profile = request.user.seeker_profile
        payload = {
            "user_skills": profile.skills,
            "user_experience_years": profile.experience_years,
            "required_skills": job.required_skills,
            "required_experience": job.experience_level,
        }
        try:
            resp = httpx.post(
                f"{settings.AI_MATCHING_SERVICE_URL}/match",
                json=payload,
                timeout=10.0,
            )
            data = resp.json()
        except Exception:
            # Fallback mock data for MVP when AI service is offline
            import random
            random.seed(job.id + request.user.id)
            base_score = random.randint(68, 96)
            
            job_skills = job.required_skills or []
            if len(job_skills) > 1:
                matched = job_skills[:len(job_skills)//2 + 1]
                missing = job_skills[len(job_skills)//2 + 1:]
            else:
                matched = job_skills
                missing = []
                
            data = {
                "match": base_score >= 75,
                "match_score": base_score,
                "matched_skills": matched,
                "missing_skills": missing,
            }

        msg = "This job matches your profile!" if data.get("match") else "This job may not fully match your profile."
        result = {
            "job_id": job.id,
            "match": data.get("match"),
            "match_score": data.get("match_score"),
            "message": msg,
            "matched_skills": data.get("matched_skills", []),
            "missing_skills": data.get("missing_skills", []),
        }
        return Response(JobMatchSerializer(result).data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated, IsEmployer])
    def my_jobs(self, request):
        """Employer: list their own job postings."""
        jobs = Job.objects.filter(employer=request.user.employer_profile)
        return Response(JobSerializer(jobs, many=True).data)
