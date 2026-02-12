from rest_framework import serializers
from .models import FarmerProfile, FarmProduce, SupplierOrder
from accounts.serializers import UserSerializer

class FarmerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = FarmerProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class FarmProduceSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.user.username', read_only=True)
    farmer_location = serializers.SerializerMethodField()
    
    class Meta:
        model = FarmProduce
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_farmer_location(self, obj):
        return {
            'latitude': obj.farmer.user.latitude,
            'longitude': obj.farmer.user.longitude,
            'address': obj.farmer.user.address
        }


class SupplierOrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    supplier_name = serializers.CharField(source='product.supplier.business_name', read_only=True)
    supplier_phone = serializers.CharField(source='product.supplier.user.phone_number', read_only=True)
    
    class Meta:
        model = SupplierOrder
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
