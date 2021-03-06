import csv
from django.utils import timezone
from django.db import transaction
from io import StringIO
from rest_framework import serializers
from .models import *
from v1.apps.utils.utils import get_file_name, model_to_dict_v2, get_diff, try_parsing_date


class LeadSerializer(serializers.ModelSerializer):    
    class Meta:
        model = Lead
        fields = '__all__'
        extra_kwargs= {
            'status':{
                'required':False
            }
        }

    def validate_status(self, value):
        if value and ((hasattr(self, 'status_choices') and value not in self.status_choices) or not Status.objects.filter(key=value).exists()):
            raise serializers.ValidationError({'status':'Invalid status code'})
        return value
    
    def validate_submission_status(self, value):
        if (hasattr(self, 'submission_status_choices') and value not in self.submission_status_choices) or not SubmissionStatus.objects.filter(key=value).exists():
            raise serializers.ValidationError({'status':'Invalid submission status code'})
        return value

    def create(self, validated_data):
        if self.context['request'].user.groups.filter(name='sales-person').exists():
            validated_data['assigned_to'] = self.context['request'].user
        validated_data['submission_status'] = "raw"
        validated_data['created_by'] = self.context['request'].user
        instance  = super(LeadSerializer, self).create(validated_data)
        LeadHistory(lead=instance, action=LeadHistory.ACTION_CREATED, created_by=self.context['request'].user, old_instance_meta={}, new_instance_meta=model_to_dict_v2(instance)).save()
        return instance
    
    @transaction.atomic
    def update(self, instance, validated_data):
        old_submission_status = instance.submission_status
        old_status = instance.status
        history_obj = LeadHistory(lead=instance, action=LeadHistory.ACTION_EDIT_LEAD, created_by=self.context['request'].user)
        history_obj.old_instance_meta = model_to_dict_v2(instance)
        instance = super(LeadSerializer, self).update(instance, validated_data)
        history_obj.new_instance_meta = model_to_dict_v2(instance)
        history_obj.old_instance_meta, history_obj.new_instance_meta = get_diff(history_obj.old_instance_meta, history_obj.new_instance_meta)
        if validated_data.get('submission_status') and old_submission_status!=validated_data.get('submission_status'):
            history_obj = LeadHistory(lead=instance, action=LeadHistory.ACTION_SUBMISSION_STATUS_CHANGE, created_by=self.context['request'].user)
            history_obj.old_instance_meta = {"submission_status": old_submission_status}
            history_obj.new_instance_meta = {"submission_status": validated_data.get('submission_status')}
            history_obj.save()
        elif history_obj.new_instance_meta:
            history_obj.save()
        # if old_submission_status == 'raw' and self.context['request'].user.groups.filter(name='stage-1').exists():
        #     history_obj = LeadHistory(lead=instance, action=LeadHistory.ACTION_ASSIGN_CHANGED, created_by=self.context['request'].user)
        #     history_obj.old_instance_meta = {"assinee":instance.assigned_to_id}
        #     history_obj.new_instance_meta = {"assinee":self.context['request'].user.id}
        #     history_obj.save()
        #     instance.assigned_to = self.context['request'].user
        #     instance.assigned_by = self.context['request'].user
        #     instance.assigned_on = timezone.now()
        #     instance.save() 
        return instance

    def to_representation(self, obj):
        ret = super(LeadSerializer, self).to_representation(obj)
        ret['assigned_to'] = obj.assigned_to.get_full_name() if obj.assigned_to else None
        callback = obj.callbacks.order_by('datetime').last()
        ret['latest_callback'] = callback.datetime if callback else None
        return ret

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
        extra_kwargs = {
            "lead":{"required":False},
            "created_by":{"required":False}
        }

    def create(self, validated_data):
        instance = super(CommentSerializer, self).create(validated_data)
        history_obj = LeadHistory(lead_id=instance.lead_id, action=LeadHistory.ACTION_COMMENT, created_by=self.context['request'].user)
        history_obj.old_instance_meta = {'comment':str(getattr(Comment.objects.filter(lead=instance.lead).exclude(id=instance.id).last(), 'comment', None))}
        history_obj.new_instance_meta = {'commnet':instance.comment}
        history_obj.save()
        return instance
    
    def to_representation(self, obj):
        ret = super(CommentSerializer, self).to_representation(obj)
        ret['created_by'] = obj.created_by.get_full_name()
        return ret


class CallbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Callback
        fields = '__all__'
        extra_kwargs = {
            "lead":{"required":False},
            "created_by":{"required":False}
        }
    def create(self, validated_data):
        instance = super(CallbackSerializer, self).create(validated_data)
        history_obj = LeadHistory(lead_id=instance.lead_id, action=LeadHistory.ACTION_CALLBACk_SCHEDULED, created_by=self.context['request'].user)
        history_obj.old_instance_meta = {'callback_time':str(getattr(Callback.objects.filter(lead=instance.lead).exclude(id=instance.id).last(), 'datetime', None))}
        history_obj.new_instance_meta = {'callback_time':str(instance.datetime)}
        history_obj.save()
        return instance
    
    def update(self, instance, validated_data):
        history_obj = LeadHistory(lead_id=instance.lead_id, action=LeadHistory.ACTION_CALLBACk_SCHEDULED, created_by=self.context['request'].user)
        history_obj.old_instance_meta = {'callback_time':str(instance.datetime)}
        instance = super(CallbackSerializer, self).update(instance, validated_data)
        history_obj.new_instance_meta = {'callback_time':str(instance.datetime)}
        history_obj.save()
        return instance
    
    def to_representation(self, obj):
        ret = super(CallbackSerializer, self).to_representation(obj)
        ret['scheduled_by'] = getattr(obj,'scheduled_by', obj['scheduled_by']).get_full_name()
        return ret
    

class BulkLeadCreateSerrializer(serializers.Serializer):
    file = serializers.FileField()
    source = serializers.CharField(max_length=200)
    lead_field_mapping = {
        'busines_name':'Company Name',
        'salutation':'Saluatation',
        'first_name':'Contact Forename',
        'last_name':'Contact Surname',
        'phone_number':'Tel Number',
        'email':'Email',
        'building_name':'BuildingName',
        'address_1':'Address 1',
        'address_2':'Address 2',
        'address_3':'Address 3',
        'address_4':'Address 4',
        'building_number':'BuildingNumber',
        'street_name':'StreetName',
        'city_or_town':'City/Town',
        'county':'County',
        'postcode':'Site Post Code',
        'meter_type_code':'MeterTypeCode',
        'domestic_meter':'domesticMeter',
        'related_meter':'RelatedMeter',
        'amr':'AMR',
        'utility_type':'Utility(Elec / Gas)',
        'current_electricity_supplier_new':"New Supplier / Current Supplier (PR's)",
        'contract_end_day':'contractEndDay',
        'contract_end_month':'contractEndMonth',
        'contract_end_year':'contractEndYear',
        'meter_serial_number':'Electricity Meter Serial Number',
        'supply_number':'Full MPAN/MPR',
        'can_sell_water':'Can Sell Water ?',
        'source':'Source',
        'initial_disposition_date':'Sale / Disposition Made',
        'new_renewal_date':'New Renewal / PR',
        'agent_name':'Agent Id',
        'contract_duration':'Duration (Months)',
        's_andr3_status':'S&R3 Status',
        'bilge_eac':'BILGE Submitted EAC',
        'new_disposition_date':'New Disposition Date',
        'is_locked':'Is locked?',
        
    }
    def transform_row(self, row):
        row['can_sell_water'] = True if row['can_sell_water'] and row['can_sell_water'].strip().lower()=='yes' else False
        row['is_locked'] = True if row['is_locked'].strip().lower()=='yes' else False
        row['contract_duration'] = row['contract_duration'] if row['contract_duration'] else None
        if row.get('initial_disposition_date') is not None:
            row['initial_disposition_date'] = row['initial_disposition_date'] or None
        if row.get('new_renewal_date') is not None:
            row['new_renewal_date'] = row['new_renewal_date'] or None
        if row.get('new_disposition_date') is not None:
            row['new_disposition_date'] = row['new_disposition_date'] or None
        if row.get('phone_number') and row['phone_number'][0]=='0':
            row['phone_number'] = row['phone_number'][1:]
        row['current_electricity_supplier_new'] = BusinessNames.objects.filter(name__iexact=row['current_electricity_supplier_new']).first()
        row['current_electricity_supplier_new'] = row['current_electricity_supplier_new'].id if row['current_electricity_supplier_new'] else row['current_electricity_supplier_new']
        return row
        
    def validate(self, data):
        validated_data = {"lead_objects":[], "business_objects":{}, "supply_objects":{}}
        is_error = False
        try:
            csvf = StringIO(data['file'].read().decode())
            data['file'] = csv.DictReader(csvf)
        except Exception as e:
            raise serializers.ValidationError({"file": e})
        error_file_name = get_file_name()
        submission_status_choices = list(SubmissionStatus.objects.values_list('key', flat=True))
        supply_number_list = []
        with open(error_file_name, 'w', newline='') as csvfile:
            fieldnames = data['file'].fieldnames
            fieldnames.append('errors')
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for row in data['file']:
                lead_data = {}
                for model_field, file_field in self.lead_field_mapping.items():
                    row_data = row.get(file_field)
                    
                    lead_data[model_field] = row_data if row_data!='NA' else None
                if lead_data['supply_number'] and lead_data['supply_number'] in supply_number_list:
                    raise serializers.ValidationError({"lead_hash":"Duplicate supply number {}".format(lead_data['supply_number'])})
                supply_number_list.append(lead_data['supply_number'])
                lead_data = self.transform_row(lead_data)
                lead_data['source'] = lead_data['source'] or data['source']
                lead_ser = LeadSerializer(data=lead_data, context=self.context)
                lead_ser.submission_status_choices = submission_status_choices
                if not lead_ser.is_valid():
                    is_error = True 
                    row['errors'] = lead_ser.errors
                    writer.writerow(row)
                else:
                    lead_obj  = Lead(submission_status=lead_ser.validated_data.get('submission_status', 'raw'), created_by=self.context['request'].user, **lead_ser.validated_data)
                    validated_data['lead_objects'].append(lead_obj)
        if is_error:
            raise serializers.ValidationError({"data_error":error_file_name})
        return validated_data
    
    @transaction.atomic
    def create(self, validated_data):
        history_objs = []
        Lead.objects.bulk_create(validated_data['lead_objects'], 500)
        for index, l in enumerate(Lead.objects.filter(supply_number__in=[l.supply_number for l in validated_data['lead_objects']])):
            history_obj = LeadHistory(lead=l, action=LeadHistory.ACTION_CREATED, created_by=self.context['request'].user, old_instance_meta={})
            history_obj.new_instance_meta = model_to_dict_v2(l)
            history_objs.append(history_obj)
        LeadHistory.objects.bulk_create(history_objs, 500)

