from django.db import models
from apps.events.models import Event


class BudgetItem(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="budget_items")
    category = models.CharField(max_length=100)
    planned_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    actual_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.event.name}"
