from rest_framework import viewsets, permissions
from apps.users.permissions import IsCustomer
from apps.notifications.services import notify
from .models import Review
from .serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """
    /api/v1/reviews/?planner=<id>  — public reviews for a planner (any authenticated user)
    /api/v1/reviews/                — POST: customer reviews a completed booking
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Review.objects.all()
        planner_id = self.request.query_params.get("planner")
        if planner_id:
            qs = qs.filter(booking__planner_id=planner_id)
        return qs

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsCustomer()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        review = serializer.save(customer=self.request.user)
        notify(
            review.booking.planner.user,
            "new_review",
            f"You received a {review.rating}-star review",
            link="/planner-profile",
        )
