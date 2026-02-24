
import os
import django
import sys

# Ensure current directory is in sys.path
sys.path.append(os.getcwd())

os.environ['DJANGO_SETTINGS_MODULE'] = 'agriconnect.settings'
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS.append('testserver')

from rest_framework.test import APIRequestFactory, force_authenticate
from accounts.views import UserProfileView
from django.contrib.auth import get_user_model

User = get_user_model()
factory = APIRequestFactory()

# Find any user
user = User.objects.first()

view = UserProfileView.as_view()
request = factory.get('/api/accounts/profile/')
force_authenticate(request, user=user)

try:
    response = view(request)
    print(f"Status: {response.status_code}")
    print(f"Data: {response.data}")
except Exception as e:
    print(f"\n✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
