
import os
import django
from django.conf import settings
from django.urls import get_resolver, URLResolver, URLPattern

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

def list_urls(lis, acc=None):
    if acc is None:
        acc = []
    if not lis:
        return
    for l in lis:
        if isinstance(l, URLPattern):
            full_url = ''.join(acc) + str(l.pattern)
            if 'my_produce' in full_url or 'my-produce' in full_url:
                print(f"FOUND MATCH: {full_url} -> {l.callback}")
                # print(f"Name: {l.name}")
        elif isinstance(l, URLResolver):
            list_urls(l.url_patterns, acc + [str(l.pattern)])

print("Scanning for my_produce URLs...")
list_urls(get_resolver().url_patterns)
