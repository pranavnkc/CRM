import csv
from django.contrib.postgres.forms import SimpleArrayField
from django.forms import IntegerField, CharField
from django.db.models.functions import Concat
from django.db.models import F, Value, Q
from django.db.models.functions import Lower 
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework import mixins, status
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from v1.apps.utils.pagination import StandardResultsSetPagination
from v1.apps.utils.utils import get_file_name, model_to_dict_v2
from v1.apps.utils.models import Settings
from . import serializers
from . import models
from .filters import LeadFilter, LeadHistoryFilter, ProspectLeadFilter

class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.LeadSerializer
    queryset = models.Lead.objects.all().select_related('assigned_to').order_by('created_on').distinct()
    pagination_class = StandardResultsSetPagination
    filter_class = LeadFilter

    def get_queryset(self):
        sortBy = self.request.query_params.get('sortBy')
        sortOrder = self.request.query_params.get('sortOrder')
        filter_q = Q()
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
            filter_q = Q(assigned_to=self.request.user)
        elif self.request.user.groups.filter(name='stage-1').exists():
            filter_q = Q(assigned_to=self.request.user)
        elif self.request.user.groups.filter(name='quality-analyst').exists():
            filter_q = Q(assigned_to=self.request.user)
        elif self.request.user.groups.filter(name='team-manager').exists():
            filter_q = Q(assigned_to=self.request.user) | Q(assigned_to__parent=self.request.user)
        elif self.request.user.groups.filter(name='company-head').exists():
            filter_q = Q(assigned_to=self.request.user) | Q(assigned_to__parent=self.request.user) | Q(assigned_to__parent__parent=self.request.user)
        if self.request.query_params.get('include_raw_leads'):
            filter_q = filter_q | Q(submission_status='raw')
        if self.request.user.groups.filter(name='admin').exists():
            return self.queryset
        return self.queryset.filter(filter_q)
    
    @list_route(url_path='status', methods=('get', ), permission_classes=[permissions.AllowAny])
    def status(self, request):
        return Response({
            'status':models.Status.objects.values(),
            'submission_status':models.SubmissionStatus.objects.values(),
            'lead_actions':[{'key':la[0], 'display':la[1]} for  la in models.LeadHistory.ACTION_CHOICES],
            'sold_as_choices':[{'key':sac[0], 'display':sac[1]} for  sac in models.LeadSale.SOLD_AS_CHOICES],
            'company_type_choices':[{'key':ctc[0], 'display':ctc[1]} for ctc in models.LeadSale.COMPANY_TYPE_CHOICES],
            'renewal_choices':[{'key':rc[0], 'display':rc[1]} for  rc in models.LeadSale.RENEWAL_CHOICES],
            'supplier_choices':[{'key':sn, 'display':sn} for sn in Settings.objects.first().supplier_names],
            'quality_status_choices':[{'key':qs[0], 'display':qs[1]} for qs in models.LeadSale.QUALITY_STATUS_CHOICES],
            'campaign_choices':[{'key':qs[0], 'display':qs[1]} for qs in get_user_model().CAMPAIGN_CHOICES],
        })
    
    @detail_route(url_path='submit-for-pr', methods=('patch',))
    @transaction.atomic
    def pr_submission(self, request, pk):
        instance = self.get_object()
        data = {"lead":instance.id, "submitted_by":request.user.id, "comment": request.data.get('comment'), "is_hot_transfer":request.data.get('is_hot_transfer', False)}
        ser = serializers.ProspectLeadSerializer(data=data, context={"request":request})
        ser.is_valid(raise_exception=True)
        print(ser.validated_data)
        ser.save()
        instance.submission_status = 'prospect';
        history_obj = models.LeadHistory(lead=instance, action=models.LeadHistory.ACTION_ASSIGN_CHANGED, created_by=request.user)
        history_obj.old_instance_meta = {"assinee":instance.assigned_to_id}
        history_obj.new_instance_meta = {"assinee":request.user.id}
        history_obj.save()
        instance.assigned_to = request.user
        instance.assigned_by = request.user
        instance.assigned_on = timezone.now()
        instance.save()
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
        ser = serializers.LeadSaleSerializer(data=data, context={"request":request, 'from_lead_view':True})
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data)

    
    @list_route(url_path='delete-multiple', methods=('post',))
    def delete_multiple(self, request):
        print(request.data)
        
        leads = request.data.get('leads') 
        qs = self.get_queryset().filter(id__in=leads)
        print(len(leads), len(qs))
        if not len(leads)==len(qs):
            return Response(status=status.HTTP_404_NOT_FOUND)
        qs.delete()
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
    

class LeadSaleViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.LeadSaleSerializer
    pagination_class = StandardResultsSetPagination
    queryset = models.LeadSale.objects.select_related('lead')

    def get_queryset(self, *args, **kwargs):
        qs = models.LeadSale.objects.select_related('lead').order_by('created_on')
        if self.request.user.groups.filter(name='admin').exists():
            return qs
        elif self.request.user.groups.filter(name='company-head').exists():
            return qs.filter(sold_by=self.request.user) | qs.filter(sold_by__parent=self.request.user) | qs.filter(sold_by__parent__parent=self.request.user)
        elif self.request.user.groups.filter(name='team-manger').exists():
            return qs.filter(sold_by=self.request.user) | qs.filter(sold_by__parent=self.request.user)
        elif self.request.user.groups.filter(name='sales-person').exists():
            return qs.filter(sold_by=self.request.user)
        elif self.request.user.groups.filter(name__in=['quality-analyst', 'quality_manager']).exists():
            return qs.filter(quality_status__in=[models.LeadSale.QUALITY_STATUS_HOLD, models.LeadSale.QUALITY_STATUS_REQUIRE_AUDITING, models.LeadSale.QUALITY_STATUS_APPROVED])
        
    @detail_route(url_path='change-status', methods=('patch', ))
    def change_quality_status(self, request, pk):
        instance = self.get_object()
        print(request.data)
        ser = self.serializer_class(instance, data=request.data, context={"request":request}, partial=True)
        ser.is_valid(raise_exception=True)
        instance.quality_status = ser.validated_data['quality_status']
        instance.quality_analyst = request.user
        instance.quality_updated_on  = timezone.now()
        instance.save()
        return Response()

class ProspectLeadViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ProspectLeadSerializer
    pagination_class = StandardResultsSetPagination
    queryset = models.ProspectLead.objects.select_related('lead')
    filter_class = ProspectLeadFilter
    def get_queryset(self, *args, **kwargs):
        if 'pr' in self.request.query_params:
            if int(self.request.query_params.get('pr', 0)):
                qs = models.ProspectLead.objects.filter(is_hot_transfer=False).select_related('lead').order_by('created_on')
            else:
                qs = models.ProspectLead.objects.filter(is_hot_transfer=True).select_related('lead').order_by('created_on')
        else:
            qs = self.queryset
        if self.request.user.groups.filter(name='admin').exists():
            return qs
        elif self.request.user.groups.filter(name='company-head').exists():
            return qs.filter(submitted_by=self.request.user) | qs.filter(submitted_by__parent=self.request.user) | qs.filter(submitted_by__parent__parent=self.request.user)
        elif self.request.user.groups.filter(name='team-manager').exists():
            return qs.filter(submitted_by=self.request.user) | qs.filter(submitted_by__parent=self.request.user)
        elif self.request.user.groups.filter(name__in=['sales-person', 'stage-1']).exists():
            return qs.filter(submitted_by=self.request.user)
        elif self.request.user.groups.filter(name__in=['quality-analyst', 'quality_manager']).exists():
            return qs
        else:
            return []
        
    @detail_route(url_path='change-status', methods=('patch', ))
    def change_quality_status(self, request, pk):
        instance = self.get_object()
        ser = self.serializer_class(instance, data=request.data, context={"request":request}, partial=True)
        ser.is_valid(raise_exception=True)
        print(ser.validated_data)
        instance.quality_status = ser.validated_data['quality_status']
        instance.quality_comment = ser.validated_data['quality_comment']
        instance.quality_analyst = request.user
        instance.quality_updated_on = timezone.now()
        instance.save()
        return Response()

    @list_route(url_path='pr-ht-report', methods=('get',))
    def pr_ht_report(self, request):
        pr_ot_ht =  request.query_params.get('pr', 0)
        file_name = get_file_name(file_type='pr_report' if pr_ot_ht else 'ht_report')
        fields = ["ID", "Source", "Created On", "Status", "Submission Status", "Business Name","Salutation", "First Name","Middle Name", "Last Name", "Phone Number","Email", "Address 1", "Address 2", "Address 3", "Address 4", "City Or Town", "County", "Postcode", "Utility Type", "AMr", "Related Meter", "Current SUpplier", "Contract End Date", "Meter Serial Number", "MPAN/MPRN", "Can Sell Water", "Contract Duration", "S&R3 Status", "Bilge Eac", "IS Locked", "PR Date", "Pr Campaign", "PR Status", "PR BY Username", "Pr By Name","Comment", "Quality Comment"]
        with open(file_name, 'w', newline='') as csvfile:
            qs = self.filter_queryset(self.get_queryset())
            writer = csv.DictWriter(csvfile, fieldnames=fields)
            writer.writeheader()
            for pr in qs:
                row = {
                    "ID":pr.id,
                    "Source":pr.lead.source,
                    "Created On":pr.lead.created_on,
                    "Status":pr.lead.status,
                    "Submission Status":pr.lead.submission_status,
                    "Business Name":pr.lead.busines_name,
                    "Salutation":pr.lead.salutation,
                    "First Name":pr.lead.first_name,
                    "Middle Name":pr.lead.middle_name,
                    "Last Name":pr.lead.last_name,
                    "Phone Number":pr.lead.phone_number,
                    "Email":pr.lead.email,
                    "Address 1":pr.lead.address_1,
                    "Address 2":pr.lead.address_2,
                    "Address 3":pr.lead.address_3,
                    "Address 4":pr.lead.address_4,
                    "City Or Town":pr.lead.city_or_town,
                    "County":pr.lead.county,
                    "Postcode":pr.lead.postcode,
                    "Utility Type":pr.lead.utility_type,
                    "AMr":pr.lead.amr,
                    "Related Meter":pr.lead.related_meter,
                    "Current SUpplier":pr.lead.current_electricity_supplier,
                    "Contract End Date":pr.lead.contract_end_date,
                    "Meter Serial Number":pr.lead.meter_serial_number,
                    "MPAN/MPRN":pr.lead.supply_number,
                    "Can Sell Water":pr.lead.can_sell_water,
                    "Contract Duration":pr.lead.contract_duration,
                    "S&R3 Status":pr.lead.s_andr3_status,
                    "Bilge Eac":pr.lead.bilge_eac,
                    "IS Locked":pr.lead.is_locked,
                    "PR Date":pr.created_on,
                    "Pr Campaign":pr.campaign,
                    "PR Status":pr.quality_status,
                    "PR BY Username":pr.submitted_by.username,
                    "Pr By Name":pr.submitted_by.get_full_name(),
                    "Comment":pr.comment,
                    "Quality Comment": pr.quality_comment,
                }
                writer.writerow(row)
        return Response({'file':file_name})
