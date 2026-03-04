#!/usr/bin/env python
"""
Script to delete sample/test suppliers from the database
This will remove all sample suppliers created during testing
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

from django.contrib.auth import get_user_model
from suppliers.models import SupplierProfile

User = get_user_model()

def delete_sample_suppliers():
    """Delete all sample/test suppliers"""
    
    # List of sample supplier usernames from create_sample_suppliers.py
    sample_usernames = [
        'supplier1', 'supplier2', 'supplier3', 'supplier4', 'supplier5',
        'supplier6', 'supplier7', 'supplier8', 'supplier9', 'supplier10'
    ]
    
    # Additional patterns to identify test suppliers
    sample_emails = ['@test.com', '@example.com', '@sample.com']
    
    deleted_count = 0
    
    # Delete by username
    for username in sample_usernames:
        try:
            user = User.objects.filter(username=username).first()
            if user:
                print(f"Deleting user and profile: {username}")
                # This will cascade delete the supplier profile
                user.delete()
                deleted_count += 1
        except Exception as e:
            print(f"Error deleting {username}: {e}")
    
    # Delete suppliers with test/sample emails
    for email_pattern in sample_emails:
        try:
            test_users = User.objects.filter(email__icontains=email_pattern, user_type='supplier')
            count = test_users.count()
            if count > 0:
                print(f"Deleting {count} users with email pattern '{email_pattern}'")
                test_users.delete()
                deleted_count += count
        except Exception as e:
            print(f"Error deleting users with pattern {email_pattern}: {e}")
    
    # Optional: Delete profiles with specific test business names
    test_business_names = [
        'Green Valley Suppliers',
        'Agro Tech Supplies',
        'Farm Fresh Products',
        'Organic Farm Supplies',
        'Modern Agro Solutions',
        'Traditional Seeds Co',
        'Eco Friendly Farms',
        'Premium Agro Products',
        'Rural Development Supplies',
        'Smart Farming Solutions'
    ]
    
    for business_name in test_business_names:
        try:
            profiles = SupplierProfile.objects.filter(business_name=business_name)
            if profiles.exists():
                count = profiles.count()
                print(f"Deleting supplier profile: {business_name}")
                # Delete the associated users
                for profile in profiles:
                    if profile.user:
                        profile.user.delete()
                deleted_count += count
        except Exception as e:
            print(f"Error deleting profile {business_name}: {e}")
    
    print(f"\n✅ Successfully deleted {deleted_count} sample suppliers!")
    print(f"✅ Only real suppliers from your database will now be shown.")
    
    # Show remaining suppliers
    remaining = SupplierProfile.objects.filter(is_active=True).count()
    print(f"\nℹ️  Remaining active suppliers in database: {remaining}")
    
    if remaining > 0:
        print("\nRemaining suppliers:")
        for profile in SupplierProfile.objects.filter(is_active=True).select_related('user'):
            print(f"  - {profile.business_name or profile.shop_name} (User: {profile.user.username})")

if __name__ == '__main__':
    print("=" * 60)
    print("DELETE SAMPLE SUPPLIERS")
    print("=" * 60)
    print("\nThis script will delete all test/sample suppliers from the database.")
    print("Only real suppliers will remain.\n")
    
    confirm = input("Are you sure you want to proceed? (yes/no): ")
    
    if confirm.lower() == 'yes':
        delete_sample_suppliers()
    else:
        print("\n❌ Operation cancelled.")
