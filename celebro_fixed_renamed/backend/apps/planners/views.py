from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.permissions import IsPlanner
from .models import PlannerProfile, Package
from .serializers import PlannerProfileSerializer, PackageSerializer


class PlannerProfileViewSet(viewsets.ModelViewSet):
    """
    /api/v1/planners/          — GET: public marketplace listing (any authenticated user)
    /api/v1/planners/<id>/     — GET: single planner profile
    Only a user with role=planner can create/update their own profile.
    """
    queryset = PlannerProfile.objects.all().order_by("-created_at")
    serializer_class = PlannerProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category", "city"]
    search_fields = ["business_name", "city"]

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsPlanner()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PackageViewSet(viewsets.ModelViewSet):
    """
    /api/v1/planners/packages/ — a planner manages their own packages here.
    """
    serializer_class = PackageSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlanner]

    def get_queryset(self):
        return Package.objects.filter(planner__user=self.request.user)

    def perform_create(self, serializer):
        profile = self.request.user.planner_profile
        serializer.save(planner=profile)
