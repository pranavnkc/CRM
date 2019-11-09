from rest_framework import viewsets
from rest_framework import permissions
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import list_route, detail_route
from django.contrib.auth.models import Group
from django.utils import timezone
from v1.apps.utils.pagination import StandardResultsSetPagination 
from . import serializer
from . import models
from .filters import UserFilter
from v1.apps.lead.models import Lead, LeadHistory, ProspectLead, LeadSale

class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializer.GroupSerializer
    queryset = Group.objects.all().order_by('name')

class UserViewSet(viewsets.ModelViewSet):
    primission_classes = (permissions.IsAuthenticated, )
    serializer_class = serializer.UserSerializer
    filter_class = UserFilter
    queryset = models.User.objects.all().order_by('-date_joined').prefetch_related('groups')
    pagination_class = StandardResultsSetPagination
    def get_queryset(self):
        qs = models.User.objects.all().order_by('-date_joined').prefetch_related('groups')
        if self.request.user.groups.filter(name__in=['sales-person', 'stage-1']).exists():
            return qs.filter(id=self.request.user.id)
        elif self.request.user.groups.filter(name__in=['team-manager', 'company-head']).exists():
            return qs.filter(parent=self.request.user) | qs.filter(id=self.request.user.id) | qs.filter(parent__parent=self.request.user)  
        return qs
   
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

    @detail_route(url_path="dashboard", methods=['get', ])
    def dashboard_data(self, request, pk):
        ret = {}
        user = self.get_object()
        qs=None
        prospect = 0;
        sale = 0;
        if user.groups.filter(name__in=['sales-person', 'stage-1']).exists():
            qs = Lead.objects.filter(assigned_to=self.request.user)
            prospect = ProspectLead.objects.filter(submitted_by=request.user).count()
            sale = LeadSale.objects.filter(sold_by=request.user).count()
        elif user.groups.filter(name='team-manager').exists():
            qs = Lead.objects.filter(assigned_to__in=models.User.objects.filter(parent=self.request.user))
        elif user.groups.filter(name='company-head').exists():
            qs = Lead.objects.filter(assigned_to__in=models.User.objects.filter(parent__parent=self.request.user))
        else:
            qs = Lead.objects.all()
        ret['lead_count'] = qs.count()
        
        ret['prospect'] = prospect
        ret['sale'] = sale
        return Response(ret)

    
