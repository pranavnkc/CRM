from django.apps import AppConfig


class UtilsConfig(AppConfig):
    name = 'v1.apps.utils'
    
    def ready(self):
        from . import signals
