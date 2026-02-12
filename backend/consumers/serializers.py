from rest_framework import serializers
from .models import ConsumerProfile, ProduceOrder, ProduceReview, Cart
from accounts.serializers import UserSerializer

class ConsumerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ConsumerProfile
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ProduceOrderSerializer(serializers.ModelSerializer):
    produce_name = serializers.CharField(source='produce.name', read_only=True)
    farmer_name = serializers.CharField(source='produce.farmer.user.username', read_only=True)
    farmer_phone = serializers.CharField(source='produce.farmer.user.phone_number', read_only=True)
    
    class Meta:
        model = ProduceOrder
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class ProduceReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)
    
    class Meta:
        model = ProduceReview
        fields = '__all__'
        read_only_fields = ['created_at']


class CartSerializer(serializers.ModelSerializer):
    produce_name = serializers.CharField(source='produce.name', read_only=True)
    produce_price = serializers.DecimalField(source='produce.price_per_unit', max_digits=10, decimal_places=2, read_only=True)
    produce_image = serializers.ImageField(source='produce.image', read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_subtotal(self, obj):
        return float(obj.quantity) * float(obj.produce.price_per_unit)
