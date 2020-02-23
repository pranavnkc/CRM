from django.db.models import Q
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import list_route, detail_route
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import Group
from django.utils import timezone
from v1.apps.utils.pagination import StandardResultsSetPagination 
from . import serializer
from . import models
from .filters import UserFilter
from v1.apps.lead.models import Lead, LeadHistory, ProspectLead, LeadSale
from collections import Counter
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
        if self.request.user.groups.filter(name__in=['sales-person', 'stage-1', 'quality-analyst']).exists():
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
        ret = {'pr':{}, 'ht':{}, 'sale':{}};
        user = self.get_object()
        users = self.get_queryset()
        lead_qs= Lead.objects.all()
        if request.query_params.get('start_date'):
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            prospect_qs = ProspectLead.objects.filter(is_hot_transfer=False, created_on__date__range=(start_date, end_date));
            sale_qs = LeadSale.objects.filter(created_on__date__range=(start_date, end_date))
            ht_qs = ProspectLead.objects.filter(is_hot_transfer=True, created_on__date__range=(start_date, end_date));
        else:
            prospect_qs = ProspectLead.objects.filter(is_hot_transfer=False);
            sale_qs = LeadSale.objects.all()
            ht_qs = ProspectLead.objects.filter(is_hot_transfer=True);
        if user.groups.filter(name__in=['sales-person', 'stage-1']).exists():
            lead_qs = lead_qs.filter(assigned_to=self.request.user)
            prospect_qs = prospect_qs.filter(submitted_by=request.user)
            ht_qs = ht_qs.filter(submitted_by=request.user)
            sale_qs = sale_qs.filter(sold_by=request.user)
        elif user.groups.filter(name__in=['team-manager', 'company-head']).exists():
            lead_qs = lead_qs.filter(assigned_to__in=users)
            prospect_qs = prospect_qs.filter(submitted_by__in=users)
            ht_qs = ht_qs.filter(submitted_by__in=users)
            sale_qs = sale_qs.filter(sold_by__in=users) 

        ret['lead_count'] = lead_qs.count()
        for user, status in prospect_qs.values_list('submitted_by__username', 'quality_status'):
            print(user, status)
            if ret['pr'].get(user):
                if ret['pr'][user].get(status):
                    ret['pr'][user][status] = ret['pr'][user][status]+1
                else:
                    ret['pr'][user][status] = 1
            else:
                ret['pr'][user]= {status:1}
        for user, status in ht_qs.values_list('submitted_by__username', 'quality_status'):
            if ret['ht'].get(user):
                if ret['ht'][user].get(status):
                    ret['ht'][user][status] = ret['ht'][user][status]+1
                else:
                    ret['ht'][user][status] = 1
            else:
                ret['ht'][user]= {status:1}
                
        for user, status in sale_qs.values_list('sold_by__username', 'quality_status'):
            if ret['sale'].get(user):
                if ret['sale'][user].get(status):
                    ret['sale'][user][status] = ret['sale'][user][status]+1
                else:
                    ret['sale'][user][status] = 1
            else:
                ret['sale'][user]= {status:1}
        return Response(ret)

    
    @detail_route(url_path="force-logout", methods=['delete', ])
    def dashboard_data(self, request, pk):
        user = self.get_object()
        Token.objects.filter(user=user).delete()
        return Response(status=204)
    

    @detail_route(url_path="login-history", methods=['get', ])
    def login_history(self, request, pk):
        user = self.get_object()
        return Response(models.UserLoginHistory.objects.filter(user__iexact=user.username).values())
    
