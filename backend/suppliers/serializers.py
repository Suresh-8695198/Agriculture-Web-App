from rest_framework import serializers
from .models import SupplierProfile, Product, SupplierReview
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
        read_only_fields = ['created_at', 'updated_at']
    
    def get_supplier_location(self, obj):
        return {
            'latitude': obj.supplier.user.latitude,
            'longitude': obj.supplier.user.longitude,
            'address': obj.supplier.user.address
        }


class SupplierReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)
    
    class Meta:
        model = SupplierReview
        fields = '__all__'
        read_only_fields = ['created_at']
