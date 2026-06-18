from rest_framework import serializers
from .models import Resume, ResumeAnalysis


class ResumeAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeAnalysis
        fields = "__all__"
        read_only_fields = ["resume", "analyzed_at"]


class ResumeSerializer(serializers.ModelSerializer):
    analysis = ResumeAnalysisSerializer(read_only=True)

    class Meta:
        model = Resume
        fields = ["id", "file", "version", "is_primary", "uploaded_at", "analysis"]
        read_only_fields = ["profile", "version", "uploaded_at"]
