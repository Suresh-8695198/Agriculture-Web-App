#!/usr/bin/env python
"""
Script to create sample suppliers for testing the Find Suppliers feature
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

def create_sample_suppliers():
    """Create sample suppliers with location data"""
    
    suppliers_data = [
        {
            'username': 'supplier1',
            'email': 'supplier1@test.com',
            'phone_number': '+91 98765 43210',
            'user_type': 'supplier',
            'latitude': 13.0827,  # Bangalore area
            'longitude': 77.5877,
            'profile': {
                'business_name': 'Green Valley Suppliers',
                'shop_name': 'Green Valley Agro Store',
                'owner_name': 'Rajesh Kumar',
                'business_types': 'seeds, fertilizers, manure',
                'description': 'Quality agricultural supplies with 15+ years of experience',
                'years_of_experience': 15,
                'village': 'Whitefield',
                'district': 'Bangalore Urban',
                'state': 'Karnataka',
                'pin_code': '560066',
                'latitude': 13.0827,
                'longitude': 77.5877,
                'enable_seeds': True,
                'enable_fertilizers': True,
                'enable_manure': True,
                'home_delivery_available': True,
                'delivery_radius_km': 25,
                'is_active': True,
                'verification_status': 'verified',
                'rating': 4.5
            }
        },
        {
            'username': 'supplier2',
            'email': 'supplier2@test.com',
            'phone_number': '+91 98765 43211',
            'user_type': 'supplier',
            'latitude': 13.0352,  # Bangalore South
            'longitude': 77.5971,
            'profile': {
                'business_name': 'Agro Tech Supplies',
                'shop_name': 'Agro Tech Equipment Hub',
                'owner_name': 'Suresh Reddy',
                'business_types': 'equipment_rental, agro_tools',
                'description': 'Premium equipment rental and agricultural tools',
                'years_of_experience': 10,
                'village': 'BTM Layout',
                'district': 'Bangalore Urban',
                'state': 'Karnataka',
                'pin_code': '560076',
                'latitude': 13.0352,
                'longitude': 77.5971,
                'enable_equipment_rental': True,
                'enable_agro_tools': True,
                'home_delivery_available': True,
                'delivery_radius_km': 30,
                'is_active': True,
                'verification_status': 'verified',
                'rating': 4.8
            }
        },
        {
            'username': 'supplier3',
            'email': 'supplier3@test.com',
            'phone_number': '+91 98765 43212',
            'user_type': 'supplier',
            'latitude': 13.1986,  # Bangalore North
            'longitude': 77.7066,
            'profile': {
                'business_name': 'Farm Fresh Products',
                'shop_name': 'Farm Fresh Agro Center',
                'owner_name': 'Kavitha Rao',
                'business_types': 'seeds, manure, fertilizers',
                'description': 'Organic and traditional farming supplies',
                'years_of_experience': 8,
                'village': 'Hoodi',
                'district': 'Bangalore Urban',
                'state': 'Karnataka',
                'pin_code': '560048',
                'latitude': 13.1986,
                'longitude': 77.7066,
                'enable_seeds': True,
                'enable_fertilizers': True,
                'enable_manure': True,
                'home_delivery_available': False,
                'pickup_available': True,
                'is_active': False,  # Unavailable
                'verification_status': 'verified',
                'rating': 4.3
            }
        },
        {
            'username': 'supplier4',
            'email': 'supplier4@test.com',
            'phone_number': '+91 98765 43213',
            'user_type': 'supplier',
            'latitude': 12.9716,  # Bangalore Central
            'longitude': 77.5946,
            'profile': {
                'business_name': 'Modern Agro Solutions',
                'shop_name': 'Modern Agro Store',
                'owner_name': 'Prakash Shetty',
                'business_types': 'seeds, fertilizers, equipment_rental',
                'description': 'Complete agricultural solutions under one roof',
                'years_of_experience': 20,
                'village': 'Indiranagar',
                'district': 'Bangalore Urban',
                'state': 'Karnataka',
                'pin_code': '560038',
                'latitude': 12.9716,
                'longitude': 77.5946,
                'enable_seeds': True,
                'enable_fertilizers': True,
                'enable_equipment_rental': True,
                'home_delivery_available': True,
                'delivery_radius_km': 50,
                'is_active': True,
                'verification_status': 'verified',
                'rating': 4.9
            }
        },
        {
            'username': 'supplier5',
            'email': 'supplier5@test.com',
            'phone_number': '+91 98765 43214',
            'user_type': 'supplier',
            'latitude': 13.0569,  # Bangalore East
            'longitude': 77.6412,
            'profile': {
                'business_name': 'Krishna Seeds & Fertilizers',
                'shop_name': 'Krishna Agro Mart',
                'owner_name': 'Venkatesh Murthy',
                'business_types': 'seeds, fertilizers',
                'description': 'Trusted name in quality seeds and fertilizers',
                'years_of_experience': 12,
                'village': 'Marathahalli',
                'district': 'Bangalore Urban',
                'state': 'Karnataka',
                'pin_code': '560037',
                'latitude': 13.0569,
                'longitude': 77.6412,
                'enable_seeds': True,
                'enable_fertilizers': True,
                'home_delivery_available': True,
                'delivery_radius_km': 20,
                'is_active': True,
                'verification_status': 'verified',
                'rating': 4.6
            }
        }
    ]
    
    created_count = 0
    updated_count = 0
    
    for supplier_data in suppliers_data:
        username = supplier_data['username']
        
        # Create or get user
        user, user_created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': supplier_data['email'],
                'phone_number': supplier_data['phone_number'],
                'user_type': supplier_data['user_type'],
                'latitude': supplier_data['latitude'],
                'longitude': supplier_data['longitude'],
            }
        )
        
        if user_created:
            user.set_password('password123')  # Set a default password
            user.save()
            print(f"✓ Created user: {username}")
        else:
            # Update location if user already exists
            user.latitude = supplier_data['latitude']
            user.longitude = supplier_data['longitude']
            user.save()
            print(f"✓ Updated user location: {username}")
        
        # Create or update supplier profile
        profile_data = supplier_data['profile']
        profile, profile_created = SupplierProfile.objects.get_or_create(
            user=user,
            defaults=profile_data
        )
        
        if profile_created:
            created_count += 1
            print(f"  ✓ Created supplier profile: {profile_data['business_name']}")
        else:
            # Update existing profile
            for key, value in profile_data.items():
                setattr(profile, key, value)
            profile.save()
            updated_count += 1
            print(f"  ✓ Updated supplier profile: {profile_data['business_name']}")
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  - Suppliers created: {created_count}")
    print(f"  - Suppliers updated: {updated_count}")
    print(f"  - Total suppliers: {SupplierProfile.objects.count()}")
    print(f"{'='*60}\n")
    print("Sample suppliers are ready for testing!")
    print("Default password for all suppliers: password123")

if __name__ == '__main__':
    print("Creating sample suppliers...\n")
    create_sample_suppliers()
