from django.contrib import admin
from . import models
admin.site.register(models.IPAddress)
admin.site.register(models.Settings)
admin.site.register(models.BusinessNames)
