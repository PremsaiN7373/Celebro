"""WSGI config for Celebro — used by Gunicorn in production for plain HTTP."""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "celebro.settings.prod")
application = get_wsgi_application()
