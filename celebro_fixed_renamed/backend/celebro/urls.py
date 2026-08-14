"""
Celebro root URL configuration.
Each domain app owns its own urls.py; this file just mounts them under
/api/v1/<domain>/ so the API surface is versioned from day one.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path("api/v1/auth/", include("apps.users.urls")),
    path("api/v1/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Domain modules
    path("api/v1/planners/", include("apps.planners.urls")),
    path("api/v1/events/", include("apps.events.urls")),
    path("api/v1/bookings/", include("apps.bookings.urls")),
    path("api/v1/guests/", include("apps.guests.urls")),
    path("api/v1/invitations/", include("apps.invitations.urls")),
    path("api/v1/budget/", include("apps.budget.urls")),
    path("api/v1/timeline/", include("apps.timeline.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
    path("api/v1/chat/", include("apps.chat.urls")),
    path("api/v1/reviews/", include("apps.reviews.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/admin-panel/", include("apps.admin_panel.urls")),
    path("api/v1/analytics/", include("apps.analytics.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
