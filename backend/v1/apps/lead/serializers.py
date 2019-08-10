from io import StringIO
from rest_framework import serializers
from .models import Lead, LeadBusinessDetails, LeadSupplyDetails, Status, Comment, Callback
from v1.apps.utils.utils import get_file_name

class LeadBusinessDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadBusinessDetails
        fields = '__all__'
        extra_kwargs = {"lead":{"required":False}}

class LeadSupplyDetailsDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadSupplyDetails
        fields = '__all__'
        extra_kwargs = {"lead":{"required":False}}

class LeadSerializer(serializers.ModelSerializer):
    business_detail  = LeadBusinessDetailsSerializer()
    supply_detail  = LeadSupplyDetailsDetailsSerializer()
    
    class Meta:
        model = Lead
        fields = '__all__'
        extra_kwargs= {
            'status':{
                'required':False
            }
        }

    def validate_status(self, value):
        if (hasattr(self, 'status_choices') and value not in self.status_choices) or not Status.objects.filter(key=value).exists():
            raise serializers.ValidationError({'status':'Invalid status code'})
        return value

    def create(self, validated_data):
        business_detail = validated_data.pop("business_detail")
        supply_detail = validated_data.pop("supply_detail")
        if self.context['request'].user.groups.filter(name='sales-person').exists():
            validated_data['assigned_to'] = self.context['request'].user
        lead = Lead.objects.create(status='raw', created_by=self.context['request'].user, **validated_data)
        business_detail.update({'lead':lead})
        supply_detail.update({'lead':lead})
        lead.business_detail = LeadBusinessDetails.objects.create(**business_detail)
        lead.supply_detail = LeadSupplyDetails.objects.create(**supply_detail)
        return lead
    
    def update(self, instance, validated_data):
        business_detail = validated_data.pop("business_detail", None)
        supply_detail = validated_data.pop("supply_detail", None)
        instance = super(LeadSerializer, self).update(instance, validated_data)
        if business_detail:
            instance.business_detail = LeadBusinessDetailsSerializer().update(instance.business_detail, business_detail)
        if supply_detail:
            instance.supply_detail = LeadSupplyDetailsDetailsSerializer().update(instance.supply_detail, supply_detail)
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
    def to_representation(self, obj):
        ret = super(CallbackSerializer, self).to_representation(obj)
        ret['scheduled_by'] = obj.scheduled_by.get_full_name()
        return ret
import csv
class BulkLeadCreateSerrializer(serializers.Serializer):
    file = serializers.FileField()
    business_field_mapping = {
        'busines_name':'BusinessName',
        'first_name':'FirstName',
        'middle_name':'MiddleName',
        'last_name':'LastName',
        'phone_number':'PhoneNumber',
        'email':'eMail',
        'building_name':'BuildingName',
        'subb':'Subb',
        'building_number':'BuildingNumber',
        'street_name':'StreetName',
        'town':'Town',
        'county':'County'
    }
    supply_field_mapping = {
        'meter_type':'MeterType',
        'meter_type_code':'MeterTypeCode',
        'domestic_meter':'domesticMeter',
        'related_meter':'RelatedMeter',
        'amr':'AMR',
        'current_electricity_supplier':'CurrentElectricitySupplier',
        'contract_end_day':'contractEndDay',
        'contract_end_month':'contractEndMonth',
        'contract_end_year':'contractEndYear',
        'meter_serial_number':'Meter Serial Number',
        'supply_number':'SupplyNumber',
    }
    lead_field_mapping = {
        'lead_hash':'Lead Hash'
    }
    def validate(self, data):
        validated_data = {"lead_objects":[], "business_objects":{}, "supply_objects":{}}
        is_error = False
        try:
            csvf = StringIO(data['file'].read().decode())
            data['file'] = csv.DictReader(csvf)
        except Exception as e:
            raise serializers.ValidationError({"file": e})
        error_file_name = get_file_name()
        status_choices = list(Status.objects.values_list('key', flat=True))
        supply_number_list = []
        with open(error_file_name, 'w', newline='') as csvfile:
            fieldnames = data['file'].fieldnames
            fieldnames.append('errors')
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for row in data['file']:
                lead_data = {}
                business_detail_data = {}
                supply_detail_data = {}
                for model_field, file_field in self.lead_field_mapping.items():
                    lead_data[model_field] = row.get(file_field)
                
                for model_field, file_field in self.business_field_mapping.items():
                    row_data = row.get(file_field)
                    business_detail_data[model_field] = row_data if row_data!='NA' else None
                for model_field, file_field in self.supply_field_mapping.items():
                    supply_detail_data[model_field] = row.get(file_field)
                if supply_detail_data['supply_number'] in supply_number_list:
                    raise serializers.ValidationError({"lead_hash":"Duplicate supply number {}".format(supply_detail_data['supply_number'])})
                supply_number_list.append(supply_detail_data['supply_number'])
                lead_data['business_detail'] = business_detail_data
                lead_data['supply_detail'] = supply_detail_data
                lead_ser = LeadSerializer(data=lead_data, context=self.context)
                lead_ser.status_choices = status_choices
                if not lead_ser.is_valid():
                    is_error = True 
                    row['errors'] = lead_ser.errors
                    writer.writerow(row)
                else:
                    lead_obj  = Lead(lead_hash=lead_ser.validated_data.get('lead_hash'), status=lead_ser.validated_data.get('status', 'raw'))
                    validated_data['lead_objects'].append(lead_obj)
                    validated_data['business_objects'][str(lead_obj.lead_internal_hash)] = LeadBusinessDetails(**lead_ser.validated_data.get('business_detail'))
                    validated_data['supply_objects'][str(lead_obj.lead_internal_hash)] = LeadSupplyDetails(**lead_ser.validated_data.get('supply_detail'))
        if is_error:
            raise serializers.ValidationError({"data_error":error_file_name})
        return validated_data

    def create(self, validated_data):
        Lead.objects.bulk_create(validated_data['lead_objects'])
        for index, l in enumerate(Lead.objects.filter(lead_internal_hash__in=validated_data['business_objects'].keys()).values_list('id', 'lead_internal_hash')):
            validated_data['business_objects'][l[1]].lead_id = l[0]
            validated_data['supply_objects'][l[1]].lead_id = l[0]
        LeadBusinessDetails.objects.bulk_create(validated_data['business_objects'].values())
        LeadSupplyDetails.objects.bulk_create(validated_data['supply_objects'].values())
        
