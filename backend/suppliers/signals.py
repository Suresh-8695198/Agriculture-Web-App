from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import SupplierProfile

User = get_user_model()


@receiver(post_save, sender=User)
def create_supplier_profile(sender, instance, created, **kwargs):
    """Auto-create supplier profile when a supplier user is created"""
    if created and instance.user_type == 'supplier':
        # Check if profile already exists to prevent duplicates
        if not SupplierProfile.objects.filter(user=instance).exists():
            try:
                SupplierProfile.objects.create(
                    user=instance,
                    business_name=f"{instance.username}'s Business",
                    owner_name=instance.username,
                    description="Please update your business profile",
                )
            except Exception as e:
                # If creation fails, log it but don't crash
                print(f"Failed to auto-create supplier profile for {instance.username}: {e}")
