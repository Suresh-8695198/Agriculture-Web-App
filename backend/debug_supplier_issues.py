"""
Debug script for supplier profile issues
Helps identify validation errors and missing media files
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
from django.core.files.storage import default_storage
from pathlib import Path

def check_missing_media_files():
    """Check for missing media files referenced in supplier profiles"""
    print("\n" + "="*70)
    print("CHECKING FOR MISSING MEDIA FILES")
    print("="*70)
    
    profiles = SupplierProfile.objects.all()
    missing_files = []
    
    for profile in profiles:
        # Check each file field
        file_fields = [
            ('shop_image', profile.shop_image),
            ('id_proof', profile.id_proof),
            ('business_license_doc', profile.business_license_doc),
            ('gst_certificate', profile.gst_certificate),
            ('equipment_registration', profile.equipment_registration),
        ]
        
        for field_name, file_field in file_fields:
            if file_field:
                file_path = file_field.name
                if not default_storage.exists(file_path):
                    missing_files.append({
                        'profile': profile.business_name,
                        'user': profile.user.email,
                        'field': field_name,
                        'path': file_path
                    })
                    print(f"❌ Missing: {file_path}")
                    print(f"   Profile: {profile.business_name} ({profile.user.email})")
                    print(f"   Field: {field_name}")
    
    if not missing_files:
        print("✅ All media files exist!")
    else:
        print(f"\n⚠️  Found {len(missing_files)} missing media files")
        
        # Ask if user wants to clear these references
        print("\nOptions to fix:")
        print("1. Clear references to missing files (set fields to None)")
        print("2. Keep references (manual upload needed)")
        
        choice = input("\nEnter choice (1 or 2): ").strip()
        
        if choice == '1':
            for item in missing_files:
                profile = SupplierProfile.objects.get(
                    business_name=item['profile'],
                    user__email=item['user']
                )
                setattr(profile, item['field'], None)
                profile.save()
            print(f"✅ Cleared {len(missing_files)} missing file references")
    
    return missing_files


def test_profile_validation():
    """Test validation for all supplier profiles"""
    print("\n" + "="*70)
    print("TESTING PROFILE UPDATE VALIDATION")
    print("="*70)
    
    profiles = SupplierProfile.objects.all()
    
    if not profiles:
        print("⚠️  No supplier profiles found")
        return
    
    for profile in profiles:
        print(f"\n📋 Testing: {profile.business_name} ({profile.user.email})")
        
        # Test with empty data (partial update)
        serializer = SupplierProfileUpdateSerializer(
            profile, 
            data={}, 
            partial=True
        )
        
        if serializer.is_valid():
            print("   ✅ Empty update: VALID")
        else:
            print("   ❌ Empty update: INVALID")
            print(f"   Errors: {serializer.errors}")
        
        # Test with current profile data
        current_data = {
            'shop_name': profile.shop_name,
            'owner_name': profile.owner_name,
            'business_name': profile.business_name,
            'description': profile.description,
        }
        
        serializer = SupplierProfileUpdateSerializer(
            profile,
            data=current_data,
            partial=True
        )
        
        if serializer.is_valid():
            print("   ✅ Current data update: VALID")
        else:
            print("   ❌ Current data update: INVALID")
            print(f"   Errors: {serializer.errors}")


def list_all_profiles():
    """List all supplier profiles with their details"""
    print("\n" + "="*70)
    print("ALL SUPPLIER PROFILES")
    print("="*70)
    
    profiles = SupplierProfile.objects.all()
    
    if not profiles:
        print("⚠️  No supplier profiles found")
        return
    
    for profile in profiles:
        print(f"\n📊 Profile ID: {profile.id}")
        print(f"   Business: {profile.business_name}")
        print(f"   Owner: {profile.owner_name}")
        print(f"   User: {profile.user.email} (Type: {profile.user.user_type})")
        print(f"   Status: {profile.verification_status}")
        print(f"   Active: {profile.is_active}")
        print(f"   Rating: {profile.rating}/5.0")
        
        # Check for file attachments
        files = []
        if profile.shop_image:
            files.append(f"shop_image: {profile.shop_image.name}")
        if profile.id_proof:
            files.append(f"id_proof: {profile.id_proof.name}")
        if profile.business_license_doc:
            files.append(f"business_license: {profile.business_license_doc.name}")
        
        if files:
            print(f"   Files: {', '.join(files)}")


def check_common_validation_issues():
    """Check for common validation issues"""
    print("\n" + "="*70)
    print("CHECKING COMMON VALIDATION ISSUES")
    print("="*70)
    
    profiles = SupplierProfile.objects.all()
    issues_found = False
    
    for profile in profiles:
        issues = []
        
        # Check for invalid latitude/longitude
        if profile.latitude and (profile.latitude < -90 or profile.latitude > 90):
            issues.append(f"Invalid latitude: {profile.latitude}")
        
        if profile.longitude and (profile.longitude < -180 or profile.longitude > 180):
            issues.append(f"Invalid longitude: {profile.longitude}")
        
        # Check for negative values
        if profile.years_of_experience < 0:
            issues.append(f"Negative experience: {profile.years_of_experience}")
        
        if profile.delivery_radius_km < 0:
            issues.append(f"Negative delivery radius: {profile.delivery_radius_km}")
        
        if profile.min_order_value < 0:
            issues.append(f"Negative min order value: {profile.min_order_value}")
        
        if profile.delivery_charges < 0:
            issues.append(f"Negative delivery charges: {profile.delivery_charges}")
        
        # Check PIN code format
        if profile.pin_code and len(profile.pin_code) > 6:
            issues.append(f"PIN code too long: {profile.pin_code}")
        
        if issues:
            issues_found = True
            print(f"\n⚠️  Profile: {profile.business_name} ({profile.user.email})")
            for issue in issues:
                print(f"   • {issue}")
    
    if not issues_found:
        print("✅ No common validation issues found")


def main():
    """Main diagnostic function"""
    print("🔍 SUPPLIER PROFILE DIAGNOSTIC TOOL")
    print("="*70)
    
    try:
        # List all profiles
        list_all_profiles()
        
        # Check for missing media files
        check_missing_media_files()
        
        # Check common validation issues
        check_common_validation_issues()
        
        # Test validation
        test_profile_validation()
        
        print("\n" + "="*70)
        print("✅ DIAGNOSTIC COMPLETE")
        print("="*70)
        
    except Exception as e:
        print(f"\n❌ Error during diagnostic: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
