from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model so 'role' is a first-class field from day one —
    swapping this in later would require a painful migration.
    """
    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        PLANNER = "planner", "Planner"
        ADMIN = "admin", "Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    phone_number = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} ({self.role})"
