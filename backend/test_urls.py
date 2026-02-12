#!/usr/bin/env python
"""Test script to print all registered URLs"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

from django.urls import get_resolver

resolver = get_resolver()

def print_urls(urlpatterns, prefix=''):
    for pattern in urlpatterns:
        if hasattr(pattern, 'url_patterns'):
            # It's an included URLconf
            new_prefix = prefix + str(pattern.pattern)
            print_urls(pattern.url_patterns, new_prefix)
        else:
            # It's a regular URL pattern
            print(f"{prefix}{pattern.pattern}")

print("=" * 80)
print("Registered URLs for Suppliers app:")
print("=" * 80)

# Get all URL patterns
for pattern in resolver.url_patterns:
    pattern_str = str(pattern.pattern)
    if 'suppliers' in pattern_str:
        print(f"\nFound suppliers pattern: {pattern_str}")
        if hasattr(pattern, 'url_patterns'):
            print("Sub-patterns:")
            print_urls(pattern.url_patterns, f"  /api/suppliers/")

print("\n" + "=" * 80)
