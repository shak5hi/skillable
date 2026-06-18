from rest_framework.permissions import BasePermission
from users.models import UserRole


class IsJobSeeker(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.JOB_SEEKER


class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        return (request.user.is_authenticated
                and request.user.role == UserRole.EMPLOYER
                and request.user.is_verified)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.ADMIN


class IsVerifiedJobSeeker(BasePermission):
    """Only verified (PWD-certified) job seekers can apply for jobs."""
    message = "Your account must be verified before applying to jobs."

    def has_permission(self, request, view):
        if not (request.user.is_authenticated and request.user.role == UserRole.JOB_SEEKER):
            return False
        try:
            return bool(request.user.seeker_profile.pwd_certificate_id)
        except Exception:
            return False
