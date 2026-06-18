from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceCategoryViewSet, ResourceViewSet

router = DefaultRouter()
router.register("categories", ResourceCategoryViewSet, basename="resource-categories")
router.register("", ResourceViewSet, basename="resources")

urlpatterns = [path("", include(router.urls))]
