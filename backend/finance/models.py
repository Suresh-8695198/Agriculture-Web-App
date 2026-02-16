from django.db import models
from django.conf import settings

class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = (
        ('credit', 'Credit (Earnings)'),
        ('debit', 'Debit (Payout/Refund)'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE_CHOICES)
    description = models.CharField(max_length=255)
    
    # We use string references to avoid circular imports if possible, or precise imports
    # Since suppliers is already loaded detailed, we can import models here.
    # Note: If Order/Rental are in suppliers, we can import them.
    
    order = models.ForeignKey('suppliers.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    rental = models.ForeignKey('suppliers.Rental', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    reference_id = models.CharField(max_length=100, blank=True, help_text="Transaction ID from payment gateway")

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.user.username}"
    
    class Meta:
        ordering = ['-created_at']

class PayoutRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('processed', 'Processed'),
        ('rejected', 'Rejected'),
    )
    
    supplier = models.ForeignKey('suppliers.SupplierProfile', on_delete=models.CASCADE, related_name='payouts')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bank_details = models.TextField(help_text="Bank Account Details snapshot")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payout {self.amount} - {self.supplier.business_name}"
    
    class Meta:
        ordering = ['-created_at']
