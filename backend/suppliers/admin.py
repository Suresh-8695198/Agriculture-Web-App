from django.contrib import admin
from .models import SupplierProfile, Product, Equipment, Order, Rental, SupplierReview

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

@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'supplier', 'equipment_type', 'daily_rate', 'status', 'condition', 'is_available', 'created_at']
    list_filter = ['equipment_type', 'status', 'condition', 'is_available', 'created_at']
    search_fields = ['name', 'description', 'supplier__business_name', 'brand', 'model']
    readonly_fields = ['total_rentals', 'rating', 'created_at', 'updated_at']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'supplier', 'customer', 'product', 'quantity', 'total_amount', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'delivery_method', 'created_at']
    search_fields = ['order_number', 'customer__username', 'product__name', 'supplier__business_name']
    readonly_fields = ['order_number', 'created_at', 'updated_at', 'confirmed_at', 'delivered_at']

@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ['rental_number', 'supplier', 'customer', 'equipment', 'start_date', 'end_date', 'total_amount', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['rental_number', 'customer__username', 'equipment__name', 'supplier__business_name']
    readonly_fields = ['rental_number', 'rental_duration_days', 'created_at', 'updated_at', 'confirmed_at', 'started_at', 'completed_at']

@admin.register(SupplierReview)
class SupplierReviewAdmin(admin.ModelAdmin):
    list_display = ['supplier', 'reviewer', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['supplier__business_name', 'reviewer__username']
    readonly_fields = ['created_at']
