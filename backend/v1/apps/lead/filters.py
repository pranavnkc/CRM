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
        except Exception as e:
            print("Exception", e)
            return queryset
        return queryset.annotate(
                full_name=Concat(
                    F('business_detail__first_name'), Value(" "), F('business_detail__middle_name'), Value(" "), F('business_detail__last_name'))
            ).filter(**filter_q)
    class Meta:
        model = Lead
        fields = ('q',)

class LeadHistoryFilter(django_filters.FilterSet):
    start_date = django_filters.CharFilter(method='date_filter')
    end_date = django_filters.CharFilter(method='date_filter')
    
    def date_filter(self, queryset, name, val):
        filter_q = Q()
        end_date = self.data.get('end_date')
        if name == 'start_date' and end_date:
            filter_q = filter_q | Q(created_on__range=(self.data.get(
                'start_date'), end_date))
        return queryset.filter(filter_q)

    class Meta:
        model = LeadHistory
        fields = ('start_date', 'end_date')
