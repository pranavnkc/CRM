from rest_framework import serializers

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from . import models


User = get_user_model()

class GroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = Group
        exclude = ('permissions',)

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True)
    groups = GroupSerializer(many=True, read_only=True)

    def validate_role(self, value):
        return Group.objects.filter(name=value).first()
    
    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {
            'password':{
                'write_only': True
            }
        }
        
    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.pop('role')
        user = super(UserSerializer, self).create(validated_data)
        user.groups.add(role)
        user.set_password(password)
        user.save()
        return user
    def to_representation(self, obj):
     ret = super(UserSerializer, self).to_representation(obj)
     ret['role'] = Group.objects.first()
     ret['role']  = ret['role'].name if ret['role'] else ret['role'] 
     return ret
