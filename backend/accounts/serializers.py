from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    has_farmer_profile = serializers.SerializerMethodField()
    has_supplier_profile = serializers.SerializerMethodField()
    has_consumer_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'user_type', 
                  'profile_picture', 'address', 'latitude', 'longitude', 
                  'is_verified', 'created_at', 
                  'has_farmer_profile', 'has_supplier_profile', 'has_consumer_profile']
        read_only_fields = ['id', 'created_at', 'is_verified']

    def get_has_farmer_profile(self, obj):
        return hasattr(obj, 'farmer_profile')

    def get_has_supplier_profile(self, obj):
        return hasattr(obj, 'supplier_profile')
        
    def get_has_consumer_profile(self, obj):
        return hasattr(obj, 'consumer_profile')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'password', 'password2', 
                  'user_type', 'address', 
                  'latitude', 'longitude']
    
    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(help_text="Username or Email")
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(required=False, help_text="Expected user role (farmer/supplier/consumer)")


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
