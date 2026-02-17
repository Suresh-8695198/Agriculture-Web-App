from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from farmers.models import FarmerProfile

User = get_user_model()


class Command(BaseCommand):
    help = 'Create FarmerProfile for all users with role=farmer who do not have one'

    def handle(self, *args, **kwargs):
        farmers = User.objects.filter(role='farmer')
        created_count = 0
        
        for user in farmers:
            if not hasattr(user, 'farmer_profile'):
                FarmerProfile.objects.create(
                    user=user,
                    farm_name=f"{user.username}'s Farm",
                    farm_size=0,
                    crops_grown=''
                )
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created FarmerProfile for {user.username}')
                )
        
        if created_count == 0:
            self.stdout.write(
                self.style.WARNING('No new FarmerProfiles needed to be created')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created {created_count} FarmerProfile(s)')
            )
