from rest_framework import viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from v1.apps.utils.pagination import StandardResultsSetPagination
from . import serializers
from . import models

class LeadViewSet(viewsets.ModelViewSet):

    serializer_class = serializers.LeadSerializer
    queryset = models.Lead.objects.all().select_related('assigned_to').order_by('created_on')
    pagination_class = StandardResultsSetPagination
    def get_queryset(self):
        if self.request.user.groups.filter(name='sales-person').exists():
            return self.queryset.filter(assigned_to=self.request.user)
        return self.queryset
    
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
        
    @list_route(url_path='assign', methods=('post',))
    def assign(self, request):
        leads =self.queryset.filter(id__in=request.data.get('leads', []))
        assinee = self.request.data.get('assignee')
        if assinee:
            leads.update(assigned_to_id=assinee)
        return Response()
