from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import serializers as rest_serializers
from math import radians, cos, sin, asin, sqrt
from .models import FarmerProfile, FarmProduce, SupplierOrder, Land
from .serializers import FarmerProfileSerializer, FarmProduceSerializer, SupplierOrderSerializer, LandSerializer


def haversine(lon1, lat1, lon2, lat2):
    """Calculate the great circle distance between two points on the earth"""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6371 * c
    return km


class FarmerProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for farmer profiles"""
    queryset = FarmerProfile.objects.all()
    serializer_class = FarmerProfileSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current farmer's profile"""
        try:
            profile = FarmerProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except FarmerProfile.DoesNotExist:
            return Response({'error': 'Farmer profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def create_profile(self, request):
        """Create farmer profile"""
        if hasattr(request.user, 'farmer_profile'):
            return Response({'error': 'Profile already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FarmProduceViewSet(viewsets.ModelViewSet):
    """ViewSet for farm produce"""
    queryset = FarmProduce.objects.filter(is_available=True)
    serializer_class = FarmProduceSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['price_per_unit', 'created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search_nearby']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        farmer_profile = FarmerProfile.objects.get(user=self.request.user)
        serializer.save(farmer=farmer_profile)
    
    @action(detail=False, methods=['get'])
    def my_produce(self, request):
        """Get current farmer's produce"""
        try:
            farmer_profile = FarmerProfile.objects.get(user=request.user)
            produce = FarmProduce.objects.filter(farmer=farmer_profile)
            serializer = self.get_serializer(produce, many=True)
            return Response(serializer.data)
        except FarmerProfile.DoesNotExist:
            return Response({'error': 'Farmer profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def search_nearby(self, request):
        """Search produce by location and category"""
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        category = request.query_params.get('category')
        max_distance = float(request.query_params.get('max_distance', 50))  # km
        
        if not latitude or not longitude:
            return Response({'error': 'Latitude and longitude required'}, status=status.HTTP_400_BAD_REQUEST)
        
        latitude = float(latitude)
        longitude = float(longitude)
        
        produce_list = FarmProduce.objects.filter(is_available=True)
        
        if category:
            produce_list = produce_list.filter(category=category)
        
        # Filter by distance
        nearby_produce = []
        for produce in produce_list:
            if produce.farmer.user.latitude and produce.farmer.user.longitude:
                distance = haversine(
                    longitude, latitude,
                    float(produce.farmer.user.longitude),
                    float(produce.farmer.user.latitude)
                )
                if distance <= max_distance:
                    produce_data = FarmProduceSerializer(produce).data
                    produce_data['distance'] = round(distance, 2)
                    nearby_produce.append(produce_data)
        
        # Sort by distance
        nearby_produce.sort(key=lambda x: x['distance'])
        
        return Response(nearby_produce)


class SupplierOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for supplier orders"""
    queryset = SupplierOrder.objects.all()
    serializer_class = SupplierOrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'farmer_profile'):
            return SupplierOrder.objects.filter(farmer=user.farmer_profile)
        elif hasattr(user, 'supplier_profile'):
            return SupplierOrder.objects.filter(product__supplier=user.supplier_profile)
        return SupplierOrder.objects.none()
    
    def perform_create(self, serializer):
        farmer_profile = FarmerProfile.objects.get(user=self.request.user)
        serializer.save(farmer=farmer_profile)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(SupplierOrder.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)


class LandViewSet(viewsets.ModelViewSet):
    """ViewSet for land/field management"""
    queryset = Land.objects.all()
    serializer_class = LandSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'location', 'soil_type', 'current_crop']
    ordering_fields = ['area', 'created_at']
    
    def get_queryset(self):
        """Get lands for the current farmer"""
        user = self.request.user
        if hasattr(user, 'farmer_profile'):
            return Land.objects.filter(farmer=user.farmer_profile)
        return Land.objects.none()
    
    def perform_create(self, serializer):
        """Create land with automatic farmer assignment"""
        try:
            farmer_profile = FarmerProfile.objects.get(user=self.request.user)
            serializer.save(farmer=farmer_profile)
        except FarmerProfile.DoesNotExist:
            raise rest_serializers.ValidationError("Farmer profile not found. Please create a farmer profile first.")
    
    @action(detail=False, methods=['get'])
    def my_lands(self, request):
        """Get all lands for the current farmer"""
        try:
            farmer_profile = FarmerProfile.objects.get(user=request.user)
            lands = Land.objects.filter(farmer=farmer_profile)
            serializer = self.get_serializer(lands, many=True)
            return Response(serializer.data)
        except FarmerProfile.DoesNotExist:
            return Response({'error': 'Farmer profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get land statistics for the current farmer"""
        try:
            farmer_profile = FarmerProfile.objects.get(user=request.user)
            lands = Land.objects.filter(farmer=farmer_profile)
            
            total_area = sum(float(land.area) for land in lands)
            total_lands = lands.count()
            
            # Group by soil type
            soil_types = {}
            for land in lands:
                soil_type = land.get_soil_type_display()
                if soil_type in soil_types:
                    soil_types[soil_type] += 1
                else:
                    soil_types[soil_type] = 1
            
            return Response({
                'total_lands': total_lands,
                'total_area': total_area,
                'soil_types': soil_types
            })
        except FarmerProfile.DoesNotExist:
            return Response({'error': 'Farmer profile not found'}, status=status.HTTP_404_NOT_FOUND)
