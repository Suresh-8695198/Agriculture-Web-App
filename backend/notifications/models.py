from django.db import models
from django.conf import settings

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional link to source
    TYPE_CHOICES = (
        ('order', 'Order Update'),
        ('rental', 'Rental Update'),
        ('payment', 'Payment Alert'),
        ('review', 'New Review'),
        ('system', 'System Message'),
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    
    # Generic linking if needed, or specific
    related_object_id = models.CharField(max_length=100, blank=True, null=True) # e.g. "ORD-12345"
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    class Meta:
        ordering = ['-created_at']
