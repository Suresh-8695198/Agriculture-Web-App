from django.contrib import admin
from .models import ConsumerProfile, ProduceOrder, ProduceReview, Cart

@admin.register(ConsumerProfile)
class ConsumerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(ProduceOrder)
class ProduceOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'consumer', 'produce', 'quantity', 'total_price', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['consumer__user__username', 'produce__name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(ProduceReview)
class ProduceReviewAdmin(admin.ModelAdmin):
    list_display = ['produce', 'reviewer', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['produce__name', 'reviewer__username']
    readonly_fields = ['created_at']

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['consumer', 'produce', 'quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['consumer__user__username', 'produce__name']
    readonly_fields = ['created_at', 'updated_at']
