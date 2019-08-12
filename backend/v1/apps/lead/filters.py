import json
import django_filters
from django.db.models.functions import Concat
from django.db.models import F, Value
from .models import Lead
class LeadFilter(django_filters.FilterSet):
    q = django_filters.CharFilter(method='q_filter')
        
    def q_filter(self, queryset, name, val):
        try:
            val=val.replace("'", '"')
            filter_q = json.loads(val)
            print(filter_q)
        except Exception as e:
            print(e)
            return queryset
        return queryset.annotate(
                full_name=Concat(
                    F('business_detail__first_name'), Value(" "), F('business_detail__middle_name'), Value(" "), F('business_detail__last_name'))
            ).filter(**filter_q)

    class Meta:
        model = Lead
        fields = ('q',)
