from rest_framework import serializers
from .models import FarmerProfile, FarmProduce, SupplierOrder, Land
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


class LandSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.user.username', read_only=True)
    soil_type_display = serializers.CharField(source='get_soil_type_display', read_only=True)
    irrigation_type_display = serializers.CharField(source='get_irrigation_type_display', read_only=True)
    
    class Meta:
        model = Land
        fields = '__all__'
        read_only_fields = ['farmer', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Automatically assign the farmer from the request user
        request = self.context.get('request')
        if request and hasattr(request.user, 'farmer_profile'):
            validated_data['farmer'] = request.user.farmer_profile
        return super().create(validated_data)
