from django.db import models
from users.models import EmployerProfile


class JobType(models.TextChoices):
    FULL_TIME = "FULL_TIME", "Full Time"
    PART_TIME = "PART_TIME", "Part Time"
    REMOTE = "REMOTE", "Remote"
    CONTRACT = "CONTRACT", "Contract"


class ExperienceLevel(models.TextChoices):
    ENTRY = "ENTRY", "Entry Level"
    MID = "MID", "Mid Level"
    SENIOR = "SENIOR", "Senior"
    LEAD = "LEAD", "Lead / Manager"


class Job(models.Model):
    employer = models.ForeignKey(EmployerProfile, on_delete=models.CASCADE, related_name="jobs")
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField()
    required_skills = models.JSONField(default=list)  # ["Python", "Django", ...]
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    experience_level = models.CharField(max_length=10, choices=ExperienceLevel.choices, default=ExperienceLevel.ENTRY)
    location = models.CharField(max_length=255)
    industry = models.CharField(max_length=100)
    is_accessibility_friendly = models.BooleanField(default=False)
    accessibility_features = models.JSONField(default=list)  # ["Sign language interpreter", ...]
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} @ {self.employer.company_name}"
