from django.db import models
from django.conf import settings

class SupplierProfile(models.Model):
    """Extended profile for suppliers"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='supplier_profile')
    business_name = models.CharField(max_length=200)
    business_license = models.CharField(max_length=100, blank=True)
    gst_number = models.CharField(max_length=15, blank=True)
    description = models.TextField(blank=True)
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
