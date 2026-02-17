# Supplier Profile Error Fix Guide

## Issues Identified

### 1. Missing Media File (404 Error)
**Error:** `Not Found: /media/supplier_documents/shop_images/image5.jpg`

**Cause:** The database has a reference to `image5.jpg` but the file doesn't exist in the media folder.

**Impact:** This causes 404 errors but doesn't break functionality. The image just won't display.

### 2. Profile Update Validation Error (400 Bad Request)
**Error:** `Bad Request: /api/suppliers/profiles/me/` when trying to PATCH/update profile

**Cause:** Multiple possible causes:
- Empty strings being sent for numeric fields (e.g., `years_of_experience: ""`)
- File field URLs being sent as strings instead of actual files
- Read-only fields being included in the update request
- Invalid data format in some fields

## Fixes Implemented

### 1. Enhanced Serializer Validation
**File:** `backend/suppliers/serializers.py`

Added custom `validate()` method to `SupplierProfileUpdateSerializer` that:
- Converts empty strings to `0` for numeric fields
- Converts empty strings to `None` for decimal fields (latitude/longitude)
- Validates PIN code length (max 6 characters)
- Removes file fields if they're sent as strings (URLs) instead of actual files
- Handles business_types_list conversion properly

### 2. Better Error Responses
**File:** `backend/suppliers/views.py`

Modified `update_profile()` method to:
- Return detailed validation errors instead of generic 400 error
- Log validation errors to console for debugging
- Provide helpful error messages to frontend

### 3. Safe Media File Handling
**File:** `backend/suppliers/serializers.py`

Added `get_shop_image_url()` method to `SupplierProfileSerializer` that:
- Checks if the file exists before returning URL
- Returns `None` if file is missing (prevents 404 errors in API response)
- Handles exceptions gracefully

## How to Fix Your System

### Option 1: Run the Media File Fix Script (Recommended)

This will clean up all database references to missing files:

```powershell
cd backend
python fix_missing_media_files.py
```

The script will:
1. List all media files referenced in the database
2. Check which ones are missing
3. Ask for confirmation
4. Clear the database references to missing files

After running this, the 404 errors will stop appearing.

### Option 2: Manual Database Cleanup

If you prefer to do it manually:

```powershell
cd backend
python manage.py shell
```

```python
from suppliers.models import SupplierProfile
from django.core.files.storage import default_storage

# Find profiles with missing shop images
for profile in SupplierProfile.objects.all():
    if profile.shop_image:
        if not default_storage.exists(profile.shop_image.name):
            print(f"Clearing missing image for {profile.business_name}")
            profile.shop_image = None
            profile.save()
```

### Option 3: Upload the Missing File

If you have the actual `image5.jpg` file, upload it to:
```
backend/media/supplier_documents/shop_images/image5.jpg
```

## Testing the Fix

### 1. Test Profile Updates

After applying the fixes, test updating the supplier profile:

**Frontend:**
- Go to Supplier Profile page
- Edit any section (Basic Info, Address, etc.)
- Click Save
- Should now save successfully with detailed error messages if anything fails

**API Test:**
```bash
# Using curl or Postman
PATCH http://localhost:8000/api/suppliers/profiles/me/
Content-Type: application/json
Authorization: Bearer <your_token>

{
  "shop_name": "Test Shop",
  "years_of_experience": 5,
  "description": "Updated description"
}
```

### 2. Check Server Logs

Start the backend server and watch for:
```
[17/Feb/2026 15:06:29] "GET /api/suppliers/profiles/me/" 200 2178  ✅
```

No more 404 errors for missing images.
No more 400 errors on PATCH requests (unless there's actual invalid data).

### 3. Common Validation Errors You Might See

With the improved error handling, you'll now see specific messages:

```json
{
  "error": "Validation failed",
  "details": {
    "pin_code": ["PIN code must be 6 characters or less"],
    "years_of_experience": ["A valid integer is required"],
    "latitude": ["A valid number is required"]
  }
}
```

## Prevention

To prevent these issues in the future:

### 1. Frontend Form Validation

Ensure the frontend validates data before sending:
- Numeric fields should send numbers, not empty strings
- File uploads should only include actual files
- Don't send read-only fields in update requests

### 2. Backend Validation

The enhanced serializer now handles:
- ✅ Empty string to appropriate default conversion
- ✅ File field validation
- ✅ Data type validation
- ✅ Safe media file handling

### 3. Media File Management

When deleting/modifying supplier profiles:
- Always clean up associated media files
- Or use signals to auto-delete files when profile is deleted
- Regularly audit for orphaned files

## Additional Scripts

### Check All Supplier Profiles

```powershell
cd backend
python debug_supplier_issues.py
```

This comprehensive diagnostic script:
- Lists all supplier profiles
- Checks for missing media files
- Tests validation on all profiles
- Identifies common issues

### Create Missing Profiles

If you have supplier users without profiles:

```powershell
cd backend
python fix_supplier_404.py
```

## Summary of Changes

| File | Change | Purpose |
|------|--------|---------|
| `suppliers/serializers.py` | Added `validate()` method | Handle edge cases in data validation |
| `suppliers/serializers.py` | Added `shop_image_url` field | Safe image URL generation |
| `suppliers/views.py` | Enhanced `update_profile()` | Better error messages |
| `fix_missing_media_files.py` | New script | Clean up missing file references |
| `debug_supplier_issues.py` | New script | Comprehensive diagnostics |

## Need More Help?

If you're still experiencing issues:

1. Check the detailed error messages in the API response
2. Look at the server console logs (validation errors are printed there)
3. Run the diagnostic script to check your data
4. Ensure your frontend is sending the correct data format

The fixes ensure:
- ✅ Better error messages for debugging
- ✅ Graceful handling of missing files
- ✅ Robust validation that handles edge cases
- ✅ No more cryptic 400 errors
