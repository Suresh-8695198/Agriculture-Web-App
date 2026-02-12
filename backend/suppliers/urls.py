from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierProfileViewSet, ProductViewSet, SupplierReviewViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'profiles', SupplierProfileViewSet, basename='supplier-profile')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'reviews', SupplierReviewViewSet, basename='supplier-review')

urlpatterns = [
    path('', include(router.urls)),
]
