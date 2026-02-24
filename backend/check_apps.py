
import os
import django
import sys

# Ensure current directory is in sys.path
sys.path.append(os.getcwd())

os.environ['DJANGO_SETTINGS_MODULE'] = 'agriconnect.settings'

try:
    django.setup()
    print("Django setup successful")
    
    from django.apps import apps
    for app in apps.get_app_configs():
        print(f"App: {app.name} - OK")
        
except Exception as e:
    print(f"\n✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
