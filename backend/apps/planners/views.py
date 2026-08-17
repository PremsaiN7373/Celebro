from rest_framework import viewsets, permissions, filters, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.permissions import IsPlanner
from .models import PlannerProfile, Package, SavedPlanner, BlockedDate, PortfolioPhoto
from .serializers import (
    PlannerProfileSerializer, PackageSerializer, SavedPlannerSerializer,
    BlockedDateSerializer, PortfolioPhotoSerializer,
)


class PlannerProfileViewSet(viewsets.ModelViewSet):
    """
    /api/v1/planners/          — GET: public marketplace listing (any authenticated user)
    /api/v1/planners/<id>/     — GET: single planner profile
    /api/v1/planners/<id>/save/ — POST: toggle wishlist for the current customer
    /api/v1/planners/<id>/availability/ — GET: this planner's blocked dates (public, read-only)
    Only a user with role=planner can create/update their own profile.
    """
    queryset = PlannerProfile.objects.all().order_by("-is_featured", "-created_at")
    serializer_class = PlannerProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category", "city"]
    search_fields = ["business_name", "city"]

    def get_queryset(self):
        qs = PlannerProfile.objects.all().order_by("-is_featured", "-created_at")

        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        min_rating = self.request.query_params.get("min_rating")
        available_date = self.request.query_params.get("available_date")

        if min_price:
            qs = qs.filter(packages__price__gte=min_price)
        if max_price:
            qs = qs.filter(packages__price__lte=max_price)
        if min_rating:
            from django.db.models import Avg
            qs = qs.annotate(avg_rating=Avg("bookings__review__rating")).filter(
                avg_rating__gte=min_rating
            )
        if available_date:
            qs = qs.exclude(blocked_dates__date=available_date)

        return qs.distinct()

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsPlanner()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def save(self, request, pk=None):
        """Toggle: adds to wishlist if not saved, removes if already saved."""
        planner = self.get_object()
        existing = SavedPlanner.objects.filter(user=request.user, planner=planner).first()
        if existing:
            existing.delete()
            saved = False
        else:
            SavedPlanner.objects.create(user=request.user, planner=planner)
            saved = True
        return Response({"saved": saved})

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def availability(self, request, pk=None):
        """Read-only: which dates this planner has already blocked off."""
        planner = self.get_object()
        dates = planner.blocked_dates.values_list("date", flat=True)
        return Response({"blocked_dates": [d.isoformat() for d in dates]})


class SavedPlannersListView(generics.ListAPIView):
    """GET /api/v1/planners/saved/ — the current customer's wishlist."""
    serializer_class = SavedPlannerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedPlanner.objects.filter(user=self.request.user).select_related("planner")


class MyPlannerProfileView(generics.RetrieveUpdateAPIView):
    """
    /api/v1/planners/me/ — GET/PATCH the logged-in planner's OWN profile,
    never anyone else's. Creates an empty profile on first access so a
    brand-new planner always has something to edit, instead of the
    frontend having to guess or fall back to some other planner's listing.
    """
    serializer_class = PlannerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlanner]

    def get_object(self):
        profile, _ = PlannerProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                "business_name": "",
                "category": PlannerProfile.Category.DECORATION,
                "city": "",
            },
        )
        return profile


class BlockedDateViewSet(viewsets.ModelViewSet):
    """
    /api/v1/planners/blocked-dates/ — a planner manages their own
    unavailable dates here. Scoped strictly to their own PlannerProfile.
    """
    serializer_class = BlockedDateSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlanner]

    def get_queryset(self):
        return BlockedDate.objects.filter(planner__user=self.request.user)

    def perform_create(self, serializer):
        profile = self.request.user.planner_profile
        serializer.save(planner=profile)


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


class PortfolioPhotoViewSet(viewsets.ModelViewSet):
    """
    /api/v1/planners/portfolio/ — a planner manages their own showcase
    photos here. Shown publicly on their profile via the nested
    portfolio_photos field on PlannerProfileSerializer.
    """
    serializer_class = PortfolioPhotoSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlanner]

    def get_queryset(self):
        return PortfolioPhoto.objects.filter(planner__user=self.request.user)

    def perform_create(self, serializer):
        profile = self.request.user.planner_profile
        serializer.save(planner=profile)


from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import uuid
import os

class ImageUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsPlanner]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, format=None):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded"}, status=400)
        
        uploaded_file = request.FILES['file']
        ext = os.path.splitext(uploaded_file.name)[1]
        filename = f"{uuid.uuid4()}{ext}"
        
        # Save file to media/uploads/
        path = default_storage.save(os.path.join('uploads', filename), ContentFile(uploaded_file.read()))
        
        # Build absolute media URL path, e.g., http://localhost:8000/media/uploads/abc.png
        media_path = f"/{settings.MEDIA_URL}{path}"
        if media_path.startswith("//"):
            media_path = media_path.replace("//", "/")
        file_url = request.build_absolute_uri(media_path)
        
        return Response({"url": file_url})
