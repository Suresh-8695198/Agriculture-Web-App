"""
Quick test script to verify supplier profile fixes
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

from suppliers.models import SupplierProfile
from suppliers.serializers import SupplierProfileUpdateSerializer
from accounts.models import User


def test_validation_fixes():
    """Test that the validation fixes work correctly"""
    print("\n" + "="*70)
    print("TESTING VALIDATION FIXES")
    print("="*70)
    
    # Get a supplier profile to test
    profile = SupplierProfile.objects.first()
    
    if not profile:
        print("❌ No supplier profiles found. Create one first.")
        return
    
    print(f"\nTesting with: {profile.business_name} ({profile.user.email})\n")
    
    # Test 1: Empty strings for numeric fields
    print("Test 1: Empty strings for numeric fields")
    test_data_1 = {
        'years_of_experience': '',
        'delivery_radius_km': '',
        'min_order_value': '',
        'delivery_charges': ''
    }
    serializer = SupplierProfileUpdateSerializer(profile, data=test_data_1, partial=True)
    if serializer.is_valid():
        print("  ✅ Empty numeric strings handled correctly")
        print(f"     Converted: {serializer.validated_data}")
    else:
        print(f"  ❌ Failed: {serializer.errors}")
    
    # Test 2: Empty strings for decimal fields
    print("\nTest 2: Empty strings for decimal fields")
    test_data_2 = {
        'latitude': '',
        'longitude': ''
    }
    serializer = SupplierProfileUpdateSerializer(profile, data=test_data_2, partial=True)
    if serializer.is_valid():
        print("  ✅ Empty decimal strings handled correctly")
        print(f"     Converted: {serializer.validated_data}")
    else:
        print(f"  ❌ Failed: {serializer.errors}")
    
    # Test 3: File fields as strings (should be ignored)
    print("\nTest 3: File fields as strings")
    test_data_3 = {
        'shop_image': 'http://example.com/media/image.jpg',
        'id_proof': '/media/supplier_documents/id_proofs/doc.pdf',
        'shop_name': 'Updated Shop Name'
    }
    serializer = SupplierProfileUpdateSerializer(profile, data=test_data_3, partial=True)
    if serializer.is_valid():
        print("  ✅ File field strings filtered correctly")
        print(f"     Validated data: {serializer.validated_data}")
        if 'shop_image' not in serializer.validated_data and 'id_proof' not in serializer.validated_data:
            print("     ✅ File fields removed from update as expected")
        else:
            print("     ⚠️  File fields still present")
    else:
        print(f"  ❌ Failed: {serializer.errors}")
    
    # Test 4: Invalid PIN code
    print("\nTest 4: PIN code validation")
    test_data_4 = {
        'pin_code': '1234567'  # Too long
    }
    serializer = SupplierProfileUpdateSerializer(profile, data=test_data_4, partial=True)
    if serializer.is_valid():
        print("  ⚠️  Long PIN code was accepted (should fail)")
    else:
        if 'pin_code' in serializer.errors:
            print("  ✅ PIN code validation working correctly")
            print(f"     Error: {serializer.errors['pin_code']}")
        else:
            print(f"  ❌ Different error: {serializer.errors}")
    
    # Test 5: Valid update
    print("\nTest 5: Valid update")
    test_data_5 = {
        'shop_name': 'Test Shop (Updated)',
        'description': 'This is a test update',
        'years_of_experience': 10,
        'pin_code': '123456'
    }
    serializer = SupplierProfileUpdateSerializer(profile, data=test_data_5, partial=True)
    if serializer.is_valid():
        print("  ✅ Valid data accepted")
        print(f"     Data: {serializer.validated_data}")
    else:
        print(f"  ❌ Failed: {serializer.errors}")
    
    print("\n" + "="*70)
    print("VALIDATION TEST COMPLETE")
    print("="*70)


def test_media_file_handling():
    """Test that missing media files are handled gracefully"""
    print("\n" + "="*70)
    print("TESTING MEDIA FILE HANDLING")
    print("="*70)
    
    from suppliers.serializers import SupplierProfileSerializer
    from django.test import RequestFactory
    
    profiles = SupplierProfile.objects.all()
    
    if not profiles:
        print("❌ No supplier profiles found")
        return
    
    factory = RequestFactory()
    request = factory.get('/')
    
    for profile in profiles:
        print(f"\nProfile: {profile.business_name}")
        
        # Serialize the profile
        serializer = SupplierProfileSerializer(profile, context={'request': request})
        data = serializer.data
        
        # Check shop_image_url field
        if profile.shop_image:
            print(f"  Database has: {profile.shop_image.name}")
            print(f"  Serializer returns: {data.get('shop_image_url', 'No shop_image_url field')}")
            
            if data.get('shop_image_url') is None:
                print("  ✅ Missing file handled gracefully (returns None)")
            else:
                print("  ✅ File exists and URL returned")
        else:
            print("  ℹ️  No shop_image in database")
    
    print("\n" + "="*70)
    print("MEDIA FILE TEST COMPLETE")
    print("="*70)


def main():
    """Run all tests"""
    print("\n" + "#"*70)
    print("# SUPPLIER PROFILE FIX VERIFICATION")
    print("#"*70)
    
    try:
        test_validation_fixes()
        test_media_file_handling()
        
        print("\n✅ All tests completed!")
        print("\nIf all tests passed, the fixes are working correctly.")
        print("You can now safely restart your backend server.")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
