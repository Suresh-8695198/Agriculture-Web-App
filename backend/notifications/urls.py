from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import NotificationViewSet

router = SimpleRouter()
router.include_format_suffixes = False
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
