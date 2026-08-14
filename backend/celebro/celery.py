"""
Celery app instance. Only needed if you run a Celery worker/beat process —
the reminder feature itself also works via a plain Django management
command (see apps/events/management/commands/send_event_reminders.py),
so you don't need Celery running just to test reminders locally.
"""
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "celebro.settings.dev")

app = Celery("celebro")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
