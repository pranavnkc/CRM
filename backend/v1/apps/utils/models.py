from django.db import models
from django.utils.translation import gettext_lazy as _


class IPAddress(models.Model):
    ip = models.GenericIPAddressField(_('Ip Address'), unique=True)
    active = models.BooleanField(_('Active'), default=False)
    description = models.TextField(_('Description'), null=True, blank=True)
