from django.db import models
from django.conf import settings

class SupplierProfile(models.Model):
    """Extended profile for suppliers"""
    BUSINESS_TYPE_CHOICES = (
        ('seeds', 'Seeds'),
        ('fertilizer', 'Fertilizer'),
        ('manure', 'Manure'),
        ('equipment_rental', 'Equipment Rental'),
    )
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='supplier_profile')
    
    # Basic Details
    shop_name = models.CharField(max_length=200, blank=True)
    owner_name = models.CharField(max_length=200, blank=True)
    alternate_number = models.CharField(max_length=15, blank=True)
    business_name = models.CharField(max_length=200)
    business_license = models.CharField(max_length=100, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    gst_number = models.CharField(max_length=15, blank=True)
    description = models.TextField(blank=True)
    years_of_experience = models.IntegerField(default=0)
    
    # Address Details
    address_line_1 = models.CharField(max_length=255, blank=True)
    address_line_2 = models.CharField(max_length=255, blank=True)
    village = models.CharField(max_length=100, blank=True)
    taluk = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pin_code = models.CharField(max_length=6, blank=True)
    landmark = models.CharField(max_length=200, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Business Hours
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    working_days = models.CharField(max_length=200, blank=True, help_text="Comma-separated days: Mon,Tue,Wed...")
    emergency_contact_available = models.BooleanField(default=False)

    # Bank & Payment Details
    bank_account_holder = models.CharField(max_length=200, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    ifsc_code = models.CharField(max_length=20, blank=True)
    upi_id = models.CharField(max_length=50, blank=True)
    pan_number = models.CharField(max_length=20, blank=True)
    is_bank_verified = models.BooleanField(default=False)

    # Business Type - stored as comma-separated values
    business_types = models.CharField(max_length=200, blank=True, help_text="Comma-separated: seeds,fertilizer,manure,equipment_rental")
    
    # Service Category Settings (Toggles)
    enable_seeds = models.BooleanField(default=False)
    enable_fertilizers = models.BooleanField(default=False)
    enable_manure = models.BooleanField(default=False)
    enable_equipment_rental = models.BooleanField(default=False)
    enable_agro_tools = models.BooleanField(default=False)

    # Delivery & Service Options
    home_delivery_available = models.BooleanField(default=False)
    delivery_radius_km = models.IntegerField(default=0)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    delivery_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    pickup_available = models.BooleanField(default=True)

    # Notification Preferences
    notify_orders = models.BooleanField(default=True)
    notify_rentals = models.BooleanField(default=True)
    notify_payments = models.BooleanField(default=True)
    notify_low_stock = models.BooleanField(default=True)
    notify_sms = models.BooleanField(default=True)
    notify_email = models.BooleanField(default=True)

    # Documents
    id_proof = models.FileField(upload_to='supplier_documents/id_proofs/', null=True, blank=True)
    business_license_doc = models.FileField(upload_to='supplier_documents/licenses/', null=True, blank=True)
    gst_certificate = models.FileField(upload_to='supplier_documents/gst/', null=True, blank=True)
    shop_image = models.ImageField(upload_to='supplier_documents/shop_images/', null=True, blank=True)
    equipment_registration = models.FileField(upload_to='supplier_documents/equipment/', null=True, blank=True)
    
    VERIFICATION_STATUS_CHOICES = (
        ('pending', 'Pending Verification'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='pending')
    admin_comments = models.TextField(blank=True)

    # Account Status
    subscription_plan = models.CharField(max_length=50, default='Free')
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    
    # Ratings
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_reviews = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.business_name
    
    class Meta:
        ordering = ['-rating', '-created_at']


class Product(models.Model):
    """Products/Services offered by suppliers"""
    
    CATEGORY_CHOICES = (
        ('seeds', 'Seeds'),
        ('fertilizer', 'Fertilizer'),
        ('manure', 'Manure'),
        ('plant_food', 'Plant Food'),
        ('tractor', 'Tractor'),
        ('equipment', 'Equipment'),
        ('pesticide', 'Pesticide'),
        ('tools', 'Tools'),
        ('other', 'Other'),
    )
    
    UNIT_CHOICES = (
        ('kg', 'Kilogram'),
        ('liter', 'Liter'),
        ('piece', 'Piece'),
        ('bag', 'Bag'),
        ('hour', 'Hour/Day'),
    )
    
    supplier = models.ForeignKey(SupplierProfile, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    stock_quantity = models.IntegerField(default=0)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    is_available = models.BooleanField(default=True)
    is_rental = models.BooleanField(default=False)  # For tractors/equipment rental
    rental_price_per_day = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.supplier.business_name}"
    
    class Meta:
        ordering = ['-created_at']


class StockLog(models.Model):
    """History of stock changes for inventory tracking"""
    CHANGE_TYPE_CHOICES = (
        ('restock', 'Restock / Entry'),
        ('sale', 'Sale / Order'),
        ('adjustment', 'Manual Adjustment'),
        ('return', 'Return'),
        ('damaged', 'Damaged / Waste'),
    )
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_logs')
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPE_CHOICES)
    quantity = models.IntegerField()  # positive for increase, negative for decrease
    previous_stock = models.IntegerField()
    current_stock = models.IntegerField()
    note = models.TextField(blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.product.name} - {self.change_type} ({self.quantity})"
    
    class Meta:
        ordering = ['-created_at']


class Equipment(models.Model):
    """Equipment/Machinery for rental"""
    
    EQUIPMENT_TYPE_CHOICES = (
        ('tractor', 'Tractor'),
        ('harvester', 'Harvester'),
        ('plough', 'Plough'),
        ('seeder', 'Seeder'),
        ('sprayer', 'Sprayer'),
        ('thresher', 'Thresher'),
        ('cultivator', 'Cultivator'),
        ('rotavator', 'Rotavator'),
        ('water_pump', 'Water Pump'),
        ('other', 'Other'),
    )
    
    CONDITION_CHOICES = (
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('needs_repair', 'Needs Repair'),
    )
    
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('rented', 'Rented'),
        ('maintenance', 'Under Maintenance'),
        ('unavailable', 'Unavailable'),
    )
    
    supplier = models.ForeignKey(SupplierProfile, on_delete=models.CASCADE, related_name='equipment')
    name = models.CharField(max_length=200)
    equipment_type = models.CharField(max_length=50, choices=EQUIPMENT_TYPE_CHOICES)
    brand = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    year_of_manufacture = models.IntegerField(null=True, blank=True)
    description = models.TextField()
    
    # Rental Information
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    weekly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monthly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Equipment Details
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    fuel_type = models.CharField(max_length=50, blank=True)  # Diesel, Petrol, Electric
    horsepower = models.IntegerField(null=True, blank=True)
    
    # Additional Information
    requires_operator = models.BooleanField(default=False)
    operator_charge_per_day = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Availability
    is_available = models.BooleanField(default=True)
    last_maintenance_date = models.DateField(null=True, blank=True)
    next_maintenance_date = models.DateField(null=True, blank=True)
    
    # Media
    image = models.ImageField(upload_to='equipment/', null=True, blank=True)
    
    # Metadata
    total_rentals = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.supplier.business_name}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Equipment'


class Order(models.Model):
    """Orders for products"""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('ready', 'Ready for Pickup/Delivery'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    )
    
    DELIVERY_METHOD_CHOICES = (
        ('pickup', 'Self Pickup'),
        ('delivery', 'Home Delivery'),
    )
    
    # Order Information
    order_number = models.CharField(max_length=50, unique=True, editable=False)
    supplier = models.ForeignKey(SupplierProfile, on_delete=models.CASCADE, related_name='orders')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='product_orders')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='orders')
    
    # Order Details
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Delivery
    delivery_method = models.CharField(max_length=20, choices=DELIVERY_METHOD_CHOICES, default='pickup')
    delivery_address = models.TextField(blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    delivery_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Additional Information
    customer_notes = models.TextField(blank=True)
    supplier_notes = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate unique order number
            import random
            import string
            from django.utils import timezone
            self.order_number = f"ORD-{timezone.now().strftime('%Y%m%d')}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.order_number} - {self.product.name}"
    
    class Meta:
        ordering = ['-created_at']


class Rental(models.Model):
    """Equipment rentals"""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active/Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('deposit_paid', 'Deposit Paid'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    )
    
    # Rental Information
    rental_number = models.CharField(max_length=50, unique=True, editable=False)
    supplier = models.ForeignKey(SupplierProfile, on_delete=models.CASCADE, related_name='rentals')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='equipment_rentals')
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='rentals')
    
    # Rental Period
    start_date = models.DateField()
    end_date = models.DateField()
    actual_return_date = models.DateField(null=True, blank=True)
    rental_duration_days = models.IntegerField(editable=False)
    
    # Pricing
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    total_rental_cost = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2)
    operator_required = models.BooleanField(default=False)
    operator_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Delivery/Pickup
    delivery_address = models.TextField()
    delivery_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Additional Information
    customer_notes = models.TextField(blank=True)
    supplier_notes = models.TextField(blank=True)
    
    # Condition Tracking
    condition_at_delivery = models.CharField(max_length=20, blank=True)
    condition_at_return = models.CharField(max_length=20, blank=True)
    damage_notes = models.TextField(blank=True)
    damage_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.rental_number:
            # Generate unique rental number
            import random
            import string
            from django.utils import timezone
            self.rental_number = f"RNT-{timezone.now().strftime('%Y%m%d')}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
        
        # Calculate rental duration
        if self.start_date and self.end_date:
            self.rental_duration_days = (self.end_date - self.start_date).days + 1
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.rental_number} - {self.equipment.name}"
    
    class Meta:
        ordering = ['-created_at']


class SupplierReview(models.Model):
    """Reviews for suppliers"""
    supplier = models.ForeignKey(SupplierProfile, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.supplier.business_name} - {self.rating} stars"
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['supplier', 'reviewer']


class ProductReview(models.Model):
    """Reviews for products"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.product.name} - {self.rating} stars"
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['product', 'reviewer']
