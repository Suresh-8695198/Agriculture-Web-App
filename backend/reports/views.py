from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.files.base import ContentFile
from django.utils import timezone
import csv
import json
from .models import GeneratedReport
from .serializers import GeneratedReportSerializer
from suppliers.models import Order, Product, StockLog

class GeneratedReportViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return GeneratedReport.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Allow creating via POST if needed, but 'generate' action is main way
        # This just saves metadata without file generation logic unless handled elsewhere
        serializer.save(user=self.request.user)
        
    @action(detail=False, methods=['post'])
    def generate(self, request):
        report_type = request.data.get('report_type')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        
        if not report_type:
            return Response({'error': 'report_type is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare CSV content
        csv_buffer = []
        filename = f"{report_type}_{timezone.now().strftime('%Y%m%d%H%M%S')}.csv"
        
        # Fetch data based on type (Basic Implementation)
        try:
            if report_type == 'sales':
                # Fetch supplier orders
                if hasattr(request.user, 'supplier_profile'):
                    orders = Order.objects.filter(supplier=request.user.supplier_profile)
                    # Filter by date if provided (omitted for brevity)
                    
                    csv_buffer.append(['Order ID', 'Date', 'Product', 'Amount', 'Status'])
                    for order in orders:
                        csv_buffer.append([
                            order.order_number, 
                            order.created_at.strftime('%Y-%m-%d'),
                            order.product.name,
                            str(order.total_amount),
                            order.status
                        ])
                else:
                    return Response({'error': 'User is not a supplier'}, status=status.HTTP_403_FORBIDDEN)
                    
            elif report_type == 'inventory':
                if hasattr(request.user, 'supplier_profile'):
                    products = Product.objects.filter(supplier=request.user.supplier_profile)
                    csv_buffer.append(['Product Name', 'Category', 'Stock Logic', 'Price'])
                    for p in products:
                        csv_buffer.append([
                            p.name,
                            p.category,
                            str(p.stock_quantity),
                            str(p.price)
                        ])
            
            # Create CSV string
            import io
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerows(csv_buffer)
            csv_content = output.getvalue()
            
            # Create Report Entry
            report = GeneratedReport.objects.create(
                user=request.user,
                report_type=report_type,
                parameters=json.dumps(request.data),
                status='completed'
            )
            report.file.save(filename, ContentFile(csv_content))
            report.save()
            
            serializer = self.get_serializer(report)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
