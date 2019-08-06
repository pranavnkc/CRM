from rest_framework import viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from . import serializers
from . import models


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.LeadSerializer
    queryset = models.Lead.objects.all().order_by('created_on')

    @list_route(url_path='status', methods=('get', ))
    def status(self, request):
        return Response(models.Status.objects.values())

    @detail_route(url_path='comment', methods=('post','get'))
    def comment(self, request, pk):
        instance = self.get_object()
        if request.method.lower() == 'get':
            return Response(serializers.CommentSerializer(instance.comments.select_related('created_by').order_by('created_on'), many=True).data)
        else:
            ser = serializers.CommentSerializer(data=request.data)
            ser.is_valid(raise_exception=True)
            ser.validated_data['lead'] = instance
            ser.validated_data['created_by'] = request.user
            ser.save()
            return Response(ser.data)
