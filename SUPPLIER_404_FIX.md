# Supplier Portal 404 Error Fix

## Problem
When accessing the supplier portal, you're getting 404 errors for:
- `/api/suppliers/profiles/my_profile/`
- `/api/suppliers/profiles/dashboard_stats/`
- `/api/suppliers/products/my_products/`

## Root Causes

### 1. Missing Supplier Profile
The most common cause is that your supplier user account doesn't have a `SupplierProfile` record in the database. The backend endpoints expect this profile to exist.

### 2. URL Routing Issues
Some Django/DRF configurations don't auto-generate custom action URLs properly, requiring explicit URL pattern definitions.

## Solutions Implemented

### 1. Updated URL Configuration
**File:** `backend/suppliers/urls.py`

Added explicit URL patterns for all custom endpoints to ensure they're properly registered:
- Profile endpoints: `my_profile`, `dashboard_stats`, `update_profile`
- Product endpoints: `my_products`, `inventory_stats`, `search_nearby`
- Equipment endpoints: `my_equipment`, `search_nearby`
- Order endpoints: `my_orders`
- Rental endpoints: `my_rentals`

### 2. Auto-Create Supplier Profiles
**File:** `backend/suppliers/signals.py`

Created a Django signal that automatically creates a `SupplierProfile` when a new supplier user is registered.

### 3. Management Command
**File:** `backend/suppliers/management/commands/create_supplier_profile.py`

Created a command to manually create profiles for existing supplier users.

### 4. Diagnostic Tool
**File:** `backend/fix_supplier_404.py`

Created a comprehensive diagnostic and fix script.

## How to Fix Your System

### Option 1: Automated Fix (Recommended)
Run the diagnostic script from the backend directory:

```powershell
cd backend
python fix_supplier_404.py
```

This script will:
- Check if URLs are properly registered
- Find all supplier users
- Create missing supplier profiles automatically
- Test if profiles are accessible
- Provide a status report

### Option 2: Manual Fix
If you prefer to fix manually:

1. **Check your user type:**
   ```powershell
   cd backend
   python manage.py shell
   ```
   ```python
   from accounts.models import User
   user = User.objects.get(email='your@email.com')
   print(f"User type: {user.user_type}")
   ```

2. **Create supplier profile using management command:**
   ```powershell
   # For a specific user
   python manage.py create_supplier_profile --email your@email.com
   
   # For all supplier users
   python manage.py create_supplier_profile --all
   ```

3. **Restart the Django server:**
   ```powershell
   # Stop the server (Ctrl+C)
   # Then start it again
   python manage.py runserver
   ```

### Option 3: Create Profile via Shell
```powershell
cd backend
python manage.py shell
```

```python
from accounts.models import User
from suppliers.models import SupplierProfile

# Replace with your email
user = User.objects.get(email='your@email.com')

# Create profile
profile = SupplierProfile.objects.create(
    user=user,
    business_name=f"{user.username}'s Business",
    owner_name=user.username,
    description="My supplier business"
)

print(f"Profile created: {profile}")
```

## Verification Steps

After applying the fix:

1. **Restart Backend Server:**
   ```powershell
   # In backend directory
   python manage.py runserver
   ```

2. **Clear Browser Cache:**
   - Press `Ctrl + Shift + Delete`
   - Select "Cached images and files"
   - Click "Clear data"
   
   Or use **Incognito/Private mode**

3. **Test the endpoints:**
   - Login as a supplier user
   - Navigate to supplier dashboard
   - Check browser console (F12) for errors

4. **Manual API test (optional):**
   ```powershell
   # Replace YOUR_TOKEN with your actual JWT token
   curl -H "Authorization: Bearer YOUR_TOKEN" http://127.0.0.1:8000/api/suppliers/profiles/my_profile/
   ```

## Why It Worked on Your Friend's System

Your friend's system likely had:
1. Supplier profiles already created in the database
2. An older version with different URL routing that worked by accident
3. Different Django/DRF versions with better auto-routing

## Preventing Future Issues

Moving forward:
1. **The signal is now active** - New supplier users will automatically get profiles
2. **URLs are explicit** - No dependency on auto-generated URLs
3. **Run migrations** - Always run `python manage.py migrate` after pulling code:
   ```powershell
   cd backend
   python manage.py migrate
   ```

## Troubleshooting

### Still getting 404 errors?

1. **Check Django is loading the signals:**
   ```powershell
   cd backend
   python manage.py shell
   ```
   ```python
   from django.apps import apps
   config = apps.get_app_config('suppliers')
   print(config.name)  # Should print 'suppliers'
   ```

2. **Verify URL patterns:**
   ```powershell
   cd backend
   python test_urls.py
   ```

3. **Check database:**
   ```powershell
   python manage.py shell
   ```
   ```python
   from suppliers.models import SupplierProfile
   profiles = SupplierProfile.objects.all()
   for p in profiles:
       print(f"{p.user.email}: {p.business_name}")
   ```

4. **View Django logs:**
   Look at the terminal where `manage.py runserver` is running for detailed error messages.

### Database Issues?

If you suspect database corruption:
```powershell
cd backend
# Backup first!
python manage.py dumpdata > backup.json

# Reset migrations (careful!)
python manage.py migrate suppliers zero
python manage.py migrate suppliers
```

## Backend Server Restart

After applying fixes, **always restart** the Django server:

1. Stop: `Ctrl + C` in the terminal running the server
2. Start: `python manage.py runserver`

Or use the batch file:
```powershell
# From project root
.\start_servers.bat
```

## Support

If issues persist:
1. Check `backend/fix_supplier_404.py` output
2. Look at Django server console for detailed errors
3. Check browser console (F12 → Console tab)
4. Verify you're logged in as a **supplier** user (not farmer/consumer)

## Files Modified

- ✅ `backend/suppliers/urls.py` - Added explicit URL patterns
- ✅ `backend/suppliers/signals.py` - Auto-create profiles
- ✅ `backend/suppliers/apps.py` - Register signals
- ✅ `backend/suppliers/management/commands/create_supplier_profile.py` - Manual profile creation
- ✅ `backend/fix_supplier_404.py` - Diagnostic tool
- ✅ `SUPPLIER_404_FIX.md` - This documentation

## Quick Fix Command Summary

```powershell
# Navigate to backend
cd backend

# Run the auto-fix script
python fix_supplier_404.py

# Restart server
# Press Ctrl+C to stop current server
python manage.py runserver

# In frontend terminal (if needed)
cd frontend
npm run dev
```

**Now your supplier portal should work! 🎉**
