from django.db import models
from django.conf import settings
from farmers.models import FarmProduce

class ConsumerProfile(models.Model):
    """Extended profile for consumers"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='consumer_profile')
    delivery_addresses = models.TextField(blank=True, help_text="JSON format for multiple addresses")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - Consumer"
    
    class Meta:
        ordering = ['-created_at']


class ProduceOrder(models.Model):
    """Orders placed by consumers for farm produce"""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('packed', 'Packed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )
    
    consumer = models.ForeignKey(ConsumerProfile, on_delete=models.CASCADE, related_name='orders')
    produce = models.ForeignKey(FarmProduce, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    delivery_address = models.TextField()
    delivery_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order #{self.id} - {self.consumer.user.username}"
    
    class Meta:
        ordering = ['-created_at']


class ProduceReview(models.Model):
    """Reviews for farm produce"""
    produce = models.ForeignKey(FarmProduce, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.produce.name} - {self.rating} stars"
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['produce', 'reviewer']


class Cart(models.Model):
    """Shopping cart for consumers"""
    consumer = models.ForeignKey(ConsumerProfile, on_delete=models.CASCADE, related_name='cart_items')
    produce = models.ForeignKey(FarmProduce, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.consumer.user.username} - {self.produce.name}"
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['consumer', 'produce']
