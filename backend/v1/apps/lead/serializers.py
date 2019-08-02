from rest_framework import serializers
from .models import Lead, LeadBusinessDetails, LeadSupplyDetails

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
        
    def create(self, validated_data):
        business_detail = validated_data.pop("business_detail")
        supply_detail = validated_data.pop("supply_detail")
        if self.context['request'].user.groups.filter(name='sales-person').exists():
            validated_data['assigned_to'] = self.context['request'].user
        lead = Lead.objects.create(created_by=self.context['request'].user, **validated_data)
        business_detail.update({'lead':lead})
        supply_detail.update({'lead':lead})
        lead.business_detail = LeadBusinessDetails.objects.create(**business_detail)
        lead.supply_detail = LeadSupplyDetails.objects.create(**supply_detail)
        return lead
    
    def update(self, instance, validated_data):
        business_detail = validated_data.pop("business_detail")
        supply_detail = validated_data.pop("supply_detail")
        instance = super(LeadSerializer, self).update(instance, validated_data)
        business_detail = LeadBusinessDetailsSerializer(instance, data=business_detail)
        business_detail.save()
        supply_detail = LeadSupplyDetailsDetailsSerializer(instance, data=supply_detail)
        supply_detail.save()
        return instance
