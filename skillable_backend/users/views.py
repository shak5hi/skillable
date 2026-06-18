from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import UserRole, JobSeekerProfile, EmployerProfile
from .serializers import (
    JobSeekerSignupSerializer, EmployerSignupSerializer,
    UserSerializer, JobSeekerProfileSerializer,
    EmployerProfileSerializer, AccessibilityPreferenceSerializer,
    CustomTokenObtainSerializer,
)
from core.permissions import IsJobSeeker, IsEmployer, IsAdmin


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainSerializer


class JobSeekerSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = JobSeekerSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "Account created successfully.", "email": user.email},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmployerSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmployerSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "Employer account created. Awaiting admin approval.", "email": user.email},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class JobSeekerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = JobSeekerProfileSerializer
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get_object(self):
        return JobSeekerProfile.objects.get(user=self.request.user)


class EmployerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = EmployerProfileSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_object(self):
        return EmployerProfile.objects.get(user=self.request.user)


class AccessibilityPreferenceView(generics.RetrieveUpdateAPIView):
    serializer_class = AccessibilityPreferenceSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.accessibility
