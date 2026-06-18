from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings
from users.models import JobSeekerProfile
import os


def resume_upload_path(instance, filename):
    return f"resumes/user_{instance.profile.user.id}/{filename}"


def validate_resume_file(file):
    content_type = getattr(file, "content_type", "")
    if content_type not in settings.ALLOWED_RESUME_TYPES:
        raise ValidationError(
            "Invalid file type. Only PDF and Word documents are accepted."
        )
    if file.size > settings.MAX_UPLOAD_SIZE:
        raise ValidationError("File too large. Max size is 5MB.")


class Resume(models.Model):
    profile = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name="resumes")
    file = models.FileField(upload_to=resume_upload_path, validators=[validate_resume_file])
    version = models.PositiveSmallIntegerField(default=1)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-version"]

    def save(self, *args, **kwargs):
        if not self.pk:
            # Auto-increment version
            last = Resume.objects.filter(profile=self.profile).order_by("-version").first()
            self.version = (last.version + 1) if last else 1
        super().save(*args, **kwargs)
        # Make this primary, demote others
        if self.is_primary:
            Resume.objects.filter(profile=self.profile).exclude(pk=self.pk).update(is_primary=False)

    def __str__(self):
        return f"Resume v{self.version} — {self.profile.user.full_name}"


class ResumeAnalysis(models.Model):
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE, related_name="analysis")
    score = models.FloatField(null=True, blank=True)
    missing_skills = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)   # [{"category": "...", "suggestion": "..."}]
    role_compatibility = models.JSONField(default=dict)  # {"role": "...", "score": 0.0}
    improved_resume_text = models.TextField(blank=True)
    analyzed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analysis for Resume {self.resume.id}"
