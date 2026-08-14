from django.contrib import admin
from .models import Notification, FCMDevice

admin.site.register(Notification)
admin.site.register(FCMDevice)
