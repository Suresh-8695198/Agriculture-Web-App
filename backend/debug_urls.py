
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')
django.setup()

from django.urls import get_resolver

print("Scanning URLs...")
def list_urls(lis, acc=None):
    if acc is None:
        acc = []
    if not lis:
        return
    for l in lis:
        if hasattr(l, 'url_patterns'):
            list_urls(l.url_patterns, acc + [str(l.pattern)])
        else:
            print(''.join(acc) + str(l.pattern))

list_urls(get_resolver().url_patterns)
