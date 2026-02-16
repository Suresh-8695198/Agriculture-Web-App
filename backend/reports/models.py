from django.db import models
from django.conf import settings
import uuid

class GeneratedReport(models.Model):
    REPORT_TYPES = (
        ('inventory', 'Inventory Status'),
        ('sales', 'Sales & Earnings'),
        ('orders', 'Order History'),
        ('activity', 'User Activity'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='generated_reports')
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    parameters = models.TextField(blank=True, help_text="JSON parameters used for generation")
    file = models.FileField(upload_to='reports/', blank=True, null=True)
    status = models.CharField(max_length=20, default='completed')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.report_type} - {self.created_at.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-created_at']
