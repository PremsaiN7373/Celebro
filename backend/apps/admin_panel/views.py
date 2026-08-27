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
from apps.payments.models import Payment, PaymentDispute
from .serializers import AdminUserSerializer, AdminPlannerSerializer

User = get_user_model()


class AdminUserListView(generics.ListAPIView):
    """GET /api/v1/admin-panel/users/ — all platform users, admin only."""
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    queryset = User.objects.all().order_by("-date_joined")


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET / PUT / PATCH / DELETE /api/v1/admin-panel/users/<id>/ — retrieve, update, or delete a user."""
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    queryset = User.objects.all()


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


class AdminToggleFeaturedPlannerView(APIView):
    """
    POST /api/v1/admin-panel/planners/<id>/toggle-featured/
    Featured planners are boosted to the top of Marketplace search
    results — the revenue lever for a "featured listing" plan. There's
    no self-serve payment flow for this yet; an admin grants it manually
    (e.g. after an offline arrangement or a future subscription flow).
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        planner = PlannerProfile.objects.get(pk=pk)
        planner.is_featured = not planner.is_featured
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

        total_commission = Payment.objects.filter(status="paid").aggregate(
            total=Sum("platform_commission_amount")
        )["total"] or 0

        return Response({
            "featured_planners": PlannerProfile.objects.filter(is_featured=True).count(),
            "total_commission_earned": total_commission,
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


class AdminDisputeListView(generics.ListAPIView):
    """GET /api/v1/admin-panel/disputes/ — all payment disputes, admin only."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        return PaymentDispute.objects.select_related(
            "payment__booking__event", "payment__booking__planner"
        )

    def list(self, request, *args, **kwargs):
        from apps.payments.serializers import PaymentDisputeSerializer
        return Response(PaymentDisputeSerializer(self.get_queryset(), many=True).data)


class AdminResolveDisputeView(APIView):
    """POST /api/v1/admin-panel/disputes/<id>/resolve/ — mark resolved (refunded)."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        from apps.payments.serializers import PaymentDisputeSerializer
        dispute = PaymentDispute.objects.get(pk=pk)
        dispute.status = PaymentDispute.Status.RESOLVED
        dispute.admin_notes = request.data.get("admin_notes", dispute.admin_notes)
        dispute.resolved_at = timezone.now()
        dispute.save()
        dispute.payment.status = Payment.Status.REFUNDED
        dispute.payment.save()
        return Response(PaymentDisputeSerializer(dispute).data)


class AdminRejectDisputeView(APIView):
    """POST /api/v1/admin-panel/disputes/<id>/reject/ — mark rejected, no refund."""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        from apps.payments.serializers import PaymentDisputeSerializer
        dispute = PaymentDispute.objects.get(pk=pk)
        dispute.status = PaymentDispute.Status.REJECTED
        dispute.admin_notes = request.data.get("admin_notes", dispute.admin_notes)
        dispute.resolved_at = timezone.now()
        dispute.save()
        return Response(PaymentDisputeSerializer(dispute).data)
