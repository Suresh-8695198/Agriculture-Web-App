from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmerProfileViewSet, FarmProduceViewSet, SupplierOrderViewSet

router = DefaultRouter()
router.register(r'profiles', FarmerProfileViewSet, basename='farmer-profile')
router.register(r'produce', FarmProduceViewSet, basename='farm-produce')
router.register(r'orders', SupplierOrderViewSet, basename='supplier-order')

urlpatterns = [
    path('', include(router.urls)),
]
