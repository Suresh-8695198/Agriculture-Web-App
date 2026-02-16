from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import SupportTicket, FAQ
from .serializers import SupportTicketSerializer, FAQSerializer

class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SupportTicket.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FAQ.objects.filter(is_active=True)
    serializer_class = FAQSerializer
    permission_classes = [permissions.AllowAny]
