from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import ConsumerProfile, ProduceOrder, ProduceReview, Cart
from .serializers import ConsumerProfileSerializer, ProduceOrderSerializer, ProduceReviewSerializer, CartSerializer


class ConsumerProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for consumer profiles"""
    queryset = ConsumerProfile.objects.all()
    serializer_class = ConsumerProfileSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current consumer's profile"""
        try:
            profile = ConsumerProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except ConsumerProfile.DoesNotExist:
            return Response({'error': 'Consumer profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def create_profile(self, request):
        """Create consumer profile"""
        if hasattr(request.user, 'consumer_profile'):
            return Response({'error': 'Profile already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProduceOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for produce orders"""
    queryset = ProduceOrder.objects.all()
    serializer_class = ProduceOrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status']
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'consumer_profile'):
            return ProduceOrder.objects.filter(consumer=user.consumer_profile)
        elif hasattr(user, 'farmer_profile'):
            return ProduceOrder.objects.filter(produce__farmer=user.farmer_profile)
        return ProduceOrder.objects.none()
    
    def perform_create(self, serializer):
        consumer_profile = ConsumerProfile.objects.get(user=self.request.user)
        serializer.save(consumer=consumer_profile)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(ProduceOrder.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_payment_status(self, request, pk=None):
        """Update payment status"""
        order = self.get_object()
        new_status = request.data.get('payment_status')
        
        if new_status not in dict(ProduceOrder.PAYMENT_STATUS_CHOICES):
            return Response({'error': 'Invalid payment status'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.payment_status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)


class ProduceReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for produce reviews"""
    queryset = ProduceReview.objects.all()
    serializer_class = ProduceReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)


class CartViewSet(viewsets.ModelViewSet):
    """ViewSet for shopping cart"""
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if hasattr(self.request.user, 'consumer_profile'):
            return Cart.objects.filter(consumer=self.request.user.consumer_profile)
        return Cart.objects.none()
    
    def perform_create(self, serializer):
        consumer_profile = ConsumerProfile.objects.get(user=self.request.user)
        serializer.save(consumer=consumer_profile)
    
    @action(detail=False, methods=['get'])
    def total(self, request):
        """Get cart total"""
        cart_items = self.get_queryset()
        total = sum([float(item.quantity) * float(item.produce.price_per_unit) for item in cart_items])
        return Response({
            'total': round(total, 2),
            'items_count': cart_items.count()
        })
    
    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Clear cart"""
        self.get_queryset().delete()
        return Response({'message': 'Cart cleared successfully'})
