from rest_framework import serializers
from .models import Transaction, PayoutRequest

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

class PayoutRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutRequest
        fields = '__all__'
        read_only_fields = ['supplier', 'created_at', 'status', 'processed_at']
