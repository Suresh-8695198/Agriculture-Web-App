from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from math import radians, cos, sin, asin, sqrt
from .models import SupplierProfile, Product, SupplierReview
from .serializers import SupplierProfileSerializer, ProductSerializer, SupplierReviewSerializer


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
    
    @action(detail=False, methods=['get'])
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
