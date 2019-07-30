from django.views.generic.base import TemplateView

class IndexPageView(TemplateView):
    template_name = "dist/index.html"
