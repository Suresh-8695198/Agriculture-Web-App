from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    UserLoginSerializer,
    ChangePasswordSerializer
)

User = get_user_model()


from django.db import transaction

class UserRegistrationView(generics.CreateAPIView):
    """API endpoint for user registration"""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                user = serializer.save()
                
                # Create supplier profile if user is a supplier
                if user.user_type == 'supplier':
                    from suppliers.models import SupplierProfile
                    SupplierProfile.objects.create(
                        user=user,
                        business_name=f"{user.username}'s Business"
                    )
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'user': UserSerializer(user).data,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'message': 'User registered successfully'
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Log the error for debugging
            import traceback
            traceback.print_exc()
            
            # If it's a validation error, let DRF handle it
            from rest_framework.exceptions import ValidationError
            if isinstance(e, ValidationError):
                raise e
                
            return Response({
                'error': 'Registration failed',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserLoginView(APIView):
    """API endpoint for user login"""
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username_or_email = serializer.validated_data['username']
        password = serializer.validated_data['password']
        expected_role = serializer.validated_data.get('role', None)
        
        from django.db.models import Q
        
        # Try to find user by username or email
        user = None
        user_obj = User.objects.filter(
            Q(username=username_or_email) | Q(email=username_or_email)
        ).first()
        
        if user_obj:
            user = authenticate(username=user_obj.username, password=password)

        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Login successful'
            })
        
        return Response({
            'error': 'Invalid credentials. Please check your username/email and password.'
        }, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """API endpoint for viewing and updating user profile"""
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        data = request.data
        
        # Also handle farmer_profile updates if applicable
        if hasattr(user, 'farmer_profile'):
            profile = user.farmer_profile
            farmer_fields = [
                'dob', 'gender', 'farm_name', 'farm_size', 'crops_grown', 'soil_type', 'irrigation_type',
                'bank_name', 'upi_id', 'pan_number', 'dark_mode', 'interface_language',
                'notif_order', 'notif_whatsapp', 'notif_market'
            ]
            for field in farmer_fields:
                if field in data:
                    # Boolean fixes from string true/false
                    val = data[field]
                    if val in ['true', 'True']: val = True
                    elif val in ['false', 'False']: val = False
                    setattr(profile, field, val)
            profile.save()
            
        return super().update(request, *args, **kwargs)


class ChangePasswordView(APIView):
    """API endpoint for changing password"""
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'error': 'Old password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        })


class LogoutView(APIView):
    """API endpoint for user logout"""
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        try:
            # Simply return success - client will clear tokens
            # Token blacklisting can be added later if needed
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
