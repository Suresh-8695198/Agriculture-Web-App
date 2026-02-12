from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConsumerProfileViewSet, ProduceOrderViewSet, ProduceReviewViewSet, CartViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'profiles', ConsumerProfileViewSet, basename='consumer-profile')
router.register(r'orders', ProduceOrderViewSet, basename='produce-order')
router.register(r'reviews', ProduceReviewViewSet, basename='produce-review')
router.register(r'cart', CartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
]
