
import os
import django
from django.conf import settings
from django.urls import get_resolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

resolver = get_resolver()

def find_urls(urlpatterns, prefix=''):
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            find_urls(pattern.url_patterns, prefix + str(pattern.pattern))
        else:
            full_url = prefix + str(pattern.pattern)
            if 'farmers' in full_url:
                print(full_url)

print("Searching for Farmer URLs:")
find_urls(resolver.url_patterns)
