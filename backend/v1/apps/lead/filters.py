import json
import django_filters
from django.db.models.functions import Concat
from django.db.models import F, Value, Q
from .models import Lead, LeadHistory, ProspectLead, LeadSale

class LeadFilter(django_filters.FilterSet):
    q = django_filters.CharFilter(method='q_filter')
    
    def q_filter(self, queryset, name, val):
        try:
            val=val.replace("'", '"')
            filter_q =Q()
            for key, val in json.loads(val).items():
                if key in ['created_on__date__range', 'contract_end_date__range']:
                    filter_q = filter_q & Q(**{key:val.split(",")}) 
                else:      
                    filter_q = filter_q & Q(**{key:val})
        except Exception as e:
            print("Exception in filter", e)
            return queryset
        return queryset.annotate(
                full_name=Concat(
                    F('first_name'), Value(" "), F('middle_name'), Value(" "), F('last_name'))
            ).filter(filter_q)
    class Meta:
        model = Lead
        fields = ('q',)

class LeadHistoryFilter(django_filters.FilterSet):
    q = django_filters.CharFilter(method='q_filter')
    start_date = django_filters.CharFilter(method='date_filter')
    end_date = django_filters.CharFilter(method='date_filter')
    
    def q_filter(self, queryset, name, val):
        return queryset.filter(lead_id=val)
    
    def date_filter(self, queryset, name, val):
        filter_q = Q()
        end_date = self.data.get('end_date')
        if name == 'start_date' and end_date:
            filter_q = filter_q | Q(created_on__range=(self.data.get(
                'start_date'), end_date))
        return queryset.filter(filter_q)

    class Meta:
        model = LeadHistory
        fields = ('start_date', 'end_date', 'created_by', 'q', 'action')
        
class ProspectLeadFilter(django_filters.FilterSet):
    start_date = django_filters.CharFilter(method='date_filter')
    end_date = django_filters.CharFilter(method='date_filter')

    def date_filter(self, queryset, name, val):
        filter_q = Q()
        end_date = self.data.get('end_date')
        if name == 'start_date' and end_date:
            filter_q = filter_q | Q(created_on__date__range=(self.data.get(
                'start_date'), end_date))
        return queryset.filter(filter_q)

    class Meta:
        model = ProspectLead
        fields = ('start_date', 'end_date', 'campaign', 'quality_status')

class LeadSaleFilter(django_filters.FilterSet):
    start_date = django_filters.CharFilter(method='date_filter')
    end_date = django_filters.CharFilter(method='date_filter')

    def date_filter(self, queryset, name, val):
        filter_q = Q()
        end_date = self.data.get('end_date')
        if name == 'start_date' and end_date:
            filter_q = filter_q | Q(created_on__date__range=(self.data.get(
                'start_date'), end_date))
        return queryset.filter(filter_q)

    class Meta:
        model = LeadSale
        fields = ('start_date', 'end_date', 'campaign', 'quality_status')
