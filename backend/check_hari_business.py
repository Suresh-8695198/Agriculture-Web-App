#!/usr/bin/env python
"""
Diagnostic script to check why "Hari's Business" is not showing in Find Supplier
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

def check_supplier_visibility():
    """Check what's preventing suppliers from showing"""
    
    print("=" * 80)
    print("SUPPLIER VISIBILITY DIAGNOSTIC")
    print("=" * 80)
    print()
    
    # Get all supplier profiles
    all_suppliers = SupplierProfile.objects.all().select_related('user')
    
    print(f"📊 Total suppliers in database: {all_suppliers.count()}\n")
    
    # Check each supplier
    for supplier in all_suppliers:
        business_name = supplier.business_name or supplier.shop_name or 'Unnamed'
        print("─" * 80)
        print(f"🏪 Business: {business_name}")
        print(f"   Owner: {supplier.owner_name or 'Not set'}")
        print(f"   User: {supplier.user.username if supplier.user else 'No user linked'}")
        print()
        
        # Check all required conditions
        issues = []
        warnings = []
        
        # 1. Check is_active
        if not supplier.is_active:
            issues.append("❌ is_active = False (Supplier is marked as inactive)")
        else:
            print("   ✅ is_active = True")
        
        # 2. Check verification_status
        if supplier.verification_status != 'verified':
            issues.append(f"❌ verification_status = '{supplier.verification_status}' (Must be 'verified')")
        else:
            print("   ✅ verification_status = 'verified'")
        
        # 3. Check location data (needed for distance calculation)
        if not supplier.latitude or not supplier.longitude:
            if supplier.user and hasattr(supplier.user, 'latitude') and hasattr(supplier.user, 'longitude'):
                if supplier.user.latitude and supplier.user.longitude:
                    warnings.append(f"⚠️  Using user location: ({supplier.user.latitude}, {supplier.user.longitude})")
                else:
                    warnings.append("⚠️  No location data (will appear but without distance)")
            else:
                warnings.append("⚠️  No location data (will appear but without distance)")
        else:
            print(f"   ✅ Location: ({supplier.latitude}, {supplier.longitude})")
        
        # 4. Check business information
        if not supplier.business_name and not supplier.shop_name:
            warnings.append("⚠️  No business_name or shop_name")
        
        if not supplier.owner_name:
            warnings.append("⚠️  No owner_name")
        
        if not supplier.business_types:
            warnings.append("⚠️  No business_types set")
        
        # Print issues
        if issues:
            print()
            print("   🚫 BLOCKING ISSUES (Supplier will NOT show):")
            for issue in issues:
                print(f"      {issue}")
        
        if warnings:
            print()
            print("   ⚠️  WARNINGS (Will show but may have issues):")
            for warning in warnings:
                print(f"      {warning}")
        
        # Overall status
        print()
        if not issues:
            print("   ✨ STATUS: This supplier WILL SHOW in Find Supplier")
        else:
            print("   ⛔ STATUS: This supplier WILL NOT SHOW (fix the blocking issues above)")
        
        print()
    
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    # Count visible suppliers
    visible = SupplierProfile.objects.filter(
        is_active=True,
        verification_status='verified'
    )
    
    print(f"\n✅ Suppliers that WILL show: {visible.count()}")
    print(f"❌ Suppliers that WON'T show: {all_suppliers.count() - visible.count()}")
    
    print("\n" + "=" * 80)
    print("SOLUTION FOR 'Hari's Business'")
    print("=" * 80)
    
    hari_business = all_suppliers.filter(business_name__icontains='Hari').first()
    if hari_business:
        print("\n🔧 To make 'Hari's Business' visible, run these Django commands:")
        print()
        print("from suppliers.models import SupplierProfile")
        print(f"supplier = SupplierProfile.objects.get(id={hari_business.id})")
        print("supplier.is_active = True")
        print("supplier.verification_status = 'verified'")
        
        # Suggest setting location if missing
        if not hari_business.latitude or not hari_business.longitude:
            print("# Optional: Set location for distance calculation")
            print("supplier.latitude = 13.0827  # Your location latitude")
            print("supplier.longitude = 77.5877  # Your location longitude")
        
        print("supplier.save()")
        print()
        print("Or run the fix script below...")
    
    print("\n" + "=" * 80)

if __name__ == '__main__':
    check_supplier_visibility()
