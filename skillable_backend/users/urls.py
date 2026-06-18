from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("login/", views.LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("signup/seeker/", views.JobSeekerSignupView.as_view(), name="signup_seeker"),
    path("signup/employer/", views.EmployerSignupView.as_view(), name="signup_employer"),
    path("me/", views.MeView.as_view(), name="me"),
    path("profile/seeker/", views.JobSeekerProfileView.as_view(), name="seeker_profile"),
    path("profile/employer/", views.EmployerProfileView.as_view(), name="employer_profile"),
    path("accessibility/", views.AccessibilityPreferenceView.as_view(), name="accessibility"),
]
