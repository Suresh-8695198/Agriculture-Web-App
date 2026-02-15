#!/usr/bin/env python
"""
Clean up duplicate supplier profiles and fix database issues
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

from django.contrib.auth import get_user_model
from suppliers.models import SupplierProfile

User = get_user_model()


def cleanup_database():
    print("=" * 60)
    print("DATABASE CLEANUP TOOL")
    print("=" * 60)
    
    # Option 1: List all supplier profiles
    print("\n1. Current Supplier Profiles:")
    profiles = SupplierProfile.objects.all()
    print(f"   Total profiles: {profiles.count()}")
    
    for profile in profiles:
        print(f"   - ID: {profile.id} | User: {profile.user.email} | Business: {profile.business_name}")
    
    # Option 2: Find users without profiles
    print("\n2. Supplier Users Without Profiles:")
    suppliers = User.objects.filter(user_type='supplier')
    without_profile = []
    
    for user in suppliers:
        if not hasattr(user, 'supplier_profile'):
            without_profile.append(user)
            print(f"   - {user.email} (ID: {user.id})")
    
    print(f"   Total: {len(without_profile)}")
    
    # Option 3: Check for issues
    print("\n3. Checking for Issues:")
    
    # Check for orphaned profiles
    orphaned = []
    for profile in profiles:
        try:
            if profile.user.user_type != 'supplier':
                orphaned.append(profile)
                print(f"   ⚠ WARNING: Profile {profile.id} belongs to non-supplier user {profile.user.email}")
        except:
            print(f"   ⚠ WARNING: Profile {profile.id} has invalid user reference")
    
    if not orphaned:
        print("   ✓ No issues found")
    
    # Provide commands
    print("\n" + "=" * 60)
    print("CLEANUP COMMANDS")
    print("=" * 60)
    
    print("\n>>> To delete ALL supplier profiles (careful!):")
    print('    python manage.py shell -c "from suppliers.models import SupplierProfile; SupplierProfile.objects.all().delete(); print(\'All profiles deleted\')"')
    
    print("\n>>> To delete a specific profile by ID:")
    print('    python manage.py shell -c "from suppliers.models import SupplierProfile; SupplierProfile.objects.filter(id=PROFILE_ID).delete(); print(\'Profile deleted\')"')
    
    print("\n>>> To delete by user email:")
    print('    python manage.py shell -c "from accounts.models import User; from suppliers.models import SupplierProfile; user = User.objects.get(email=\'EMAIL\'); SupplierProfile.objects.filter(user=user).delete(); print(\'Profile deleted\')"')
    
    print("\n>>> To create missing profiles:")
    print('    python manage.py create_supplier_profile --all')
    
    print("\n>>> To reset and recreate all profiles:")
    print('    1. python manage.py shell -c "from suppliers.models import SupplierProfile; count = SupplierProfile.objects.all().delete()[0]; print(f\'{count} profiles deleted\')"')
    print('    2. python manage.py create_supplier_profile --all')
    
    print("\n" + "=" * 60)


if __name__ == '__main__':
    try:
        cleanup_database()
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
