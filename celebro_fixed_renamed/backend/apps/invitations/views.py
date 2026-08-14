from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.guests.models import Guest
from .models import Invitation
from .serializers import InvitationSerializer, PublicEventSerializer, RsvpSerializer


class InvitationDetailView(APIView):
    """
    GET  /api/v1/invitations/event/<event_id>/  — get (or note none exists) for the owner
    POST /api/v1/invitations/event/<event_id>/  — create the invitation for that event
    Owner (the event's customer) only.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, event_id):
        invitation = Invitation.objects.filter(
            event_id=event_id, event__customer=request.user
        ).first()
        if not invitation:
            return Response({"detail": "No invitation created yet."}, status=404)
        return Response(InvitationSerializer(invitation).data)

    def post(self, request, event_id):
        from apps.events.models import Event
        event = get_object_or_404(Event, id=event_id, customer=request.user)
        invitation, _ = Invitation.objects.get_or_create(
            event=event, defaults={"custom_message": request.data.get("custom_message", "")}
        )
        return Response(InvitationSerializer(invitation).data, status=201)


class PublicInvitationView(APIView):
    """
    GET /api/v1/invitations/public/<uuid>/ — anyone with the link can view
    the event's public details, no login required.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, invite_uuid):
        invitation = get_object_or_404(Invitation, uuid=invite_uuid)
        event = invitation.event
        data = {
            "name": event.name,
            "event_type": event.get_event_type_display(),
            "date": event.date,
            "time": event.time,
            "venue": event.venue,
            "theme": event.theme,
            "custom_message": invitation.custom_message,
        }
        return Response(PublicEventSerializer(data).data)


class PublicRsvpView(APIView):
    """
    POST /api/v1/invitations/public/<uuid>/rsvp/ — a guest RSVPs by name,
    no login required. Matches an existing guest by name (case-insensitive)
    on that event, or creates a new guest entry.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, invite_uuid):
        invitation = get_object_or_404(Invitation, uuid=invite_uuid)
        serializer = RsvpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        d = serializer.validated_data

        guest, created = Guest.objects.get_or_create(
            event=invitation.event,
            name__iexact=d["name"],
            defaults={"name": d["name"]},
        )
        guest.contact = d.get("contact", guest.contact)
        guest.rsvp_status = d["rsvp_status"]
        guest.save()

        return Response({
            "detail": "RSVP recorded.",
            "name": guest.name,
            "rsvp_status": guest.rsvp_status,
        }, status=200 if not created else 201)
