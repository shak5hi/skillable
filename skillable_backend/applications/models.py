# models.py
from django.db import models
from users.models import JobSeekerProfile
from jobs.models import Job


class ApplicationStatus(models.TextChoices):
    APPLIED = "APPLIED", "Applied"
    UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
    INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED", "Interview Scheduled"
    REJECTED = "REJECTED", "Rejected"
    HIRED = "HIRED", "Hired"


class Application(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    applicant = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name="applications")
    status = models.CharField(max_length=25, choices=ApplicationStatus.choices, default=ApplicationStatus.APPLIED)
    cover_letter = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("job", "applicant")
        ordering = ["-applied_at"]

    def __str__(self):
        return f"{self.applicant.user.full_name} → {self.job.title}"
