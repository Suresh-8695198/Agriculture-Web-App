
from django.urls import get_resolver
from django.conf import settings
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

def print_urls(urlpatterns, prefix=""):
    for entry in urlpatterns:
        if hasattr(entry, 'url_patterns'):
            print_urls(entry.url_patterns, prefix + str(entry.pattern))
        else:
            print(prefix + str(entry.pattern))

print_urls(get_resolver().url_patterns)
