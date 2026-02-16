from rest_framework import viewsets, permissions
from .models import Transaction, PayoutRequest
from .serializers import TransactionSerializer, PayoutRequestSerializer

class IsSupplier(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'supplier_profile')

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

class PayoutRequestViewSet(viewsets.ModelViewSet):
    serializer_class = PayoutRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsSupplier]

    def get_queryset(self):
        if hasattr(self.request.user, 'supplier_profile'):
            return PayoutRequest.objects.filter(supplier=self.request.user.supplier_profile)
        return PayoutRequest.objects.none()

    def perform_create(self, serializer):
        serializer.save(supplier=self.request.user.supplier_profile)
