from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.users.permissions import IsAdminRole
from apps.planners.models import PlannerProfile
from apps.events.models import Event
from apps.bookings.models import Booking
from apps.payments.models import Payment
from .serializers import AdminUserSerializer, AdminPlannerSerializer

User = get_user_model()


class AdminUserListView(generics.ListAPIView):
    """GET /api/v1/admin-panel/users/ — all platform users, admin only."""
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    queryset = User.objects.all().order_by("-date_joined")


class AdminToggleUserActiveView(APIView):
    """POST /api/v1/admin-panel/users/<id>/toggle-active/ — suspend/reactivate a user."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        user = User.objects.get(pk=pk)
        user.is_active = not user.is_active
        user.save()
        return Response(AdminUserSerializer(user).data)


class AdminPlannerListView(generics.ListAPIView):
    """GET /api/v1/admin-panel/planners/ — all planner profiles, admin only."""
    serializer_class = AdminPlannerSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    queryset = PlannerProfile.objects.all().order_by("-created_at")


class AdminVerifyPlannerView(APIView):
    """POST /api/v1/admin-panel/planners/<id>/verify/ — approve a planner's verification."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        planner = PlannerProfile.objects.get(pk=pk)
        planner.is_verified = True
        planner.save()
        return Response(AdminPlannerSerializer(planner).data)


class AdminUnverifyPlannerView(APIView):
    """POST /api/v1/admin-panel/planners/<id>/unverify/ — revoke a planner's verification."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        planner = PlannerProfile.objects.get(pk=pk)
        planner.is_verified = False
        planner.save()
        return Response(AdminPlannerSerializer(planner).data)


class AdminStatsView(APIView):
    """GET /api/v1/admin-panel/stats/ — platform-wide summary numbers."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        thirty_days_ago = timezone.now() - timedelta(days=30)

        total_revenue = Payment.objects.filter(status="paid").aggregate(
            total=Sum("amount")
        )["total"] or 0

        return Response({
            "total_users": User.objects.count(),
            "total_customers": User.objects.filter(role="customer").count(),
            "total_planners": User.objects.filter(role="planner").count(),
            "verified_planners": PlannerProfile.objects.filter(is_verified=True).count(),
            "pending_verifications": PlannerProfile.objects.filter(is_verified=False).count(),
            "total_events": Event.objects.count(),
            "total_bookings": Booking.objects.count(),
            "bookings_by_status": list(
                Booking.objects.values("status").annotate(count=Count("id"))
            ),
            "total_revenue": total_revenue,
            "new_users_last_30_days": User.objects.filter(
                date_joined__gte=thirty_days_ago
            ).count(),
        })
