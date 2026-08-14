from rest_framework import viewsets, permissions
from .models import Guest
from .serializers import GuestSerializer


class GuestViewSet(viewsets.ModelViewSet):
    """
    /api/v1/guests/?event=<id>  — list guests for a specific event
    /api/v1/guests/             — create a guest (event id in body)
    Only the event's owning customer can see/manage its guests.
    """
    serializer_class = GuestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Guest.objects.filter(event__customer=self.request.user)
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs.order_by("name")
