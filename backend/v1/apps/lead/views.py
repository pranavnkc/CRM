import csv
from django.contrib.postgres.forms import SimpleArrayField
from django.forms import IntegerField, CharField
from django.db.models.functions import Concat
from django.db.models import F, Value, Q
from django.db.models.functions import Lower 
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework import mixins
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response

from v1.apps.utils.pagination import StandardResultsSetPagination
from v1.apps.utils.utils import get_file_name, model_to_dict_v2
from v1.apps.utils.models import Settings
from . import serializers
from . import models
from .filters import LeadFilter, LeadHistoryFilter

class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.LeadSerializer
    queryset = models.Lead.objects.all().select_related('assigned_to').order_by('created_on').distinct()
    pagination_class = StandardResultsSetPagination
    filter_class = LeadFilter

    def get_queryset(self):
        sortBy = self.request.query_params.get('sortBy')
        sortOrder = self.request.query_params.get('sortOrder')
        if sortBy:
            fields = {field.name:type(field) for field in models.Lead._meta.fields}
            fields.update({"callbacks__"+field.name:type(field) for field in models.Callback._meta.fields})
            if fields[sortBy] == 'django.db.models.fields.CharField':
                sortAttr = Lower(self.request.query_params.get('sortBy'))
                sortAttr = getattr(sortAttr, sortOrder)() if hasattr(sortAttr, sortOrder) else sortAttr.asc()
            else:
                sortAttr = sortBy if sortOrder=='asc' else "-"+sortBy
            self.queryset = self.queryset.order_by(sortAttr)
        else:
            self.queryset = self.queryset.order_by('-id')
        if self.request.user.groups.filter(name='sales-person').exists():
            return self.queryset.filter(assigned_to=self.request.user)
        if self.request.user.groups.filter(name='stage-1').exists():
            if self.request.query_params.get('include_raw_leads'):
                return self.queryset.filter(submission_status='raw')
            return self.queryset.filter(assigned_to=self.request.user)  
        return self.queryset
    
    @list_route(url_path='status', methods=('get', ), permission_classes=[permissions.AllowAny])
    def status(self, request):
        return Response({
            'status':models.Status.objects.values(),
            'submission_status':models.SubmissionStatus.objects.values(),
            'lead_actions':[{'key':la[0], 'display':la[1]} for  la in models.LeadHistory.ACTION_CHOICES],
            'sold_as_choices':[{'key':sac[0], 'display':sac[1]} for  sac in models.LeadSale.SOLD_AS_CHOICES],
            'company_type_choices':[{'key':ctc[0], 'display':ctc[1]} for ctc in models.LeadSale.COMPANY_TYPE_CHOICES],
            'renewal_choices':[{'key':rc[0], 'display':rc[1]} for  rc in models.LeadSale.RENEWAL_CHOICES],
            'supplier_choices':[{'key':sn, 'display':sn} for sn in Settings.objects.first().supplier_names]
        })
    @detail_route(url_path='submit-for-pr', methods=('patch',))
    def pr_submission(self, request, pk):
        instance = self.get_object()
        data = {"lead":instance.id, "submitted_by":request.user.id, "comment": request.data.get('comment'), "is_hot_transfer":request.data.get('is_hot_transfer', False)}
        ser = serializers.ProspectLeadSerializer(data=data, context={"request":request})
        ser.is_valid(raise_exception=True)
        print(ser.validated_data)
        ser.save()
        return Response()

    @detail_route(url_path='submit-for-sale', methods=('patch',))
    def sale_submission(self, request, pk):
        instance = self.get_object()
        lead_ser = serializers.LeadSerializer(instance, data=request.data.pop('lead'), context={"request":request})
        lead_ser.is_valid(raise_exception=True)
        lead_ser.save()
        data = request.data
        data['lead'] = instance.id
        data['sold_by'] = request.user.id
        ser = serializers.LeadSaleSerializer(data=data, context={"request":request})
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response()

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
            last_callback = models.Callback.objects.filter(lead=instance).last()
            if last_callback:
                ser.update(last_callback, ser.validated_data)
            else:
                ser.create(ser.validated_data)
            return Response(ser.data)
        
    @list_route(url_path='assign', methods=('post',))
    def assign(self, request):
        leads =self.queryset.filter(id__in=request.data.get('leads', []))
        if any([lead.is_locked for lead in leads]):
            return Response({"locked":"Can't assign locked lead"}, status=400)
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
    
    @list_route(url_path='lead-export', methods=('get',))
    def lead_export(self, request):
        leads = request.query_params.get('leads', [])
        fields = request.query_params.get('fields', [])
        leads_field = SimpleArrayField(IntegerField())
        leads = leads_field.clean(leads)
        fields = SimpleArrayField(CharField()).clean(fields)
        lead_objs = models.Lead.objects.filter(id__in=leads).annotate(
            full_name=Concat(
                F('first_name'), Value(" "), F('middle_name'), Value(" "), F('last_name'))).order_by('id')
        file_name = get_file_name(file_type='lead_export')
        print(fields)
        with open(file_name, 'w', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fields)
            writer.writeheader()
            for l in lead_objs:
                row = {}
                for field in fields:
                    if field in ['latest_callback']:
                         row['latest_callback'] = getattr(models.Callback.objects.filter(lead=l).last(), 'datetime', '')
                    else:
                        row[field] = getattr(l, field)
                writer.writerow(row)
        return Response({'file':file_name})


    
    @detail_route(url_path='history', methods=('post','get'))
    def history(self, request, pk):
        instance = self.get_object()
        self.filter_class = LeadHistoryFilter
        return self.get_paginated_response(serializers.LeadHistorySerializer(self.paginate_queryset(self.filter_queryset(instance.lead_history.all().select_related('created_by').order_by('-created_on'))), many=True).data)
    

class ReportViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = serializers.LeadHistorySerializer
    pagination_class = StandardResultsSetPagination
    queryset = models.LeadHistory.objects.all()
    filter_class = LeadHistoryFilter
    def get_queryset(self):
        if self.request.user.groups.filter(name='admin').exists():
            return models.LeadHistory.objects.filter(lead__isnull=False).select_related('created_by').order_by('-created_on')
        filter_q = Q(created_by=self.request.user) | Q(created_by__parent=self.request.user.id) | Q(created_by__parent__parent=self.request.user.id)
        return models.LeadHistory.objects.filter(lead__isnull=False).filter(filter_q).select_related('created_by').order_by('created_on')
    
