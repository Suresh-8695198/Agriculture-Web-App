#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

from django.contrib.auth import get_user_model
from farmers.models import FarmerProfile

User = get_user_model()

def create_farmer_profiles():
    farmers = User.objects.filter(user_type='farmer')
    created_count = 0
    
    for user in farmers:
        profile, created = FarmerProfile.objects.get_or_create(
            user=user,
            defaults={
                'farm_name': f"{user.username}'s Farm",
                'farm_size': 0,
                'crops_grown': ''
            }
        )
        if created:
            created_count += 1
            print(f'✓ Created FarmerProfile for {user.username}')
        else:
            print(f'- FarmerProfile already exists for {user.username}')
    
    if created_count == 0:
        print('\n✓ All farmer users already have profiles')
    else:
        print(f'\n✓ Successfully created {created_count} new FarmerProfile(s)')

if __name__ == '__main__':
    create_farmer_profiles()
