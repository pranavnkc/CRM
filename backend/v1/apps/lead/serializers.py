from rest_framework import serializers
from .models import Lead, LeadBusinessDetails, LeadSupplyDetails

class LeadBusinessDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadBusinessDetails
        fields = '__all__'


class LeadSupplyDetailsDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadSupplyDetails
        fields = '__all__'


class LeadSerializer(serializers.ModelSerializer):
    business_detail  = LeadBusinessDetailsSerializer()
    supply_detail  = LeadSupplyDetailsDetailsSerializer()
    
    class Meta:
        model = Lead
        fields = '__all__'
