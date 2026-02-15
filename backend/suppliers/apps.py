from django.apps import AppConfig


class SuppliersConfig(AppConfig):
    name = 'suppliers'
    default_auto_field = 'django.db.models.BigAutoField'
    
    def ready(self):
        # Temporarily disabled auto-profile creation to prevent duplicate errors
        # Profiles will be created manually on first login
        pass
        # import suppliers.signals
