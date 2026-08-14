from django.urls import path
from .views import InvitationDetailView, PublicInvitationView, PublicRsvpView

urlpatterns = [
    path("event/<int:event_id>/", InvitationDetailView.as_view(), name="invitation-detail"),
    path("public/<uuid:invite_uuid>/", PublicInvitationView.as_view(), name="invitation-public"),
    path("public/<uuid:invite_uuid>/rsvp/", PublicRsvpView.as_view(), name="invitation-rsvp"),
]
