from v1.apps.utils.models import IPAddress
from django.http import HttpResponseForbidden

class IPAddressCheckMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called
        print(dir(request))
        if not IPAddress.objects.filter(ip=request.META['REMOTE_ADDR'], active=True).exists() and False:
            return HttpResponseForbidden()
        response = self.get_response(request)
        # Code to be executed for each request/response after
        # the view is called.
        return response    
        
