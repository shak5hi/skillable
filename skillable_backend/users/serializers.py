import re
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, UserRole, JobSeekerProfile, EmployerProfile, AccessibilityPreference


# ---------- Helpers ----------

def validate_aadhaar(value: str) -> str:
    if not re.fullmatch(r"\d{12}", value):
        raise serializers.ValidationError("Aadhaar must be exactly 12 digits.")
    return value


# ---------- JWT ----------

class CustomTokenObtainSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["full_name"] = user.full_name
        token["is_verified"] = user.is_verified
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user data to response alongside tokens
        user = self.user
        user_serializer = UserSerializer(user)
        data['user'] = user_serializer.data
        return data


# ---------- Signup ----------

class JobSeekerSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    aadhaar_number = serializers.CharField(write_only=True)
    pwd_certificate_id = serializers.CharField()
    disability_type = serializers.CharField()
    screen_reader = serializers.BooleanField(default=False)
    voice_navigation = serializers.BooleanField(default=False)
    sign_language_support = serializers.BooleanField(default=False)

    class Meta:
        model = User
        fields = ["full_name", "email", "password", "aadhaar_number",
                  "pwd_certificate_id", "disability_type",
                  "screen_reader", "voice_navigation", "sign_language_support"]

    def validate_aadhaar_number(self, value):
        return validate_aadhaar(value)

    def create(self, validated_data):
        aadhaar = validated_data.pop("aadhaar_number")
        pwd_cert = validated_data.pop("pwd_certificate_id")
        disability = validated_data.pop("disability_type")
        screen_reader = validated_data.pop("screen_reader", False)
        voice_nav = validated_data.pop("voice_navigation", False)
        sign_lang = validated_data.pop("sign_language_support", False)

        user = User.objects.create_user(**validated_data, role=UserRole.JOB_SEEKER)

        profile = JobSeekerProfile.objects.create(
            user=user,
            pwd_certificate_id=pwd_cert,
            disability_type=disability,
        )
        profile.set_aadhaar(aadhaar)
        profile.save()

        AccessibilityPreference.objects.create(
            user=user,
            screen_reader=screen_reader,
            voice_navigation=voice_nav,
            sign_language_support=sign_lang,
        )
        return user


class EmployerSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    company_name = serializers.CharField()
    company_description = serializers.CharField(required=False, default="")
    company_website = serializers.URLField(required=False, default="")
    industry = serializers.CharField()
    location = serializers.CharField()

    class Meta:
        model = User
        fields = ["full_name", "email", "password",
                  "company_name", "company_description",
                  "company_website", "industry", "location"]

    def create(self, validated_data):
        company_data = {k: validated_data.pop(k) for k in
                        ["company_name", "company_description", "company_website", "industry", "location"]}
        user = User.objects.create_user(**validated_data, role=UserRole.EMPLOYER, is_verified=True)
        EmployerProfile.objects.create(user=user, **company_data)
        return user


# ---------- Profiles ----------

class AccessibilityPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessibilityPreference
        exclude = ["user"]


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSeekerProfile
        exclude = ["user", "aadhaar_hash"]  # never expose hash


class EmployerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployerProfile
        exclude = ["user"]


class UserSerializer(serializers.ModelSerializer):
    seeker_profile = JobSeekerProfileSerializer(read_only=True)
    employer_profile = EmployerProfileSerializer(read_only=True)
    accessibility = AccessibilityPreferenceSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role", "is_verified",
                  "date_joined", "seeker_profile", "employer_profile", "accessibility"]
