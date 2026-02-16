from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import SupportTicketViewSet, FAQViewSet

router = SimpleRouter()
router.include_format_suffixes = False
router.register(r'tickets', SupportTicketViewSet, basename='support-ticket')
router.register(r'faqs', FAQViewSet, basename='faq')

urlpatterns = [
    path('', include(router.urls)),
]
