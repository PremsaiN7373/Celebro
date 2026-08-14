from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Event, EventPhoto, EventCollaborator, EventTemplate
from .serializers import (
    EventSerializer, EventPhotoSerializer, EventCollaboratorSerializer,
    EventTemplateSerializer,
)
from .checklists import get_default_checklist

User = get_user_model()


class EventViewSet(viewsets.ModelViewSet):
    """
    /api/v1/events/  — list/create
    /api/v1/events/<id>/ — retrieve/update/delete
    /api/v1/events/<id>/collaborators/ — GET list, POST invite-by-email
    Any authenticated user (customer or planner) can create their own
    event — a planner celebrating something themselves is just as valid
    a use case as a customer. A collaborator (see EventCollaborator)
    can also see the event here and manage its Guests/Budget — not every
    tab, that's a deliberately scoped MVP.
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Event.objects.filter(
            Q(customer=user) | Q(collaborators__user=user)
        ).distinct().order_by("-date")

    def perform_create(self, serializer):
        event = serializer.save(customer=self.request.user)
        self._seed_default_timeline(event)
        self._maybe_seed_from_template(event)

    def _maybe_seed_from_template(self, event):
        """If the request included a template_id, pre-fill this event's
        Budget tab with that template's saved categories/planned amounts."""
        template_id = self.request.data.get("template_id")
        if not template_id:
            return
        from apps.budget.models import BudgetItem

        try:
            template = EventTemplate.objects.get(id=template_id, user=self.request.user)
        except EventTemplate.DoesNotExist:
            return

        BudgetItem.objects.bulk_create([
            BudgetItem(
                event=event,
                category=item.get("category", ""),
                planned_amount=item.get("planned_amount", 0),
            )
            for item in template.budget_categories
        ])

    def _seed_default_timeline(self, event):
        """
        Auto-fills the Timeline tab with sensible default milestones for
        the event's type, so it isn't blank on day one. Imported here
        (not at module level) to avoid a circular import between the
        events and timeline apps.
        """
        from apps.timeline.models import TimelineItem

        checklist = get_default_checklist(event.event_type)
        TimelineItem.objects.bulk_create([
            TimelineItem(event=event, label=label, order=i)
            for i, label in enumerate(checklist)
        ])

    @action(detail=True, methods=["get", "post"], permission_classes=[permissions.IsAuthenticated])
    def collaborators(self, request, pk=None):
        event = self.get_object()

        if request.method == "GET":
            collabs = event.collaborators.select_related("user")
            return Response(EventCollaboratorSerializer(collabs, many=True).data)

        # POST — only the event's owner can invite someone
        if event.customer_id != request.user.id:
            return Response({"detail": "Only the event owner can add collaborators."}, status=403)

        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response({"detail": "Email is required."}, status=400)

        try:
            target = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"detail": "No Celebro account found with that email."}, status=404)

        if target.id == event.customer_id:
            return Response({"detail": "That's already the event owner."}, status=400)

        collab, created = EventCollaborator.objects.get_or_create(event=event, user=target)
        if not created:
            return Response({"detail": "Already a collaborator."}, status=400)

        return Response(EventCollaboratorSerializer(collab).data, status=201)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def save_as_template(self, request, pk=None):
        """
        POST /api/v1/events/<id>/save_as_template/
        Body: { "name": "My birthday template" }
        Captures this event's type/theme/notes and its budget categories
        (labels + planned amounts, not actuals) as a reusable template.
        """
        event = self.get_object()
        if event.customer_id != request.user.id:
            return Response({"detail": "Only the event owner can save it as a template."}, status=403)

        name = request.data.get("name", "").strip() or f"{event.name} template"
        budget_categories = [
            {"category": item.category, "planned_amount": str(item.planned_amount)}
            for item in event.budget_items.all()
        ]

        template = EventTemplate.objects.create(
            user=request.user,
            name=name,
            event_type=event.event_type,
            theme=event.theme,
            notes=event.notes,
            budget_categories=budget_categories,
        )
        return Response(EventTemplateSerializer(template).data, status=201)


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


class EventTemplateViewSet(viewsets.ModelViewSet):
    """
    /api/v1/events/templates/ — a customer's own saved event templates.
    """
    serializer_class = EventTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EventTemplate.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
