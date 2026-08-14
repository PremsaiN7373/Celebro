from rest_framework import viewsets, permissions
from .models import TimelineItem
from .serializers import TimelineItemSerializer


class TimelineItemViewSet(viewsets.ModelViewSet):
    """
    /api/v1/timeline/?event=<id> — timeline items for one event.
    Only the event's owning customer can see/manage its timeline.
    """
    serializer_class = TimelineItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = TimelineItem.objects.filter(event__customer=self.request.user)
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs
