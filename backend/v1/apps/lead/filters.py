import json
import django_filters
from django.db.models.functions import Concat
from django.db.models import F, Value, Q
from .models import Lead, LeadHistory

class LeadFilter(django_filters.FilterSet):
    q = django_filters.CharFilter(method='q_filter')
        
    def q_filter(self, queryset, name, val):
        try:
            val=val.replace("'", '"')
            filter_q = json.loads(val)
            if 'created_on__date__range' in filter_q.keys():
                filter_q['created_on__date__range'] = filter_q['created_on__date__range'].split(",")
            if 'contract_end_date__range' in filter_q.keys():
                filter_q['contract_end_date__range'] = filter_q['contract_end_date__range'].split(",")
        except Exception as e:
            print("Exception in filter", e)
            return queryset
        return queryset.annotate(
                full_name=Concat(
                    F('first_name'), Value(" "), F('middle_name'), Value(" "), F('last_name'))
            ).filter(**filter_q)
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
        fields = ('start_date', 'end_date', 'created_by', 'q')
