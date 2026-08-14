"""
Core logic for event reminders — deliberately plain Python, not tied to
Celery, so it can be called two ways:
  1. `python manage.py send_event_reminders` — works right now, no extra
     process needed, good for local testing.
  2. `send_event_reminders_task.delay()` (see tasks.py) — if you later run
     Celery Beat on a daily schedule for real automatic reminders.
"""
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from apps.events.models import Event
from .models import Notification
from .services import notify
from .whatsapp import send_whatsapp_message

REMINDER_DAYS = [3, 1]  # send a reminder 3 days out, and again 1 day out


def send_event_reminders():
    """
    Finds events happening exactly N days from today (for each N in
    REMINDER_DAYS) and sends the customer an email + in-app notification.
    Skips any event that already got a reminder notification today, so
    running this more than once on the same day never double-sends.
    Returns how many reminders were sent.
    """
    today = timezone.localdate()
    sent_count = 0

    for days_before in REMINDER_DAYS:
        target_date = today + timedelta(days=days_before)
        events = Event.objects.filter(date=target_date).select_related("customer")

        for event in events:
            already_sent_today = Notification.objects.filter(
                user=event.customer,
                kind=Notification.Kind.EVENT_REMINDER,
                link=f"/events/{event.id}",
                created_at__date=today,
            ).exists()
            if already_sent_today:
                continue

            day_word = "day" if days_before == 1 else "days"
            message = f"{event.name} is in {days_before} {day_word} — get ready!"

            notify(
                event.customer,
                Notification.Kind.EVENT_REMINDER,
                message,
                link=f"/events/{event.id}",
            )

            if event.customer.email:
                send_mail(
                    subject=f"Reminder: {event.name} is coming up",
                    message=(
                        f"Hi {event.customer.username},\n\n"
                        f"Just a reminder that '{event.name}' is happening in "
                        f"{days_before} {day_word}, on {event.date}.\n\n"
                        f"Open your event workspace in Celebro to check guests, "
                        f"budget, and bookings.\n\n"
                        f"— Celebro"
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[event.customer.email],
                    fail_silently=True,
                )

            if event.customer.phone_number:
                send_whatsapp_message(
                    event.customer.phone_number,
                    f"🎉 Celebro reminder: '{event.name}' is in {days_before} {day_word}, "
                    f"on {event.date}. Open the app to check guests, budget, and bookings.",
                )

            sent_count += 1

    return sent_count
