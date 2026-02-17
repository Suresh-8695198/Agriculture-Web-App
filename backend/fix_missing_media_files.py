"""
Fix missing media file references in the database
This script clears references to files that don't exist
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

from suppliers.models import SupplierProfile
from django.core.files.storage import default_storage


def fix_missing_media_files():
    """Check and fix missing media file references"""
    print("="*70)
    print("FIXING MISSING MEDIA FILE REFERENCES")
    print("="*70)
    
    profiles = SupplierProfile.objects.all()
    total_fixed = 0
    
    for profile in profiles:
        print(f"\nChecking: {profile.business_name} ({profile.user.email})")
        profile_fixed = False
        
        # Check each file field
        file_fields = {
            'shop_image': profile.shop_image,
            'id_proof': profile.id_proof,
            'business_license_doc': profile.business_license_doc,
            'gst_certificate': profile.gst_certificate,
            'equipment_registration': profile.equipment_registration,
        }
        
        for field_name, file_field in file_fields.items():
            if file_field:
                file_path = file_field.name
                if not default_storage.exists(file_path):
                    print(f"  ❌ Missing: {field_name} -> {file_path}")
                    print(f"     Clearing reference...")
                    setattr(profile, field_name, None)
                    profile_fixed = True
                else:
                    print(f"  ✅ OK: {field_name}")
        
        if profile_fixed:
            profile.save()
            total_fixed += 1
            print(f"  💾 Profile updated")
    
    print("\n" + "="*70)
    print(f"✅ Fixed {total_fixed} profile(s)")
    print("="*70)


def list_all_media_files():
    """List all media files referenced in the database"""
    print("\n" + "="*70)
    print("MEDIA FILES IN DATABASE")
    print("="*70)
    
    profiles = SupplierProfile.objects.all()
    
    for profile in profiles:
        print(f"\n{profile.business_name}:")
        
        if profile.shop_image:
            exists = "✅" if default_storage.exists(profile.shop_image.name) else "❌"
            print(f"  {exists} shop_image: {profile.shop_image.name}")
        
        if profile.id_proof:
            exists = "✅" if default_storage.exists(profile.id_proof.name) else "❌"
            print(f"  {exists} id_proof: {profile.id_proof.name}")
        
        if profile.business_license_doc:
            exists = "✅" if default_storage.exists(profile.business_license_doc.name) else "❌"
            print(f"  {exists} business_license: {profile.business_license_doc.name}")
        
        if profile.gst_certificate:
            exists = "✅" if default_storage.exists(profile.gst_certificate.name) else "❌"
            print(f"  {exists} gst_certificate: {profile.gst_certificate.name}")
        
        if profile.equipment_registration:
            exists = "✅" if default_storage.exists(profile.equipment_registration.name) else "❌"
            print(f"  {exists} equipment_registration: {profile.equipment_registration.name}")


if __name__ == '__main__':
    print("\n" + "#"*70)
    print("# MEDIA FILE FIX UTILITY")
    print("#"*70 + "\n")
    
    try:
        # List current state
        list_all_media_files()
        
        # Ask before fixing
        print("\n" + "="*70)
        print("This will clear database references to missing media files.")
        print("The actual missing files will not be created.")
        print("="*70)
        response = input("\nProceed with fix? (yes/no): ").strip().lower()
        
        if response in ['yes', 'y']:
            fix_missing_media_files()
        else:
            print("\n❌ Operation cancelled")
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
