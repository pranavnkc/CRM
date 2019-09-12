from django.views.generic.base import TemplateView
from rest_framework.views import APIView
from rest_framework.response import Response
from v1.apps.utils.models import Settings
from v1.apps.utils.serializers import SettingSerilizer
class IndexPageView(TemplateView):
    template_name = "dist/index.html"

class UpdateSettingsView(APIView):
    """
    Update settings
    """
    #permission_classes = [permissions.IsAdminUser]

    def post(self, request, format=None):
        """
        Update settings
        """
        instance = Settings.objects.first()
        ser  = SettingSerilizer(instance, data=request.data)
        ser.is_valid()
        ser.update(instance, ser.validated_data)
        return Response(ser.data)
    
    def get(self, request):
        return Response(Settings.objects.first().is_ip_restriction_active) 
