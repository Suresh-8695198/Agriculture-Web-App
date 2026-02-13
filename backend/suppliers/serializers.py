from rest_framework import serializers
from .models import SupplierProfile, Product, Equipment, Order, Rental, StockLog, SupplierReview
from accounts.serializers import UserSerializer

class SupplierProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    business_types_list = serializers.SerializerMethodField()
    
    class Meta:
        model = SupplierProfile
        fields = '__all__'
        read_only_fields = ['rating', 'total_reviews', 'created_at', 'updated_at']
    
    def get_business_types_list(self, obj):
        """Convert comma-separated business_types to list"""
        if obj.business_types:
            return [bt.strip() for bt in obj.business_types.split(',')]
        return []


class SupplierProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating supplier profile"""
    business_types_list = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = SupplierProfile
        fields = [
            'shop_name', 'owner_name', 'alternate_number', 'business_name',
            'business_license', 'license_number', 'gst_number', 'description',
            'village', 'district', 'state', 'pin_code', 'business_types',
            'business_types_list', 'id_proof', 'business_license_doc', 'shop_image'
        ]
    
    def update(self, instance, validated_data):
        # Handle business_types_list conversion
        if 'business_types_list' in validated_data:
            business_types_list = validated_data.pop('business_types_list')
            instance.business_types = ','.join(business_types_list)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class SupplierDashboardSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    total_products = serializers.IntegerField()
    available_stock = serializers.IntegerField()
    active_orders = serializers.IntegerField()
    active_rentals = serializers.IntegerField()
    today_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_requests = serializers.IntegerField()
    low_stock_count = serializers.IntegerField()
    total_earnings = serializers.DecimalField(max_digits=10, decimal_places=2)


class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.business_name', read_only=True)
    supplier_location = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['supplier', 'created_at', 'updated_at']
    
    def get_supplier_location(self, obj):
        return {
            'latitude': obj.supplier.user.latitude,
            'longitude': obj.supplier.user.longitude,
            'address': obj.supplier.user.address
        }


class EquipmentSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.business_name', read_only=True)
    supplier_location = serializers.SerializerMethodField()
    equipment_type_display = serializers.CharField(source='get_equipment_type_display', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Equipment
        fields = '__all__'
        read_only_fields = ['supplier', 'total_rentals', 'rating', 'created_at', 'updated_at']
    
    def get_supplier_location(self, obj):
        return {
            'latitude': obj.supplier.user.latitude,
            'longitude': obj.supplier.user.longitude,
            'address': obj.supplier.user.address
        }


class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone_number', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_category = serializers.CharField(source='product.category', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    delivery_method_display = serializers.CharField(source='get_delivery_method_display', read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['order_number', 'supplier', 'created_at', 'updated_at', 'confirmed_at', 'delivered_at']


class RentalSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone_number', read_only=True)
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    equipment_type = serializers.CharField(source='equipment.equipment_type', read_only=True)
    equipment_image = serializers.ImageField(source='equipment.image', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    
    class Meta:
        model = Rental
        fields = '__all__'
        read_only_fields = ['rental_number', 'supplier', 'rental_duration_days', 'created_at', 'updated_at', 'confirmed_at', 'started_at', 'completed_at']


class StockLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    change_type_display = serializers.CharField(source='get_change_type_display', read_only=True)
    
    class Meta:
        model = StockLog
        fields = '__all__'
        read_only_fields = ['previous_stock', 'current_stock', 'updated_by', 'created_at']


class SupplierReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)
    
    class Meta:
        model = SupplierReview
        fields = '__all__'
        read_only_fields = ['created_at']

