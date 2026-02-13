from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierProfileViewSet, ProductViewSet, EquipmentViewSet, OrderViewSet, RentalViewSet, SupplierReviewViewSet

# Create router
router = DefaultRouter()
router.register(r'profiles', SupplierProfileViewSet, basename='supplier-profile')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'rentals', RentalViewSet, basename='rental')
router.register(r'reviews', SupplierReviewViewSet, basename='supplier-review')

# URL patterns combining explicit paths and router
urlpatterns = [
    # Explicit paths for custom actions (these take precedence)
    path('profiles/my_profile/', 
         SupplierProfileViewSet.as_view({'get': 'my_profile'}), 
         name='supplier-my-profile'),
    path('profiles/dashboard_stats/', 
         SupplierProfileViewSet.as_view({'get': 'dashboard_stats'}), 
         name='supplier-dashboard-stats'),
    path('profiles/update_profile/', 
         SupplierProfileViewSet.as_view({'patch': 'update_profile', 'put': 'update_profile'}), 
         name='supplier-update-profile'),
    # Include router URLs (standard CRUD operations and other actions)
    path('', include(router.urls)),
]
