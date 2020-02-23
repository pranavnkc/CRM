from v1.apps.utils.models import IPAddress
from django.http import HttpResponseForbidden
from v1.apps.utils.models import Settings

class IPAddressCheckMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response
    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called
        #print(request.META.get('HTTP_CLIENT_IP'), request.META)
        
        if Settings.objects.filter(is_ip_restriction_active=True).exists() and request.META.get('HTTP_CLIENT_IP') and not IPAddress.objects.filter(ip=request.META.get('HTTP_CLIENT_IP'), active=True).exists():
            return HttpResponseForbidden()
        response = self.get_response(request)
        # Code to be executed for each request/response after
        # the view is called.
        return response    
        
