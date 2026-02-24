
import traceback
import os

class ErrorLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        with open('error_traceback.log', 'a') as f:
            f.write(f"\n--- Exception at {request.path} ---\n")
            traceback.print_exc(file=f)
        return None
