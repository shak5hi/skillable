from rest_framework import serializers
from .models import Job


class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="employer.company_name", read_only=True)
    company_website = serializers.CharField(source="employer.company_website", read_only=True)
    employer_id = serializers.IntegerField(source="employer.id", read_only=True)

    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["employer", "created_at", "updated_at"]


class JobMatchSerializer(serializers.Serializer):
    job_id = serializers.IntegerField()
    match = serializers.BooleanField()
    match_score = serializers.FloatField()
    message = serializers.CharField()
    matched_skills = serializers.ListField(child=serializers.CharField())
    missing_skills = serializers.ListField(child=serializers.CharField())
