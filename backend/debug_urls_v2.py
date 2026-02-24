
import os
import django
from django.conf import settings
from django.urls import get_resolver, URLPattern, URLResolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

def show_urls(patterns, prefix=''):
    for pattern in patterns:
        if isinstance(pattern, URLPattern):
            print(f"{prefix}{pattern.pattern}")
        elif isinstance(pattern, URLResolver):
            show_urls(pattern.url_patterns, prefix + str(pattern.pattern))

print("Scanning URLs for farmers/produce...")
resolver = get_resolver()
show_urls(resolver.url_patterns)
