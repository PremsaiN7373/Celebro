from django.contrib import admin
from .models import PlannerProfile, Package, SavedPlanner, BlockedDate, PortfolioPhoto


@admin.register(PlannerProfile)
class PlannerProfileAdmin(admin.ModelAdmin):
    list_display = ("business_name", "category", "city", "is_verified")
    list_filter = ("category", "is_verified", "city")


admin.site.register(Package)
admin.site.register(SavedPlanner)
admin.site.register(BlockedDate)
admin.site.register(PortfolioPhoto)
