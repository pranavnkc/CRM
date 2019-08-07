from rest_framework import serializers
from .models import Lead, LeadBusinessDetails, LeadSupplyDetails, Status, Comment

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
        if not Status.objects.filter(key=value).exists():
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
