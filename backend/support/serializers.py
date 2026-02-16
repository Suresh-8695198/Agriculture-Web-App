from rest_framework import serializers
from .models import SupportTicket, FAQ

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = '__all__'
        read_only_fields = ['ticket_id', 'user', 'admin_response', 'created_at', 'updated_at']

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'
        read_only_fields = ['created_at']
