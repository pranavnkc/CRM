from django.contrib import admin
from . import models
# Register your models here.
admin.site.register(models.Status)
admin.site.register(models.SubmissionStatus)
admin.site.register(models.Lead)
admin.site.register(models.LeadHistory)
admin.site.register(models.LeadSale)
admin.site.register(models.ProspectLead)
admin.site.register(models.Callback)
admin.site.register(models.Comment)
