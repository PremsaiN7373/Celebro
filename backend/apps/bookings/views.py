from django.db.models import Q
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from apps.users.permissions import IsCustomer, IsPlanner
from apps.notifications.services import notify
from .models import Booking
from .serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    """
    /api/v1/bookings/?event=<id>  — bookings visible to the current user for one event
    /api/v1/bookings/             — POST: customer creates a booking request
    /api/v1/bookings/<id>/accept/ — POST: planner accepts
    /api/v1/bookings/<id>/reject/ — POST: planner rejects
    /api/v1/bookings/<id>/complete/ — POST: planner marks the booking completed

    A booking is visible only to the event's owning customer, or the
    planner it was sent to.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Booking.objects.filter(Q(event__customer=user) | Q(planner__user=user))
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs.order_by("-created_at")

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsCustomer()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]
        if event.customer != self.request.user:
            raise PermissionDenied("You can only book planners for your own events.")
        booking = serializer.save()
        notify(
            booking.planner.user,
            "booking_requested",
            f"New booking request for {booking.event.name}",
            link=f"/planner-bookings",
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsPlanner])
    def accept(self, request, pk=None):
        booking = self.get_object()
        if booking.planner.user != request.user:
            return Response({"detail": "Not your booking."}, status=403)
        booking.status = Booking.Status.ACCEPTED
        booking.save()
        notify(
            booking.event.customer,
            "booking_accepted",
            f"{booking.planner.business_name} accepted your booking",
            link=f"/events/{booking.event_id}",
        )
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsPlanner])
    def reject(self, request, pk=None):
        booking = self.get_object()
        if booking.planner.user != request.user:
            return Response({"detail": "Not your booking."}, status=403)
        booking.status = Booking.Status.REJECTED
        booking.save()
        notify(
            booking.event.customer,
            "booking_rejected",
            f"{booking.planner.business_name} declined your booking",
            link=f"/events/{booking.event_id}",
        )
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated, IsPlanner])
    def complete(self, request, pk=None):
        booking = self.get_object()
        if booking.planner.user != request.user:
            return Response({"detail": "Not your booking."}, status=403)
        booking.status = Booking.Status.COMPLETED
        booking.save()
        notify(
            booking.event.customer,
            "booking_completed",
            f"Your booking with {booking.planner.business_name} is marked completed — leave a review!",
            link=f"/events/{booking.event_id}",
        )
        return Response(BookingSerializer(booking).data)