class LeadHistorySerializer(serializers.ModelSerializer):    
    class Meta:
        model = LeadHistory
        fields = '__all__'

    
    def to_representation(self, obj):
        ret = super(LeadHistorySerializer, self).to_representation(obj)
        ret['created_by'] = obj.created_by.get_full_name() if obj.created_by else None
        return ret

class ProspectLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProspectLead
        fields = '__all__'
        
    def validate(self, data):
        if data.get('lead') and (not data['lead'].current_electricity_supplier_new or not data['lead'].contract_end_date):
            raise serializers.ValidationError({"required":"Need to fill current supplier and contract End Date before PR."})
        return data
    
    def create(self, validated_data):
        validated_data['campaign'] = self.context['request'].user.campaign
        instance = super(ProspectLeadSerializer, self).create(validated_data)
        instance.lead.submission_status = 'ht' if validated_data.get('is_hot_transfer') else 'prospect'
        instance.lead.save()
        history = LeadHistory(lead=instance.lead, action=LeadHistory.ACTION_HT if validated_data.get('is_hot_transfer') else LeadHistory.ACTION_PR, created_by=self.context['request'].user, new_instance_meta={}, old_instance_meta={})
        history.save()
        return instance
    
    def update(self, instance, validated_data):
        lead = validated_data.pop('lead')
        validated_data['lead'] = instance.lead
        lead_ser = LeadSerializer(instance.lead, data=lead, context=self.context)
        lead_ser.is_valid(raise_exception=True)
        lead_ser.save()
        validated_data['quality_status'] = LeadSale.QUALITY_STATUS_REQUIRE_AUDITING
        instance  = super(ProspectLeadSerializer, self).update(instance, validated_data)
        return instance

    def to_representation(self, obj):
        ret = super(ProspectLeadSerializer, self).to_representation(obj);
        if self.context['request'].query_params.get('include_lead'):
            ret["lead"] = LeadSerializer(obj.lead).data
        ret['submitted_by'] = obj.submitted_by.get_full_name()
        ret['quality_analyst'] = obj.quality_analyst.get_full_name()
        return ret

class LeadSaleSerializer(serializers.ModelSerializer):    
    def __init__(self, *args, **kwargs):
        if not kwargs['context'].get('from_lead_view'):
            self.fields['lead'] = LeadSerializer()
        return super(LeadSaleSerializer, self).__init__(*args, **kwargs)
    class Meta:
        model = LeadSale
        fields = '__all__'
    def validate(self, data):
        return data
    def create(self, validated_data):
        validated_data['campaign'] = self.context['request'].user.campaign
        instance = super(LeadSaleSerializer, self).create(validated_data)
        instance.lead.submission_status = 'sale'
        instance.lead.save()
        history = LeadHistory(lead=instance.lead, action=LeadHistory.ACTION_SALE, created_by=self.context['request'].user, new_instance_meta={}, old_instance_meta={})
        history.save()
        return instance
    
    def update(self, instance, validated_data):
        lead = validated_data.pop('lead')
        validated_data['lead'] = instance.lead
        lead_ser = LeadSerializer(instance.lead, data=lead, context=self.context)
        lead_ser.is_valid(raise_exception=True)
        lead_ser.save()
        validated_data['quality_status'] = LeadSale.QUALITY_STATUS_REQUIRE_AUDITING
        instance  = super(LeadSaleSerializer, self).update(instance, validated_data)
        return instance

    def to_representation(self, obj):
        ret = super(LeadSaleSerializer, self).to_representation(obj);
        ret["lead"] = LeadSerializer(obj.lead).data
        ret['sold_by'] = obj.sold_by.get_full_name()
        return ret
