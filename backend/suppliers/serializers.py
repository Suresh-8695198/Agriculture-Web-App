from rest_framework import serializers
from .models import SupplierProfile, Product, SupplierReview
from accounts.serializers import UserSerializer

class SupplierProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SupplierProfile
        fields = '__all__'
        read_only_fields = ['rating', 'total_reviews', 'created_at', 'updated_at']


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
