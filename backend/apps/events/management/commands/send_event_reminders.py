from django.core.management.base import BaseCommand
from apps.notifications.reminders import send_event_reminders


class Command(BaseCommand):
    help = (
        "Sends email + in-app reminders for events happening in 1 or 3 days. "
        "Safe to run repeatedly — won't double-send reminders on the same day. "
        "Run this manually to test, or wire it into a scheduled task/cron later."
    )

    def handle(self, *args, **options):
        count = send_event_reminders()
        if count == 0:
            self.stdout.write("No reminders needed right now.")
        else:
            self.stdout.write(self.style.SUCCESS(f"Sent {count} reminder(s)."))
