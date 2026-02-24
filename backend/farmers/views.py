from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import serializers as rest_serializers
from math import radians, cos, sin, asin, sqrt
from .models import FarmerProfile, FarmProduce, SupplierOrder, Land
from .serializers import FarmerProfileSerializer, FarmProduceSerializer, SupplierOrderSerializer, LandSerializer
from notifications.models import Notification


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

    def _get_or_create_farmer_profile(self, user):
        """Helper: get or auto-create farmer profile for user."""
        profile, _ = FarmerProfile.objects.get_or_create(
            user=user,
            defaults={'farm_name': f"{user.username}'s Farm"}
        )
        return profile

    def perform_create(self, serializer):
        farmer_profile = self._get_or_create_farmer_profile(self.request.user)
        serializer.save(farmer=farmer_profile)

    # ── owner check helper ────────────────────────────────────────
    def _owned_produce(self, pk, user):
        """Return produce object if it belongs to the requesting user."""
        try:
            produce = FarmProduce.objects.get(pk=pk)
        except FarmProduce.DoesNotExist:
            return None, Response({'error': 'Produce not found'}, status=status.HTTP_404_NOT_FOUND)
        if produce.farmer.user != user:
            return None, Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        return produce, None

    # ── my listings (all produce, including drafts) ───────────────
    @action(detail=False, methods=['get'])
    def my_produce(self, request):
        """Get ALL of current farmer's produce (active + drafts)."""
        try:
            farmer_profile = FarmerProfile.objects.get(user=request.user)
        except FarmerProfile.DoesNotExist:
            return Response([], status=status.HTTP_200_OK)
        produce = FarmProduce.objects.filter(farmer=farmer_profile).order_by('-created_at')
        serializer = self.get_serializer(produce, many=True)
        return Response(serializer.data)

    # ── toggle availability (pause / resume) ─────────────────────
    @action(detail=True, methods=['patch'])
    def toggle_availability(self, request, pk=None):
        """Toggle is_available for a produce listing (pause/resume)."""
        produce, err = self._owned_produce(pk, request.user)
        if err:
            return err
        produce.is_available = not produce.is_available
        produce.save(update_fields=['is_available', 'updated_at'])
        serializer = self.get_serializer(produce)
        action_word = 'resumed' if produce.is_available else 'paused'
        return Response({'message': f'Listing {action_word} successfully.', 'data': serializer.data})

    # ── save as draft (is_available = False) ─────────────────────
    @action(detail=False, methods=['post'])
    def save_draft(self, request):
        """Create a produce listing as a draft (not publicly visible)."""
        data = request.data.copy()
        data['is_available'] = False
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        farmer_profile = self._get_or_create_farmer_profile(request.user)
        serializer.save(farmer=farmer_profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    # ── bulk delete ───────────────────────────────────────────────
    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        """Delete multiple produce listings by IDs."""
        ids = request.data.get('ids', [])
        if not ids:
            return Response({'error': 'No IDs provided.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            farmer_profile = FarmerProfile.objects.get(user=request.user)
        except FarmerProfile.DoesNotExist:
            return Response({'error': 'Farmer profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        deleted_count, _ = FarmProduce.objects.filter(
            pk__in=ids, farmer=farmer_profile
        ).delete()
        return Response({'message': f'{deleted_count} listing(s) deleted.'}, status=status.HTTP_200_OK)

    # ── search nearby (public) ────────────────────────────────────
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
        order = serializer.save(farmer=farmer_profile)
        
        # Create notification for farmer
        Notification.objects.create(
            user=self.request.user,
            title="Order Placed",
            message=f"Your order for {order.product.name} has been placed successfully.",
            notification_type='order',
            related_object_id=f"ORD-{order.id}"
        )
        
        # Create notification for supplier
        Notification.objects.create(
            user=order.product.supplier.user,
            title="New Order Received",
            message=f"You have received a new order for {order.product.name} from {self.request.user.username}.",
            notification_type='order',
            related_object_id=f"ORD-{order.id}"
        )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(SupplierOrder.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        
        # Create notification for farmer
        Notification.objects.create(
            user=order.farmer.user,
            title="Order Status Updated",
            message=f"Your order #{order.id} status has been updated to {new_status}.",
            notification_type='order',
            related_object_id=f"ORD-{order.id}"
        )
        
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
