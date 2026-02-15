#!/usr/bin/env python
"""
Fix Supplier Portal 404 Issues
This script diagnoses and fixes common 404 errors in the supplier portal
"""
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.urls import get_resolver
from suppliers.models import SupplierProfile

User = get_user_model()


def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 80)
    print(f"  {text}")
    print("=" * 80)


def check_supplier_urls():
    """Check if supplier URLs are properly registered"""
    print_header("Checking URL Registration")
    
    resolver = get_resolver()
    supplier_urls = []
    
    for pattern in resolver.url_patterns:
        pattern_str = str(pattern.pattern)
        if 'suppliers' in pattern_str:
            if hasattr(pattern, 'url_patterns'):
                for sub_pattern in pattern.url_patterns:
                    full_url = f"/api/suppliers/{sub_pattern.pattern}"
                    supplier_urls.append(full_url)
    
    required_urls = [
        'profiles/my_profile/',
        'profiles/dashboard_stats/',
        'products/my_products/',
    ]
    
    print("\n✓ Checking required URLs:")
    all_found = True
    for req_url in required_urls:
        found = any(req_url in url for url in supplier_urls)
        status = "✓ FOUND" if found else "✗ MISSING"
        print(f"  {status}: {req_url}")
        if not found:
            all_found = False
    
    if all_found:
        print("\n✓ All required URLs are registered correctly!")
    else:
        print("\n✗ Some URLs are missing. Check backend/suppliers/urls.py")
    
    return all_found


def check_supplier_profiles():
    """Check and create supplier profiles if needed"""
    print_header("Checking Supplier Profiles")
    
    suppliers = User.objects.filter(user_type='supplier')
    print(f"\nFound {suppliers.count()} supplier user(s)")
    
    if suppliers.count() == 0:
        print("\n⚠ No supplier users found!")
        print("  Please create a supplier user account first.")
        return False
    
    created_count = 0
    updated_count = 0
    
    for user in suppliers:
        print(f"\n  User: {user.username} ({user.email})")
        
        if hasattr(user, 'supplier_profile'):
            print(f"    ✓ Profile exists: {user.supplier_profile.business_name}")
            updated_count += 1
        else:
            print("    ✗ No profile found - Creating...")
            try:
                profile = SupplierProfile.objects.create(
                    user=user,
                    business_name=f"{user.username}'s Business",
                    owner_name=user.username,
                    description="Default supplier profile - Please update your business details",
                )
                print(f"    ✓ Profile created successfully!")
                created_count += 1
            except Exception as e:
                print(f"    ✗ Error creating profile: {e}")
                return False
    
    if created_count > 0:
        print(f"\n✓ Created {created_count} new supplier profile(s)")
    if updated_count > 0:
        print(f"✓ Found {updated_count} existing supplier profile(s)")
    
    return True


def test_profile_access():
    """Test if profiles can be accessed"""
    print_header("Testing Profile Access")
    
    suppliers = User.objects.filter(user_type='supplier')
    
    if suppliers.count() == 0:
        print("\n✗ No supplier users to test")
        return False
    
    all_passed = True
    
    for user in suppliers:
        print(f"\n  Testing user: {user.username}")
        
        try:
            profile = SupplierProfile.objects.get(user=user)
            print(f"    ✓ Profile accessible")
            print(f"      Business Name: {profile.business_name}")
            print(f"      Owner: {profile.owner_name}")
        except SupplierProfile.DoesNotExist:
            print(f"    ✗ Profile not found (this shouldn't happen!)")
            all_passed = False
        except Exception as e:
            print(f"    ✗ Error: {e}")
            all_passed = False
    
    return all_passed


def main():
    """Main function"""
    print("\n" + "=" * 80)
    print("  SUPPLIER PORTAL 404 DIAGNOSTIC & FIX TOOL")
    print("=" * 80)
    
    # Step 1: Check URLs
    urls_ok = check_supplier_urls()
    
    # Step 2: Check and create profiles
    profiles_ok = check_supplier_profiles()
    
    # Step 3: Test profile access
    access_ok = test_profile_access()
    
    # Final summary
    print_header("SUMMARY")
    
    print("\nStatus:")
    print(f"  {'✓' if urls_ok else '✗'} URL Registration")
    print(f"  {'✓' if profiles_ok else '✗'} Supplier Profiles")
    print(f"  {'✓' if access_ok else '✗'} Profile Access")
    
    if urls_ok and profiles_ok and access_ok:
        print("\n" + "=" * 80)
        print("  ✓ ALL CHECKS PASSED!")
        print("  Your supplier portal should work now.")
        print("  Please restart the Django server and try again.")
        print("=" * 80)
    else:
        print("\n" + "=" * 80)
        print("  ✗ SOME ISSUES FOUND")
        print("  Please fix the issues above and run this script again.")
        print("=" * 80)
    
    print("\nNext steps:")
    print("  1. Restart the Django backend server (Ctrl+C then run again)")
    print("  2. Clear browser cache or use Incognito mode")
    print("  3. Log in again as a supplier user")
    print("  4. Navigate to supplier dashboard")
    print("\n")


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
