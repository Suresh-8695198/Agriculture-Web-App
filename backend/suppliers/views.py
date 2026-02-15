from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import timedelta
from math import radians, cos, sin, asin, sqrt
from .models import SupplierProfile, Product, Equipment, Order, Rental, StockLog, SupplierReview
from .serializers import (
    SupplierProfileSerializer, 
    SupplierProfileUpdateSerializer,
    SupplierDashboardSerializer,
    ProductSerializer,
    EquipmentSerializer,
    OrderSerializer,
    RentalSerializer,
    StockLogSerializer,
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


def get_or_create_supplier_profile(user):
    """Get or create supplier profile for a user - prevents duplicate errors"""
    profile, created = SupplierProfile.objects.get_or_create(
        user=user,
        defaults={
            'business_name': f"{user.username}'s Business",
            'owner_name': user.username,
            'description': "Please update your business profile"
        }
    )
    return profile


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
        """Get current supplier's profile - auto-creates if doesn't exist"""
        profile = get_or_create_supplier_profile(request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
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
        """Update current supplier's profile - auto-creates if doesn't exist"""
        profile = get_or_create_supplier_profile(request.user)
        serializer = SupplierProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return full profile data
        full_serializer = SupplierProfileSerializer(profile)
        return Response(full_serializer.data)
    
    @action(detail=False, methods=['get'], url_path='dashboard_stats')
    def dashboard_stats(self, request):
        """Get dashboard statistics for current supplier - auto-creates profile if needed"""
        profile = get_or_create_supplier_profile(request.user)
        products = Product.objects.filter(supplier=profile)
        equipment = Equipment.objects.filter(supplier=profile)
        orders = Order.objects.filter(supplier=profile)
        rentals = Rental.objects.filter(supplier=profile)
        
        # Calculate stats
        total_products = products.count()
        available_stock = products.filter(is_available=True).aggregate(
            total=Sum('stock_quantity')
        )['total'] or 0
        
        # Equipment stats
        total_equipment = equipment.count()
        available_equipment = equipment.filter(status='available').count()
        
        # Real Transaction Stats
        active_orders = orders.filter(status__in=['pending', 'confirmed', 'processing', 'ready']).count()
        active_rentals = rentals.filter(status__in=['pending', 'confirmed', 'active']).count()
        
        # Earnings
        today = timezone.now().date()
        today_order_earnings = orders.filter(status='delivered', delivered_at__date=today).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        today_rental_earnings = rentals.filter(status='completed', completed_at__date=today).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        today_earnings = today_order_earnings + today_rental_earnings
        
        pending_requests = orders.filter(status='pending').count() + rentals.filter(status='pending').count()
        
        total_order_earnings = orders.filter(status='delivered').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_rental_earnings = rentals.filter(status='completed').aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_earnings = total_order_earnings + total_rental_earnings
        
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
            'total_earnings': total_earnings,
            'total_equipment': total_equipment,
            'available_equipment': available_equipment,
        }
        
        serializer = SupplierDashboardSerializer(stats)
        return Response(serializer.data)


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
        """Get current supplier's products - auto-creates profile if needed"""
        supplier_profile = get_or_create_supplier_profile(request.user)
        products = Product.objects.filter(supplier=supplier_profile)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
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

    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        """Manually adjust stock quantity and log the change"""
        try:
            product = self.get_object()
            quantity_change = int(request.data.get('quantity', 0))
            change_type = request.data.get('change_type', 'adjustment')
            note = request.data.get('note', '')
            
            if quantity_change == 0:
                return Response({'error': 'Quantity change cannot be zero'}, status=status.HTTP_400_BAD_REQUEST)
            
            previous_stock = product.stock_quantity
            product.stock_quantity += quantity_change
            
            if product.stock_quantity < 0:
                return Response({'error': 'Stock cannot be negative'}, status=status.HTTP_400_BAD_REQUEST)
                
            product.save()
            
            # Log the change
            StockLog.objects.create(
                product=product,
                change_type=change_type,
                quantity=quantity_change,
                previous_stock=previous_stock,
                current_stock=product.stock_quantity,
                note=note,
                updated_by=request.user
            )
            
            return Response({
                'status': 'Stock adjusted successfully',
                'new_stock': product.stock_quantity
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def inventory_stats(self, request):
        """Get inventory overview statistics"""
        try:
            supplier_profile = SupplierProfile.objects.get(user=request.user)
            products = Product.objects.filter(supplier=supplier_profile)
            equipment = Equipment.objects.filter(supplier=supplier_profile)
            
            total_items = products.count()
            low_stock_items = products.filter(stock_quantity__lt=10, is_available=True)
            out_of_stock = products.filter(stock_quantity=0, is_available=True).count()
            
            # Category-wise distribution
            category_stats = products.values('category').annotate(count=Count('id'))
            
            # Stock logs (last 20)
            logs = StockLog.objects.filter(product__supplier=supplier_profile).order_by('-created_at')[:20]
            log_serializer = StockLogSerializer(logs, many=True)
            
            stats = {
                'total_items': total_items,
                'low_stock_count': low_stock_items.count(),
                'out_of_stock_count': out_of_stock,
                'total_equipment': equipment.count(),
                'available_equipment': equipment.filter(status='available').count(),
                'category_distribution': list(category_stats),
                'recent_activity': log_serializer.data,
                'low_stock_list': ProductSerializer(low_stock_items, many=True).data
            }
            
            return Response(stats)
        except SupplierProfile.DoesNotExist:
            return Response({'error': 'Supplier profile not found'}, status=status.HTTP_404_NOT_FOUND)


class EquipmentViewSet(viewsets.ModelViewSet):
    """ViewSet for equipment"""
    queryset = Equipment.objects.filter(is_available=True)
    serializer_class = EquipmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'equipment_type', 'brand']
    ordering_fields = ['daily_rate', 'created_at', 'rating']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search_nearby']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        supplier_profile = get_or_create_supplier_profile(self.request.user)
        serializer.save(supplier=supplier_profile)
    
    @action(detail=False, methods=['get'], url_path='my_equipment')
    def my_equipment(self, request):
        """Get current supplier's equipment - auto-creates profile if needed"""
        supplier_profile = get_or_create_supplier_profile(request.user)
        equipment = Equipment.objects.filter(supplier=supplier_profile)
        serializer = self.get_serializer(equipment, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search_nearby(self, request):
        """Search equipment by location and type"""
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        equipment_type = request.query_params.get('equipment_type')
        max_distance = float(request.query_params.get('max_distance', 50))  # km
        
        if not latitude or not longitude:
            return Response({'error': 'Latitude and longitude required'}, status=status.HTTP_400_BAD_REQUEST)
        
        latitude = float(latitude)
        longitude = float(longitude)
        
        equipment = Equipment.objects.filter(is_available=True, status='available')
        
        if equipment_type:
            equipment = equipment.filter(equipment_type=equipment_type)
        
        # Filter by distance
        nearby_equipment = []
        for equip in equipment:
            if equip.supplier.user.latitude and equip.supplier.user.longitude:
                distance = haversine(
                    longitude, latitude,
                    float(equip.supplier.user.longitude),
                    float(equip.supplier.user.latitude)
                )
                if distance <= max_distance:
                    equip_data = EquipmentSerializer(equip).data
                    equip_data['distance'] = round(distance, 2)
                    nearby_equipment.append(equip_data)
        
        # Sort by distance
        nearby_equipment.sort(key=lambda x: x['distance'])
        
        return Response(nearby_equipment)


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


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for orders"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_number', 'customer__username', 'product__name']
    ordering_fields = ['created_at', 'total_amount', 'status']
    
    def get_queryset(self):
        """Filter orders by supplier"""
        user = self.request.user
        if hasattr(user, 'supplier_profile'):
            return Order.objects.filter(supplier=user.supplier_profile)
        return Order.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get current supplier's orders"""
        try:
            supplier_profile = SupplierProfile.objects.get(user=request.user)
            orders = Order.objects.filter(supplier=supplier_profile)
            
            # Filter by status if provided
            status_filter = request.query_params.get('status')
            if status_filter:
                orders = orders.filter(status=status_filter)
            
            serializer = self.get_serializer(orders, many=True)
            return Response(serializer.data)
        except SupplierProfile.DoesNotExist:
            return Response({'error': 'Supplier profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update order status and handle inventory"""
        order = self.get_object()
        new_status = request.data.get('status')
        old_status = order.status
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Logic for inventory deduction on confirmation
        if new_status == 'confirmed' and old_status != 'confirmed':
            product = order.product
            if product.stock_quantity < order.quantity:
                return Response({'error': f'Insufficient stock. Available: {product.stock_quantity}'}, status=status.HTTP_400_BAD_REQUEST)
            
            previous_stock = product.stock_quantity
            product.stock_quantity -= order.quantity
            product.save()
            
            # Log the stock deduction
            StockLog.objects.create(
                product=product,
                change_type='sale',
                quantity=-order.quantity,
                previous_stock=previous_stock,
                current_stock=product.stock_quantity,
                note=f"Automatic deduction for Order {order.order_number}",
                updated_by=request.user
            )
        
        # Logic for inventory return on cancellation
        if new_status == 'cancelled' and old_status == 'confirmed':
            product = order.product
            previous_stock = product.stock_quantity
            product.stock_quantity += order.quantity
            product.save()
            
            # Log the stock return
            StockLog.objects.create(
                product=product,
                change_type='return',
                quantity=order.quantity,
                previous_stock=previous_stock,
                current_stock=product.stock_quantity,
                note=f"Stock returned for cancelled Order {order.order_number}",
                updated_by=request.user
            )

        order.status = new_status
        
        # Update timestamps based on status
        if new_status == 'confirmed' and not order.confirmed_at:
            order.confirmed_at = timezone.now()
        elif new_status == 'delivered' and not order.delivered_at:
            order.delivered_at = timezone.now()
        
        order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_payment_status(self, request, pk=None):
        """Update payment status"""
        order = self.get_object()
        new_payment_status = request.data.get('payment_status')
        
        if new_payment_status not in dict(Order.PAYMENT_STATUS_CHOICES):
            return Response({'error': 'Invalid payment status'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.payment_status = new_payment_status
        order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get order statistics"""
        try:
            supplier_profile = SupplierProfile.objects.get(user=request.user)
            orders = Order.objects.filter(supplier=supplier_profile)
            
            stats = {
                'total_orders': orders.count(),
                'pending_orders': orders.filter(status='pending').count(),
                'confirmed_orders': orders.filter(status='confirmed').count(),
                'processing_orders': orders.filter(status='processing').count(),
                'delivered_orders': orders.filter(status='delivered').count(),
                'cancelled_orders': orders.filter(status='cancelled').count(),
                'total_revenue': orders.filter(status='delivered').aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
                'pending_revenue': orders.filter(status__in=['pending', 'confirmed', 'processing']).aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
            }
            
            return Response(stats)
        except SupplierProfile.DoesNotExist:
            return Response({'error': 'Supplier profile not found'}, status=status.HTTP_404_NOT_FOUND)


class RentalViewSet(viewsets.ModelViewSet):
    """ViewSet for rentals"""
    queryset = Rental.objects.all()
    serializer_class = RentalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['rental_number', 'customer__username', 'equipment__name']
    ordering_fields = ['created_at', 'start_date', 'total_amount', 'status']
    
    def get_queryset(self):
        """Filter rentals by supplier"""
        user = self.request.user
        if hasattr(user, 'supplier_profile'):
            return Rental.objects.filter(supplier=user.supplier_profile)
        return Rental.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_rentals(self, request):
        """Get current supplier's rentals"""
        try:
            supplier_profile = SupplierProfile.objects.get(user=request.user)
            rentals = Rental.objects.filter(supplier=supplier_profile)
            
            # Filter by status if provided
            status_filter = request.query_params.get('status')
            if status_filter:
                rentals = rentals.filter(status=status_filter)
            
            serializer = self.get_serializer(rentals, many=True)
            return Response(serializer.data)
        except SupplierProfile.DoesNotExist:
            return Response({'error': 'Supplier profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update rental status"""
        rental = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Rental.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        rental.status = new_status
        
        # Update timestamps and equipment status based on rental status
        if new_status == 'confirmed' and not rental.confirmed_at:
            rental.confirmed_at = timezone.now()
        elif new_status == 'active' and not rental.started_at:
            rental.started_at = timezone.now()
            # Update equipment status to rented
            rental.equipment.status = 'rented'
            rental.equipment.save()
        elif new_status == 'completed' and not rental.completed_at:
            rental.completed_at = timezone.now()
            # Update equipment status back to available
            rental.equipment.status = 'available'
            rental.equipment.total_rentals += 1
            rental.equipment.save()
        elif new_status == 'cancelled':
            # Make equipment available again
            rental.equipment.status = 'available'
            rental.equipment.save()
        
        rental.save()
        serializer = self.get_serializer(rental)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_payment_status(self, request, pk=None):
        """Update payment status"""
        rental = self.get_object()
        new_payment_status = request.data.get('payment_status')
        
        if new_payment_status not in dict(Rental.PAYMENT_STATUS_CHOICES):
            return Response({'error': 'Invalid payment status'}, status=status.HTTP_400_BAD_REQUEST)
        
        rental.payment_status = new_payment_status
        rental.save()
        serializer = self.get_serializer(rental)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get rental statistics"""
        try:
            supplier_profile = SupplierProfile.objects.get(user=request.user)
            rentals = Rental.objects.filter(supplier=supplier_profile)
            
            stats = {
                'total_rentals': rentals.count(),
                'pending_rentals': rentals.filter(status='pending').count(),
                'confirmed_rentals': rentals.filter(status='confirmed').count(),
                'active_rentals': rentals.filter(status='active').count(),
                'completed_rentals': rentals.filter(status='completed').count(),
                'cancelled_rentals': rentals.filter(status='cancelled').count(),
                'total_revenue': rentals.filter(status='completed').aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
                'pending_revenue': rentals.filter(status__in=['pending', 'confirmed', 'active']).aggregate(Sum('total_amount'))['total_amount__sum'] or 0,
            }
            
            return Response(stats)
        except SupplierProfile.DoesNotExist:
            return Response({'error': 'Supplier profile not found'}, status=status.HTTP_404_NOT_FOUND)
