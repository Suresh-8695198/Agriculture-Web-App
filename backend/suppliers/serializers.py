from rest_framework import serializers
from .models import SupplierProfile, Product, Equipment, Order, Rental, StockLog, SupplierReview, ProductReview
from accounts.serializers import UserSerializer

class SupplierProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    business_types_list = serializers.SerializerMethodField()
    full_address = serializers.SerializerMethodField()
    shop_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = SupplierProfile
        fields = '__all__'
        read_only_fields = ['rating', 'total_reviews', 'created_at', 'updated_at', 
                          'verification_status', 'admin_comments', 'subscription_plan', 
                          'commission_percentage', 'is_bank_verified']
    
    def get_business_types_list(self, obj):
        """Convert comma-separated business_types to list"""
        if obj.business_types:
            return [bt.strip() for bt in obj.business_types.split(',')]
        return []
    
    def get_full_address(self, obj):
        """Return formatted full address"""
        address_parts = []
        if obj.village:
            address_parts.append(obj.village)
        if obj.district:
            address_parts.append(obj.district)
        if obj.state:
            address_parts.append(obj.state)
        if obj.pin_code:
            address_parts.append(obj.pin_code)
        return ', '.join(address_parts) if address_parts else 'Not provided'
    
    def get_shop_image_url(self, obj):
        """Return shop image URL if it exists, otherwise None"""
        if obj.shop_image:
            try:
                # Check if file exists
                if obj.shop_image.storage.exists(obj.shop_image.name):
                    request = self.context.get('request')
                    if request:
                        return request.build_absolute_uri(obj.shop_image.url)
                    return obj.shop_image.url
            except Exception:
                pass
        return None


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
            # Basic Details
            'shop_name', 'owner_name', 'alternate_number', 'business_name',
            'business_license', 'license_number', 'gst_number', 'description',
            'years_of_experience',
            # Address Details
            'address_line_1', 'address_line_2', 'village', 'taluk', 'district', 
            'state', 'pin_code', 'landmark', 'latitude', 'longitude',
            # Business Hours
            'opening_time', 'closing_time', 'working_days', 'emergency_contact_available',
            # Bank & Payment
            'bank_account_holder', 'bank_name', 'account_number', 'ifsc_code', 
            'upi_id', 'pan_number',
            # Business Types
            'business_types', 'business_types_list',
            # Service Categories
            'enable_seeds', 'enable_fertilizers', 'enable_manure', 
            'enable_equipment_rental', 'enable_agro_tools',
            # Delivery Options
            'home_delivery_available', 'delivery_radius_km', 'min_order_value', 
            'delivery_charges', 'pickup_available',
            # Notification Preferences
            'notify_orders', 'notify_rentals', 'notify_payments', 
            'notify_low_stock', 'notify_sms', 'notify_email',
            # Documents
            'id_proof', 'business_license_doc', 'gst_certificate', 
            'shop_image', 'equipment_registration'
        ]
    
    def to_internal_value(self, data):
        """
        Override to filter out file fields that are sent as strings/URLs
        This runs BEFORE field validation, preventing errors when frontend
        sends existing file URLs instead of new file uploads
        """
        # Create a mutable copy of the data
        if hasattr(data, '_mutable'):
            data._mutable = True
        
        # List of file fields that should only accept actual file uploads
        file_fields = ['id_proof', 'business_license_doc', 'gst_certificate', 
                      'shop_image', 'equipment_registration']
        
        # Remove file fields if they're not actual files (i.e., they're strings/URLs)
        for field in file_fields:
            if field in data:
                field_value = data.get(field)
                # If it's a string (URL) or empty string, remove it
                if isinstance(field_value, str):
                    data.pop(field, None)
        
        return super().to_internal_value(data)
    
    def validate(self, attrs):
        """Custom validation to handle edge cases"""
        # Convert empty strings to None for numeric fields
        numeric_fields = ['years_of_experience', 'delivery_radius_km', 
                         'min_order_value', 'delivery_charges']
        for field in numeric_fields:
            if field in attrs and attrs[field] == '':
                attrs[field] = 0
        
        # Convert empty strings to None for decimal fields
        decimal_fields = ['latitude', 'longitude']
        for field in decimal_fields:
            if field in attrs and attrs[field] == '':
                attrs[field] = None
        
        # Round latitude/longitude to fit model constraints (max_digits=9, decimal_places=6)
        # This means max 3 digits before decimal, 6 after
        if 'latitude' in attrs and attrs['latitude'] is not None:
            try:
                # Round to 6 decimal places to fit the model constraint
                attrs['latitude'] = round(float(attrs['latitude']), 6)
            except (ValueError, TypeError):
                raise serializers.ValidationError({
                    'latitude': 'Invalid latitude value'
                })
        
        if 'longitude' in attrs and attrs['longitude'] is not None:
            try:
                # Round to 6 decimal places to fit the model constraint
                attrs['longitude'] = round(float(attrs['longitude']), 6)
            except (ValueError, TypeError):
                raise serializers.ValidationError({
                    'longitude': 'Invalid longitude value'
                })
        
        # Validate PIN code length
        if 'pin_code' in attrs and attrs['pin_code'] and len(attrs['pin_code']) > 6:
            raise serializers.ValidationError({
                'pin_code': 'PIN code must be 6 characters or less'
            })
        
        return attrs
    
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
        """Return formatted address instead of coordinates"""
        address_parts = []
        if obj.supplier.village:
            address_parts.append(obj.supplier.village)
        if obj.supplier.district:
            address_parts.append(obj.supplier.district)
        if obj.supplier.state:
            address_parts.append(obj.supplier.state)
        
        return {
            'village': obj.supplier.village or '',
            'district': obj.supplier.district or '',
            'state': obj.supplier.state or '',
            'pin_code': obj.supplier.pin_code or '',
            'full_address': ', '.join(address_parts) if address_parts else 'Location not specified'
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
        """Return formatted address instead of coordinates"""
        address_parts = []
        if obj.supplier.village:
            address_parts.append(obj.supplier.village)
        if obj.supplier.district:
            address_parts.append(obj.supplier.district)
        if obj.supplier.state:
            address_parts.append(obj.supplier.state)
        
        return {
            'village': obj.supplier.village or '',
            'district': obj.supplier.district or '',
            'state': obj.supplier.state or '',
            'pin_code': obj.supplier.pin_code or '',
            'full_address': ', '.join(address_parts) if address_parts else 'Location not specified'
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


class ProductReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = ProductReview
        fields = '__all__'
        read_only_fields = ['created_at']

