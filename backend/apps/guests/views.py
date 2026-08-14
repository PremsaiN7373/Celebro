from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import Guest
from .serializers import GuestSerializer


class GuestViewSet(viewsets.ModelViewSet):
    """
    /api/v1/guests/?event=<id>  — list guests for a specific event
    /api/v1/guests/             — create a guest (event id in body)
    Visible to the event's owning customer, or anyone added as a
    collaborator on that event (see apps.events.models.EventCollaborator).
    """
    serializer_class = GuestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Guest.objects.filter(
            Q(event__customer=user) | Q(event__collaborators__user=user)
        ).distinct()
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs.order_by("name")
