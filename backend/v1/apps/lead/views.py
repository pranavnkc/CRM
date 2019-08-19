import csv
from django.contrib.postgres.forms import SimpleArrayField
from django.forms import IntegerField
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from v1.apps.utils.pagination import StandardResultsSetPagination
from v1.apps.utils.utils import get_file_name
from . import serializers
from . import models
from .filters import LeadFilter
class LeadViewSet(viewsets.ModelViewSet):

    serializer_class = serializers.LeadSerializer
    queryset = models.Lead.objects.all().select_related('assigned_to').order_by('created_on')
    pagination_class = StandardResultsSetPagination
    filter_class = LeadFilter
    def get_queryset(self):
        if self.request.user.groups.filter(name='sales-person').exists():
            return self.queryset.filter(assigned_to=self.request.user)
        return self.queryset
    
    @list_route(url_path='status', methods=('get', ), permission_classes=[permissions.AllowAny])
    def status(self, request):
        return Response(models.Status.objects.values())

    @detail_route(url_path='comment', methods=('post','get'))
    def comment(self, request, pk):
        instance = self.get_object()
        if request.method.lower() == 'get':
            return Response(serializers.CommentSerializer(instance.comments.select_related('created_by').order_by('created_on'), many=True).data)
        else:
            data = request.data
            data['created_by'] = request.user.id
            data['lead'] = instance.id
            ser = serializers.CommentSerializer(data=data, context={'request':request})
            ser.is_valid(raise_exception=True)
            ser.save()
            return Response(ser.data)

    @detail_route(url_path='callback', methods=('post','get'))
    def callback(self, request, pk):
        instance = self.get_object()
        if request.method.lower() == 'get':
            return Response(serializers.CallbackSerializer(instance.comments.select_related('created_by').order_by('created_on'), many=True).data)
        else:
            data = request.data
            data['lead'] = instance.id
            data['scheduled_by'] = request.user.id
            ser = serializers.CallbackSerializer(data=data, context={'request':request})
            ser.is_valid(raise_exception=True)
            ser.save()
            return Response(ser.data)
        
    @list_route(url_path='assign', methods=('post',))
    def assign(self, request):
        leads =self.queryset.filter(id__in=request.data.get('leads', []))
        history_objs = []
        assinee = self.request.data.get('assignee')
        if assinee:
            for l in leads:
                history_obj = models.LeadHistory(lead=l, action=models.LeadHistory.ACTION_ASSIGN_CHANGED, created_by=request.user)
                history_obj.old_instance_meta = {"assinee":l.assigned_to_id}
                history_obj.new_instance_meta = {"assinee":assinee}
                history_objs.append(history_obj)
            leads.update(assigned_to_id=assinee)
            models.LeadHistory.objects.bulk_create(history_objs)
        return Response()

    @list_route(url_path='bulk-create', methods=('post',))
    def bulk_create(self, request):
        ser = serializers.BulkLeadCreateSerrializer(data=request.data, context={"request":request})
        ser.is_valid(raise_exception=True)
        ser.create(ser.validated_data)
        return Response()
    
    @list_route(url_path='history', methods=('get',))
    def history(self, request):
        leads = request.query_params.get('leads', [])
        leads_field = SimpleArrayField(IntegerField())
        leads = leads_field.clean(leads)
        history_objs = models.LeadHistory.objects.filter(lead_id__in=leads).order_by('lead_id', '-created_on')
        file_name = get_file_name(file_type='history_export')
        with open(file_name, 'w', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=['Lead ID', 'Action', 'Action Date', 'Created By', 'From', 'To'])
            writer.writeheader()
            for h in history_objs:
                writer.writerow({
                    "Lead ID":h.lead.id,
                    "Action":h.action,
                    "Action Date":h.created_on,
                    "Created By":h.created_by.get_full_name(),
                    "From":h.old_instance_meta,
                    "To":h.new_instance_meta
                })
        return Response({'file':file_name})


    
