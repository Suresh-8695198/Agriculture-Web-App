
import os
import django
import sys

# Ensure current directory is in sys.path
sys.path.append(os.getcwd())

os.environ['DJANGO_SETTINGS_MODULE'] = 'agriconnect.settings'
django.setup()

from farmers.models import FarmerProfile, FarmProduce
from django.contrib.auth import get_user_model

User = get_user_model()

print("Checking Farmers...")
for user in User.objects.filter(user_type='farmer'):
    if not hasattr(user, 'farmer_profile'):
        print(f"✗ User {user.username} has no FarmerProfile")
    else:
        print(f"✓ User {user.username} has FarmerProfile")

print("\nChecking Produce...")
for produce in FarmProduce.objects.all():
    try:
        f = produce.farmer
        u = f.user
        print(f"✓ Produce {produce.id} ({produce.name}) has farmer {u.username}")
    except Exception as e:
        print(f"✗ Produce {produce.id} ({produce.name}) error: {e}")

