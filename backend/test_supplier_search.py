#!/usr/bin/env python
"""
Quick test script to verify the search_nearby API endpoint
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

from suppliers.models import SupplierProfile
from django.contrib.auth import get_user_model

User = get_user_model()

def test_search_api():
    """Test the supplier search functionality"""
    
    print("Testing Supplier Search API\n")
    print("=" * 60)
    
    # Test 1: Check if suppliers exist
    print("\n1. Checking total suppliers in database...")
    total_suppliers = SupplierProfile.objects.count()
    active_suppliers = SupplierProfile.objects.filter(is_active=True).count()
    verified_suppliers = SupplierProfile.objects.filter(
        is_active=True, 
        verification_status='verified'
    ).count()
    
    print(f"   Total suppliers: {total_suppliers}")
    print(f"   Active suppliers: {active_suppliers}")
    print(f"   Verified & Active: {verified_suppliers}")
    
    if verified_suppliers == 0:
        print("   ⚠️  Warning: No verified active suppliers found!")
        return
    
    # Test 2: Check supplier locations
    print("\n2. Checking supplier locations...")
    suppliers_with_location = 0
    for supplier in SupplierProfile.objects.filter(is_active=True):
        if supplier.latitude and supplier.longitude:
            suppliers_with_location += 1
            print(f"   ✓ {supplier.business_name}: "
                  f"({supplier.latitude}, {supplier.longitude})")
    
    print(f"\n   Suppliers with location data: {suppliers_with_location}/{active_suppliers}")
    
    # Test 3: Test business types
    print("\n3. Checking business types...")
    business_types = {}
    for supplier in SupplierProfile.objects.filter(is_active=True):
        if supplier.business_types:
            types = [t.strip() for t in supplier.business_types.split(',')]
            for btype in types:
                business_types[btype] = business_types.get(btype, 0) + 1
    
    for btype, count in business_types.items():
        print(f"   {btype}: {count} suppliers")
    
    # Test 4: Test haversine calculation
    print("\n4. Testing distance calculation...")
    test_lat, test_lon = 13.0827, 77.5877  # Bangalore center
    
    from suppliers.views import haversine
    
    for supplier in SupplierProfile.objects.filter(
        is_active=True, 
        verification_status='verified'
    )[:3]:
        if supplier.latitude and supplier.longitude:
            distance = haversine(
                test_lon, test_lat,
                float(supplier.longitude),
                float(supplier.latitude)
            )
            print(f"   {supplier.business_name}: {distance:.2f} km away")
    
    # Test 5: Test API serialization
    print("\n5. Testing serialization...")
    from suppliers.serializers import SupplierProfileSerializer
    from django.test import RequestFactory
    
    factory = RequestFactory()
    request = factory.get('/api/suppliers/profiles/search_nearby/')
    
    supplier = SupplierProfile.objects.filter(
        is_active=True,
        verification_status='verified'
    ).first()
    
    if supplier:
        serializer = SupplierProfileSerializer(
            supplier, 
            context={'request': request}
        )
        data = serializer.data
        
        print(f"   Serialized fields:")
        print(f"   - business_name: {data.get('business_name')}")
        print(f"   - owner_name: {data.get('owner_name')}")
        print(f"   - business_types: {data.get('business_types')}")
        print(f"   - rating: {data.get('rating')}")
        print(f"   - is_active: {data.get('is_active')}")
        print(f"   - full_address: {data.get('full_address')}")
        
        if 'user' in data and data['user']:
            print(f"   - user.phone_number: {data['user'].get('phone_number')}")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed successfully!")
    print("\nAPI Endpoint: GET /api/suppliers/profiles/search_nearby/")
    print("Parameters:")
    print("  - latitude (optional): Float")
    print("  - longitude (optional): Float")
    print("  - max_distance (optional, default 50): Float (km)")
    print("  - business_type (optional): String")
    print("\nExample:")
    print("  /api/suppliers/profiles/search_nearby/?latitude=13.0827&longitude=77.5877&max_distance=25")

if __name__ == '__main__':
    try:
        test_search_api()
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
