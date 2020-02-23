from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from .serializer import AuthSeralizer

class AuthViewset(APIView):
    permission_classes = (AllowAny, )    
    def post(self, request):
        ip = request.META.get('HTTP_CLIENT_IP')
        ser = AuthSeralizer(data=request.data, context={'ip':ip})
        ser.is_valid(raise_exception=True)
        return Response(ser.validated_data)

    def delete(self, request):
        Token.objects.filter(key=request.META['HTTP_AUTHORIZATION'].split(" ")[1]).delete()
        return Response()
    
