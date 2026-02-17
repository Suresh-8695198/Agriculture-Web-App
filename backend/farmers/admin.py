from django.contrib import admin
from .models import FarmerProfile, FarmProduce, SupplierOrder, Land

@admin.register(FarmerProfile)
class FarmerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'farm_name', 'farm_size', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'farm_name', 'crops_grown']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(FarmProduce)
class FarmProduceAdmin(admin.ModelAdmin):
    list_display = ['name', 'farmer', 'category', 'price_per_unit', 'available_quantity', 'is_available']
    list_filter = ['category', 'is_available', 'created_at']
    search_fields = ['name', 'description', 'farmer__user__username']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(SupplierOrder)
class SupplierOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'farmer', 'product', 'quantity', 'total_price', 'status', 'is_rental', 'created_at']
    list_filter = ['status', 'is_rental', 'created_at']
    search_fields = ['farmer__user__username', 'product__name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Land)
class LandAdmin(admin.ModelAdmin):
    list_display = ['name', 'farmer', 'area', 'location', 'soil_type', 'current_crop', 'created_at']
    list_filter = ['soil_type', 'irrigation_type', 'created_at']
    search_fields = ['name', 'location', 'farmer__user__username', 'current_crop']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('farmer', 'name', 'area', 'location')
        }),
        ('Land Details', {
            'fields': ('soil_type', 'current_crop', 'irrigation_type')
        }),
        ('Location Coordinates', {
            'fields': ('latitude', 'longitude'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
