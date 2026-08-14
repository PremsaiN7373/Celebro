from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import ChatMessage
from .serializers import ChatMessageSerializer


class ChatMessageViewSet(viewsets.ModelViewSet):
    """
    /api/v1/chat/?booking=<id> — message history for one booking.
    Only the two parties on the booking (the event's customer, or the
    planner) can read/send messages here. New messages also get pushed
    live over the booking's WebSocket group from the frontend after
    a successful POST.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = ChatMessage.objects.filter(
            Q(booking__event__customer=user) | Q(booking__planner__user=user)
        )
        booking_id = self.request.query_params.get("booking")
        if booking_id:
            qs = qs.filter(booking_id=booking_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
