from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Resource, ResourceCategory
from .serializers import ResourceCategorySerializer, ResourceSerializer


class ResourceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ResourceCategory.objects.all()
    serializer_class = ResourceCategorySerializer
    permission_classes = [AllowAny]


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.filter(is_published=True)
    serializer_class = ResourceSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = [
        "category", "resource_type",
        "is_accessible_for_blind", "is_accessible_for_deaf",
        "has_sign_language_video", "has_audio_description",
    ]
    search_fields = ["title", "description", "content"]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [AllowAny()]
