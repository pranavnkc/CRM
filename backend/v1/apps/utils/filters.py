import django_filters
from django.contrib.postgres.forms import SimpleArrayField


class SimpleArrayFilter(django_filters.Filter):
    field_class = SimpleArrayField

    def filter(self, qs, value):
        if len(value) > 0:
            return qs.filter(**{'%s__in' % self.name: value})
        return qs

class SimpleArrayExclusionFilter(django_filters.Filter):
    field_class = SimpleArrayField
    def __init__(self, *args, **kwargs):
        self.exlusion_field = kwargs.pop('exlusion_field', None)
        return super(SimpleArrayExclusionFilter, self).__init__(*args, **kwargs)
    
    def filter(self, qs, value):
        if len(value) > 0:
            return qs.exclude(**{'%s__in' % (self.exlusion_field or self.name): value})
        return qs
