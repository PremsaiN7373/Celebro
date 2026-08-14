from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import BudgetItem
from .serializers import BudgetItemSerializer


class BudgetItemViewSet(viewsets.ModelViewSet):
    """
    /api/v1/budget/?event=<id> — budget line items for one event.
    Visible to the event's owning customer, or anyone added as a
    collaborator on that event (see apps.events.models.EventCollaborator).
    """
    serializer_class = BudgetItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = BudgetItem.objects.filter(
            Q(event__customer=user) | Q(event__collaborators__user=user)
        ).distinct()
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs.order_by("category")
