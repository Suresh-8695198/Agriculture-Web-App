
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

user = User.objects.filter(user_type='farmer').first()
if not user:
    user = User.objects.create_user(username='test_farmer', password='password', user_type='farmer', phone_number='1234567891')

view = FarmProduceViewSet.as_view({'get': 'my_produce'})
request = factory.get('/api/farmers/my-listings/')
force_authenticate(request, user=user)

response = view(request)
print(f"Status: {response.status_code}")
if response.status_code >= 500:
    print(f"Content: {response.content.decode()[:1000]}")
else:
    print(f"Data: {response.data}")
