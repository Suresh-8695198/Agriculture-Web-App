from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

class User(AbstractUser):
    """Custom user model for AgriConnect platform"""
    
    USER_TYPE_CHOICES = (
        ('farmer', 'Farmer'),
        ('supplier', 'Supplier'),
        ('consumer', 'Consumer'),
    )
    
    # Override username to allow spaces and more characters
    username_validator = RegexValidator(
        regex=r'^[\w\s.@+-]+$',
        message='Username can contain letters, numbers, spaces, and @/./+/-/_ characters.',
    )
    
    username = models.CharField(
        max_length=150,
        unique=True,
        validators=[username_validator],
        error_messages={
            'unique': "A user with that username already exists.",
        },
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    phone_number = models.CharField(max_length=15, unique=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    address = models.TextField(blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username} ({self.user_type})"
    
    class Meta:
        ordering = ['-created_at']
