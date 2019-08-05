from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response
from . import serializers
from . import models


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.LeadSerializer
    queryset = models.Lead.objects.all().order_by('created_on')

    @list_route(url_path='status', methods=('get', ))
    def status(self, request):
        return Response(models.Status.objects.values())
