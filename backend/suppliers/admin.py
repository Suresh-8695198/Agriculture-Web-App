from django.contrib import admin
from .models import SupplierProfile, Product, SupplierReview

@admin.register(SupplierProfile)
class SupplierProfileAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'user', 'rating', 'total_reviews', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['business_name', 'user__username', 'gst_number']
    readonly_fields = ['rating', 'total_reviews', 'created_at', 'updated_at']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'supplier', 'category', 'price', 'stock_quantity', 'is_available', 'is_rental']
    list_filter = ['category', 'is_available', 'is_rental', 'created_at']
    search_fields = ['name', 'description', 'supplier__business_name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(SupplierReview)
class SupplierReviewAdmin(admin.ModelAdmin):
    list_display = ['supplier', 'reviewer', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['supplier__business_name', 'reviewer__username']
    readonly_fields = ['created_at']
