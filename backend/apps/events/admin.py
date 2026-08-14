from django.contrib import admin
from .models import Event, EventPhoto, EventTemplate, EventCollaborator

admin.site.register(Event)
admin.site.register(EventPhoto)

admin.site.register(EventTemplate)
admin.site.register(EventCollaborator)
