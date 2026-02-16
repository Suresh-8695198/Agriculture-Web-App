from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import TransactionViewSet, PayoutRequestViewSet

router = SimpleRouter()
router.include_format_suffixes = False
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'payouts', PayoutRequestViewSet, basename='payout')

urlpatterns = [
    path('', include(router.urls)),
]
