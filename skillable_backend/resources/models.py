"""resources/models.py"""
from django.db import models


class ResourceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name_plural = "Resource Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class ResourceType(models.TextChoices):
    ARTICLE = "ARTICLE", "Article"
    VIDEO = "VIDEO", "Video"
    WEBINAR = "WEBINAR", "Webinar"
    GUIDE = "GUIDE", "Guide"
    CHECKLIST = "CHECKLIST", "Checklist"


class Resource(models.Model):
    category = models.ForeignKey(ResourceCategory, on_delete=models.SET_NULL,
                                  null=True, related_name="resources")
    title = models.CharField(max_length=255)
    description = models.TextField()
    resource_type = models.CharField(max_length=20, choices=ResourceType.choices, default=ResourceType.ARTICLE)
    content = models.TextField(blank=True)     # full text / transcript
    external_url = models.URLField(blank=True)
    thumbnail = models.URLField(blank=True)
    is_accessible_for_blind = models.BooleanField(default=True)
    is_accessible_for_deaf = models.BooleanField(default=True)
    has_sign_language_video = models.BooleanField(default=False)
    has_audio_description = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
