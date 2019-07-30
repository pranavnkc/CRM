from django.urls import path, include, re_path

from django.conf import settings
from django.conf.urls.static import static

from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from .views import IndexPageView

from config.routes import router
from v1.apps.authentication import views as auth_views 

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', auth_views.AuthViewset.as_view()),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls'), name='api_auth'),
    re_path('^.*$', IndexPageView.as_view(), name='home'),
]

urlpatterns += staticfiles_urlpatterns()

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)

    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns += [
            path('__debug__/', include(debug_toolbar.urls)),
        ]
