from rest_framework import routers

from v1.apps.accounts import views
from v1.apps.lead import views as lead_views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'leads', lead_views.LeadViewSet)
