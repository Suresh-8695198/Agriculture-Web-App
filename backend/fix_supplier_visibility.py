#!/usr/bin/env python
"""
Fix script to make "Hari's Business" and all real suppliers visible
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

def fix_supplier_visibility():
    """Fix all suppliers to make them visible in Find Supplier"""
    
    print("=" * 80)
    print("FIX SUPPLIER VISIBILITY")
    print("=" * 80)
    print()
    
    # Get all supplier profiles
    all_suppliers = SupplierProfile.objects.all()
    
    print(f"📊 Total suppliers in database: {all_suppliers.count()}\n")
    
    fixed_count = 0
    already_visible = 0
    
    for supplier in all_suppliers:
        business_name = supplier.business_name or supplier.shop_name or 'Unnamed'
        needs_fix = False
        changes = []
        
        # Check and fix is_active
        if not supplier.is_active:
            supplier.is_active = True
            changes.append("is_active → True")
            needs_fix = True
        
        # Check and fix verification_status
        if supplier.verification_status != 'verified':
            old_status = supplier.verification_status or 'None'
            supplier.verification_status = 'verified'
            changes.append(f"verification_status: '{old_status}' → 'verified'")
            needs_fix = True
        
        # Optional: Set default location if missing (Bangalore coordinates)
        if not supplier.latitude or not supplier.longitude:
            if supplier.user and hasattr(supplier.user, 'latitude') and supplier.user.latitude:
                # Use user's location
                supplier.latitude = supplier.user.latitude
                supplier.longitude = supplier.user.longitude
                changes.append("location → copied from user")
                needs_fix = True
            else:
                # Set default Bangalore location
                supplier.latitude = 13.0827
                supplier.longitude = 77.5877
                changes.append("location → set default (Bangalore)")
                needs_fix = True
        
        # Save if changes were made
        if needs_fix:
            supplier.save()
            fixed_count += 1
            print(f"✅ FIXED: {business_name}")
            for change in changes:
                print(f"   • {change}")
            print()
        else:
            already_visible += 1
    
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"\n✅ Fixed: {fixed_count} suppliers")
    print(f"ℹ️  Already visible: {already_visible} suppliers")
    print(f"📊 Total visible now: {fixed_count + already_visible} suppliers")
    
    print("\n" + "=" * 80)
    print("ALL SUPPLIERS NOW VISIBLE:")
    print("=" * 80)
    
    visible_suppliers = SupplierProfile.objects.filter(
        is_active=True,
        verification_status='verified'
    ).select_related('user')
    
    for idx, supplier in enumerate(visible_suppliers, 1):
        business_name = supplier.business_name or supplier.shop_name or 'Unnamed'
        owner = supplier.owner_name or 'Unknown'
        location = f"({supplier.latitude}, {supplier.longitude})" if supplier.latitude else "No location"
        print(f"{idx}. {business_name} - {owner} - {location}")
    
    print("\n✨ All suppliers are now visible in the Find Supplier page!\n")

if __name__ == '__main__':
    print("\nThis script will make all suppliers visible by setting:")
    print("  • is_active = True")
    print("  • verification_status = 'verified'")
    print("  • Default location if missing\n")
    
    confirm = input("Proceed? (yes/no): ")
    
    if confirm.lower() == 'yes':
        fix_supplier_visibility()
    else:
        print("\n❌ Operation cancelled.")
