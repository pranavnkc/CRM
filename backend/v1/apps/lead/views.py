from rest_framework import viewsets
from rest_framework import permissions
from . import serializers
from . import models


class LeadViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.LeadSerializer
    queryset = models.Lead.objects.all().order_by('created_on')
