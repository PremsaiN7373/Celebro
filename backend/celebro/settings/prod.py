"""Production settings — DEBUG off, strict allowed hosts, HTTPS/security headers on."""
from .base import *  # noqa: F401,F403

DEBUG = False

ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])  # noqa: F405

# Security hardening (safe defaults behind a reverse proxy terminating TLS)
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"

# WhiteNoise serves static files directly from Django in production without
# needing a separate Nginx static-file config — good enough until traffic
# justifies a CDN. Insert right after SecurityMiddleware per WhiteNoise docs.
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")  # noqa: F405
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Tighter throttling in prod — auth endpoints stay strict, and every other
# endpoint now has a sane default too (dev leaves this unset/generous).
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {  # noqa: F405
    "auth": "10/min",
    "anon": "100/min",
    "user": "1000/min",
}
REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = (  # noqa: F405
    "rest_framework.throttling.ScopedRateThrottle",
    "rest_framework.throttling.AnonRateThrottle",
    "rest_framework.throttling.UserRateThrottle",
)

# --- Logging ------------------------------------------------------------
# Structured console logging — most hosting platforms (Render, Railway,
# Fly.io, etc.) capture stdout/stderr automatically, so this is enough
# without setting up a separate log aggregation service.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name}: {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}

# --- Error tracking (optional) -------------------------------------------
# Set SENTRY_DSN in your environment to start reporting errors to Sentry.
# Safe to leave unset — nothing happens without it. sentry-sdk is already
# in requirements/prod.txt.
SENTRY_DSN = env("SENTRY_DSN", default="")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=False,
    )
