from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from suppliers.models import SupplierProfile

User = get_user_model()


class Command(BaseCommand):
    help = 'Create supplier profiles for users who don\'t have one'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email of the user to create profile for',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Create profiles for all suppliers without one',
        )

    def handle(self, *args, **options):
        email = options.get('email')
        create_all = options.get('all')

        if email:
            try:
                user = User.objects.get(email=email)
                if user.user_type != 'supplier':
                    self.stdout.write(self.style.ERROR(f'User {email} is not a supplier (type: {user.user_type})'))
                    return
                
                if hasattr(user, 'supplier_profile'):
                    self.stdout.write(self.style.WARNING(f'Supplier profile already exists for {email}'))
                    return
                
                profile = SupplierProfile.objects.create(
                    user=user,
                    business_name=f"{user.username}'s Business",
                    owner_name=user.username,
                    description="Default supplier profile - Please update your business details",
                )
                self.stdout.write(self.style.SUCCESS(f'Successfully created supplier profile for {email}'))
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with email {email} not found'))
        
        elif create_all:
            suppliers = User.objects.filter(user_type='supplier')
            created_count = 0
            
            for user in suppliers:
                if not hasattr(user, 'supplier_profile'):
                    profile = SupplierProfile.objects.create(
                        user=user,
                        business_name=f"{user.username}'s Business",
                        owner_name=user.username,
                        description="Default supplier profile - Please update your business details",
                    )
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f'Created profile for {user.email}'))
            
            self.stdout.write(self.style.SUCCESS(f'\nTotal profiles created: {created_count}'))
        
        else:
            self.stdout.write(self.style.ERROR('Please provide --email or --all flag'))

