from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import timedelta
from math import radians, cos, sin, asin, sqrt
from .models import SupplierProfile, Product, SupplierReview
from .serializers import (
    SupplierProfileSerializer, 
    SupplierProfileUpdateSerializer,
    SupplierDashboardSerializer,
    ProductSerializer, 
    SupplierReviewSerializer
)


def haversine(lon1, lat1, lon2, lat2):
    """Calculate the great circle distance between two points on the earth"""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6371 * c
    return km


class SupplierProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for supplier profiles"""
    queryset = SupplierProfile.objects.filter(is_active=True)
    serializer_class = SupplierProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['business_name', 'description']
    ordering_fields = ['rating', 'created_at']
    
    @action(detail=False, methods=['get'], url_path='my_profile')
    def my_profile(self, request):
        """Get current supplier's profile"""
        try:
            profile = SupplierProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except SupplierProfile.DoesNotExist:
            return Response({'error': 'Supplier profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def create_profile(self, request):
        """Create supplier profile"""
        if hasattr(request.user, 'supplier_profile'):
            return Response({'error': 'Profile already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['patch', 'put'], url_path='update_profile')
    def update_profile(self, request):
        """Update current supplier's profile"""
        try:
            profile = SupplierProfile.objects.get(user=request.user)
            serializer = SupplierProfileUpdateSerializer(profile, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            # Return full profile data
            full_serializer = SupplierProfileSerializer(profile)
            return Response(full_serializer.data)
        except SupplierProfile.DoesNotExist:
            return Response({'error': 'Supplier profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'], url_path='dashboard_stats')
    def dashboard_stats(self, request):
        """Get dashboard statistics for current supplier"""
        try:
            profile = SupplierProfile.objects.get(user=request.user)
            products = Product.objects.filter(supplier=profile)
            
            # Calculate stats
            total_products = products.count()
            available_stock = products.filter(is_available=True).aggregate(
                total=Sum('stock_quantity')
            )['total'] or 0
            
            # For now, these are placeholder values since we don't have Order model yet
            active_orders = 0
            active_rentals = 0
            today_earnings = 0
            pending_requests = 0
            total_earnings = 0
            
            # Low stock alert (< 10 units)
            low_stock_count = products.filter(stock_quantity__lt=10, is_available=True).count()
            
            stats = {
                'total_products': total_products,
                'available_stock': available_stock,
                'active_orders': active_orders,
                'active_rentals': active_rentals,
                'today_earnings': today_earnings,
                'pending_requests': pending_requests,
                'low_stock_count': low_stock_count,
                'total_earnings': total_earnings
            }
            
            serializer = SupplierDashboardSerializer(stats)
            return Response(serializer.data)
        except SupplierProfile.DoesNotExist:
            return Response({'error': 'Supplier profile not found'}, status=status.HTTP_404_NOT_FOUND)


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for products"""
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['price', 'created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search_nearby']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        supplier_profile = SupplierProfile.objects.get(user=self.request.user)
        serializer.save(supplier=supplier_profile)
    
    @action(detail=False, methods=['get'])
    def my_products(self, request):
        """Get current supplier's products"""
        try:
            supplier_profile = SupplierProfile.objects.get(user=request.user)
            products = Product.objects.filter(supplier=supplier_profile)
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        except SupplierProfile.DoesNotExist:
            return Response({'error': 'Supplier profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def search_nearby(self, request):
        """Search products by location and category"""
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        category = request.query_params.get('category')
        max_distance = float(request.query_params.get('max_distance', 50))  # km
        
        if not latitude or not longitude:
            return Response({'error': 'Latitude and longitude required'}, status=status.HTTP_400_BAD_REQUEST)
        
        latitude = float(latitude)
        longitude = float(longitude)
        
        products = Product.objects.filter(is_available=True)
        
        if category:
            products = products.filter(category=category)
        
        # Filter by distance
        nearby_products = []
        for product in products:
            if product.supplier.user.latitude and product.supplier.user.longitude:
                distance = haversine(
                    longitude, latitude,
                    float(product.supplier.user.longitude),
                    float(product.supplier.user.latitude)
                )
                if distance <= max_distance:
                    product_data = ProductSerializer(product).data
                    product_data['distance'] = round(distance, 2)
                    nearby_products.append(product_data)
        
        # Sort by distance
        nearby_products.sort(key=lambda x: x['distance'])
        
        return Response(nearby_products)


class SupplierReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for supplier reviews"""
    queryset = SupplierReview.objects.all()
    serializer_class = SupplierReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        review = serializer.save(reviewer=self.request.user)
        # Update supplier rating
        supplier = review.supplier
        reviews = SupplierReview.objects.filter(supplier=supplier)
        avg_rating = sum([r.rating for r in reviews]) / len(reviews)
        supplier.rating = round(avg_rating, 2)
        supplier.total_reviews = len(reviews)
        supplier.save()
