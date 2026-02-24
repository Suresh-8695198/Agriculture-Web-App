from django.contrib.auth import get_user_model
import os
import sys
from django.db.models import Count

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')

import django
django.setup()

User = get_user_model()

# Find duplicates
duplicate_emails = User.objects.values('email').annotate(email_count=Count('email')).filter(email_count__gt=1)

if not duplicate_emails:
    print("No duplicate emails found.")
else:
    print(f"Found {len(duplicate_emails)} emails with duplicates.")
    for entry in duplicate_emails:
        email = entry['email']
        users = User.objects.filter(email=email).order_by('id')
        print(f"Email: {email}")
        for u in users:
            print(f"  - ID: {u.id}, Username: {u.username}, Created: {u.date_joined}")
        
        # Optionally delete duplicates (keep the first one)
        # to_keep = users[0]
        # to_delete = users[1:]
        # for u in to_delete:
        #     print(f"    WOULD DELETE: {u.username}")
        #     # u.delete()
