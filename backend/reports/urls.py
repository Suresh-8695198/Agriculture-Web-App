from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import GeneratedReportViewSet

router = SimpleRouter()
router.include_format_suffixes = False
router.register(r'', GeneratedReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]
