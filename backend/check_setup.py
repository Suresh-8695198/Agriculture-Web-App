import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

from django.urls import get_resolver
from accounts.models import User
from suppliers.models import SupplierProfile

print("=" * 60)
print("CHECKING SUPPLIER SETUP")
print("=" * 60)

# Check URLs
print("\n1. Checking URL Patterns...")
resolver = get_resolver()
for pattern in resolver.url_patterns:
    if 'suppliers' in str(pattern.pattern):
        print(f"   Found: {pattern.pattern}")
        if hasattr(pattern, 'url_patterns'):
            for sub in pattern.url_patterns[:10]:  # First 10
                print(f"     - {sub.pattern}")

# Check users and profiles
print("\n2. Checking Supplier Users...")
suppliers = User.objects.filter(user_type='supplier')
print(f"   Total supplier users: {suppliers.count()}")

for user in suppliers:
    has_profile = hasattr(user, 'supplier_profile')
    print(f"   - {user.email} | Has profile: {has_profile}")
    if not has_profile:
        print("     Creating profile...")
        SupplierProfile.objects.create(
            user=user,
            business_name=f"{user.username}'s Business",
            owner_name=user.username,
            description="Auto-created profile"
        )
        print("     ✓ Profile created!")

print("\n" + "=" * 60)
print("DONE - Please restart Django server now!")
print("=" * 60)
