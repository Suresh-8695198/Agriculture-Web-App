from django.contrib.auth import get_user_model
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agriconnect.settings')

import django
django.setup()

User = get_user_model()
users = User.objects.all()
print("ID | Username | Email")
print("-" * 30)
for u in users:
    print(f"{u.id} | {u.username} | {u.email}")
