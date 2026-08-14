from rest_framework import viewsets, permissions
from apps.users.permissions import IsCustomer
from .models import Event, EventPhoto
from .serializers import EventSerializer, EventPhotoSerializer


class EventViewSet(viewsets.ModelViewSet):
    """
    /api/v1/events/  — list/create
    /api/v1/events/<id>/ — retrieve/update/delete
    Only customers can create events; everyone authenticated can view
    their own.
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsCustomer()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Event.objects.filter(customer=self.request.user).order_by("-date")

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)


class EventPhotoViewSet(viewsets.ModelViewSet):
    """
    /api/v1/events/photos/?event=<id> — gallery photos for one event.
    Only the event's owning customer can manage its gallery for now.
    """
    serializer_class = EventPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = EventPhoto.objects.filter(event__customer=self.request.user)
        event_id = self.request.query_params.get("event")
        if event_id:
            qs = qs.filter(event_id=event_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
