from django.db import models
from django.conf import settings


class PlannerProfile(models.Model):
    class Category(models.TextChoices):
        DECORATION = "decoration", "Decoration Company"
        BALLOON_DECOR = "balloon_decor", "Balloon Decoration"
        PHOTOGRAPHY = "photography", "Photography"
        VIDEOGRAPHY = "videography", "Videography"
        DJ = "dj", "DJ"
        LIVE_MUSIC = "live_music", "Live Music"
        CATERING = "catering", "Catering"
        CAKE_SHOP = "cake_shop", "Cake Shop"
        MAGICIAN = "magician", "Magician"
        ANCHOR = "anchor", "Anchor"
        LIGHTING = "lighting", "Lighting"
        STAGE_DECOR = "stage_decor", "Stage Decoration"
        ENTERTAINMENT = "entertainment", "Entertainment Company"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="planner_profile"
    )
    business_name = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=Category.choices)
    city = models.CharField(max_length=100)
    about = models.TextField(blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    cover_image_url = models.URLField(blank=True)
    logo_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.business_name} ({self.get_category_display()})"


class Package(models.Model):
    planner = models.ForeignKey(
        PlannerProfile, on_delete=models.CASCADE, related_name="packages"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} — {self.planner.business_name}"
