from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from v1.apps.accounts.serializer import UserSerializer
from v1.apps.accounts.models import UserLoginHistory

class AuthSeralizer(serializers.Serializer):
    username = serializers.CharField(write_only=True)
    password =serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        ulh_obj = UserLoginHistory(ip=self.context.get('ip'), result=False)
        if username and password:
            ulh_obj.user = username
            user = authenticate(username=username.lower(), password=password)
            if user is None:
                ulh_obj.save()
                raise serializers.ValidationError({'auth':'Wrong Credentials!'})
            else:
                role = user.groups.first()
                if role:
                    data = {}
                    data['token'] , _ = Token.objects.get_or_create(user=user)
                    data['token'] = data['token'].key
                    data['user'] =  UserSerializer(user).data
                    data['role']  = role.name if role else ''
                    ulh_obj.result = True
                    ulh_obj.save()
                    return data
                else:
                    ulh_obj.save()
                    raise serializers.ValidationError({'auth':"Don't have access of system"})
        else:
            ulh_obj.save()
            serializers.ValidationError({'auth':'Must include "username" and "password'})  
