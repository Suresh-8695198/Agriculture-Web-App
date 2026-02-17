from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmerProfileViewSet, FarmProduceViewSet, SupplierOrderViewSet, LandViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'profiles', FarmerProfileViewSet, basename='farmer-profile')
router.register(r'produce', FarmProduceViewSet, basename='farm-produce')
router.register(r'orders', SupplierOrderViewSet, basename='supplier-order')
router.register(r'lands', LandViewSet, basename='land')

urlpatterns = [
    path('', include(router.urls)),
]
