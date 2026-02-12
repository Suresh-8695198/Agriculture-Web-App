from django.db import models
from django.conf import settings
from suppliers.models import Product

class FarmerProfile(models.Model):
    """Extended profile for farmers"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='farmer_profile')
    farm_name = models.CharField(max_length=200, blank=True)
    farm_size = models.DecimalField(max_digits=10, decimal_places=2, help_text="Size in acres", null=True, blank=True)
    crops_grown = models.TextField(blank=True, help_text="Comma-separated list of crops")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Farm"
    
    class Meta:
        ordering = ['-created_at']


class FarmProduce(models.Model):
    """Agricultural produce listed by farmers"""
    
    CATEGORY_CHOICES = (
        ('paddy', 'Paddy/Unhusked Rice'),
        ('rice', 'Rice'),
        ('wheat', 'Wheat'),
        ('vegetables', 'Vegetables'),
        ('fruits', 'Fruits'),
        ('pulses', 'Pulses'),
        ('spices', 'Spices'),
        ('other', 'Other'),
    )
    
    UNIT_CHOICES = (
        ('kg', 'Kilogram'),
        ('quintal', 'Quintal'),
        ('ton', 'Ton'),
        ('bag', 'Bag'),
    )
    
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='produce')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    available_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='produce/', null=True, blank=True)
    is_available = models.BooleanField(default=True)
    harvest_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.farmer.user.username}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Farm Produce"


class SupplierOrder(models.Model):
    """Orders placed by farmers to suppliers"""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='supplier_orders')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_rental = models.BooleanField(default=False)
    rental_days = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    delivery_address = models.TextField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order #{self.id} - {self.farmer.user.username}"
    
    class Meta:
        ordering = ['-created_at']
