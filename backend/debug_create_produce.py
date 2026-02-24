
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
from farmers.views import FarmProduceViewSet
from django.contrib.auth import get_user_model

User = get_user_model()
factory = APIRequestFactory()

# Find a farmer user
user = User.objects.filter(user_type='farmer').first()
if not user:
    user = User.objects.create_user(username='test_farmer', password='password', user_type='farmer', phone_number='1234567890')

view = FarmProduceViewSet.as_view({'post': 'create'})
data = {
    'name': 'Test Crop',
    'category': 'paddy',
    'price_per_unit': 100,
    'quantity': 50,
    'unit': 'kg',
    'is_available': True
}
request = factory.post('/api/farmers/produce/', data)
force_authenticate(request, user=user)

try:
    response = view(request)
    print(f"Status: {response.status_code}")
    print(f"Data: {response.data}")
except Exception as e:
    print(f"\n✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
