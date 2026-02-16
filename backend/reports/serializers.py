from rest_framework import serializers
from .models import GeneratedReport

class GeneratedReportSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = GeneratedReport
        fields = '__all__'
        read_only_fields = ['id', 'user', 'file', 'created_at']
