from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InterviewRoomViewSet

router = DefaultRouter()
router.register("rooms", InterviewRoomViewSet, basename="interview-rooms")
urlpatterns = [path("", include(router.urls))]
