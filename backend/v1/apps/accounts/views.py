from rest_framework import viewsets
from rest_framework import permissions
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import list_route
from django.contrib.auth.models import Group
from . import serializer
from . import models


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializer.GroupSerializer
    queryset = Group.objects.all().order_by('name')

class UserViewSet(viewsets.ModelViewSet):
    primission_classes = (permissions.IsAuthenticated, )
    serializer_class = serializer.UserSerializer
    queryset = models.User.objects.all().order_by('-date_joined')

    @list_route(url_path="validate_username", methods=['get', ], permission_classes=[permissions.AllowAny])
    def validate_username(self, request):
        username = request.query_params.get('username')
        current_id = request.query_params.get('current_id')
        user = models.User.objects.filter(username__iexact=username)
        if current_id:
            user = user.exclude(officer_profile__id=int(current_id))
        if user.exists():
            return Response({'username': ['A user with that email address already exists.']}, status=status.HTTP_400_BAD_REQUEST)
        return Response()
