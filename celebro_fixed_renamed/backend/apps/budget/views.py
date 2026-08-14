from rest_framework import viewsets, permissions
from .models import BudgetItem
from .serializers import BudgetItemSerializer


class BudgetItemViewSet(viewsets.ModelViewSet):
    """
    /api/v1/budget/?event=<id> — budget line items for one event.
    Only the event's owning customer can see/manage its budget.
    """
    serializer_class = BudgetItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = BudgetItem.objects.filter(event__customer=self.request.user)
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs.order_by("category")
