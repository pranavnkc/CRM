import django_filters
from django import forms
from django.contrib.postgres.forms import SimpleArrayField 
from v1.apps.utils.filters import SimpleArrayFilter 


class GroupFilter(django_filters.Filter):
    field_class = SimpleArrayField
    def filter(self, qs, value):
        if len(value) > 0:
            return qs.filter(groups__name__in=value)
        return qs
    
class UserFilter(django_filters.FilterSet):
    groups = GroupFilter(base_field=forms.CharField())
