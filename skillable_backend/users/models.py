import hashlib
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserRole(models.TextChoices):
    JOB_SEEKER = "JOB_SEEKER", "Job Seeker"
    EMPLOYER = "EMPLOYER", "Employer"
    ADMIN = "ADMIN", "Admin"


class DisabilityType(models.TextChoices):
    DEAF = "DEAF", "Deaf"
    BLIND = "BLIND", "Blind"
    OTHER = "OTHER", "Other"


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", UserRole.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.JOB_SEEKER)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)  # admin-approved for employers
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name", "role"]
    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"


class AccessibilityPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="accessibility")
    screen_reader = models.BooleanField(default=False)
    voice_navigation = models.BooleanField(default=False)
    sign_language_support = models.BooleanField(default=False)
    high_contrast = models.BooleanField(default=False)
    font_size = models.CharField(max_length=10, default="medium",
                                  choices=[("small", "Small"), ("medium", "Medium"), ("large", "Large")])
    preferred_language = models.CharField(max_length=10, default="en")

    def __str__(self):
        return f"Prefs for {self.user.email}"


class JobSeekerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="seeker_profile")
    disability_type = models.CharField(max_length=10, choices=DisabilityType.choices)
    aadhaar_hash = models.CharField(max_length=64, blank=True)  # SHA-256 hex, never raw
    pwd_certificate_id = models.CharField(max_length=100, blank=True)
    skills = models.JSONField(default=list)
    experience_years = models.PositiveSmallIntegerField(default=0)
    education = models.JSONField(default=list)   # [{degree, institution, year}]
    work_experience = models.JSONField(default=list)  # [{title, company, from, to}]
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_aadhaar(self, raw_aadhaar: str):
        """Hash Aadhaar before storing — never store raw."""
        self.aadhaar_hash = hashlib.sha256(raw_aadhaar.encode()).hexdigest()

    def __str__(self):
        return f"Seeker: {self.user.full_name}"


class EmployerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="employer_profile")
    company_name = models.CharField(max_length=255)
    company_description = models.TextField(blank=True)
    company_website = models.URLField(blank=True)
    industry = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    is_inclusion_certified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Employer: {self.company_name}"
