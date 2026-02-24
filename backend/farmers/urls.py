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
    # My listings (all, incl. drafts)
    path('my-listings/', FarmProduceViewSet.as_view({'get': 'my_produce'}), name='farmer-produce-list'),
    # Save draft
    path('produce/save-draft/', FarmProduceViewSet.as_view({'post': 'save_draft'}), name='farmer-produce-draft'),
    # Bulk delete
    path('produce/bulk-delete/', FarmProduceViewSet.as_view({'delete': 'bulk_delete'}), name='farmer-produce-bulk-delete'),
    # Toggle availability (pause / resume) — detail action via router auto-generates the URL
    path('', include(router.urls)),
]
