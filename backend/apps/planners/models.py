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

    class SubscriptionTier(models.TextChoices):
        FREE = "free", "Free"
        PREMIUM = "premium", "Premium"

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
    is_featured = models.BooleanField(
        default=False,
        help_text="Featured planners are boosted to the top of marketplace search results.",
    )
    subscription_tier = models.CharField(
        max_length=20, choices=SubscriptionTier.choices, default=SubscriptionTier.FREE
    )
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
    image_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} — {self.planner.business_name}"


class SavedPlanner(models.Model):
    """A customer's wishlist entry — bookmarking a planner to consider later."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_planners"
    )
    planner = models.ForeignKey(
        PlannerProfile, on_delete=models.CASCADE, related_name="saved_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "planner")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} saved {self.planner.business_name}"


class BlockedDate(models.Model):
    """A date a planner has marked as unavailable, so customers can see
    it before requesting a booking around that date."""
    planner = models.ForeignKey(
        PlannerProfile, on_delete=models.CASCADE, related_name="blocked_dates"
    )
    date = models.DateField()
    reason = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("planner", "date")
        ordering = ["date"]

    def __str__(self):
        return f"{self.planner.business_name} blocked {self.date}"


class PortfolioPhoto(models.Model):
    """A planner's showcase photo — past work, distinct from any single
    event's Gallery. Shown on the planner's public profile."""
    planner = models.ForeignKey(
        PlannerProfile, on_delete=models.CASCADE, related_name="portfolio_photos"
    )
    image_url = models.URLField()
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Portfolio photo for {self.planner.business_name}"
