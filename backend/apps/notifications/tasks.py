from celery import shared_task
from .reminders import send_event_reminders as _send_event_reminders


@shared_task
def send_event_reminders_task():
    """
    Run this daily via Celery Beat for fully automatic reminders, e.g.:
        CELERY_BEAT_SCHEDULE = {
            "event-reminders-daily": {
                "task": "apps.notifications.tasks.send_event_reminders_task",
                "schedule": crontab(hour=9, minute=0),
            }
        }
    Not required for testing — `python manage.py send_event_reminders`
    calls the same underlying logic without needing Celery running at all.
    """
    return _send_event_reminders()
