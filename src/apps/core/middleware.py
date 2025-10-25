"""Custom middleware for the application."""

import json
import logging
import time
import uuid

from django.http import JsonResponse
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin

from .models import IdempotencyKey

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """Middleware to log request/response information for monitoring.

    Logs:
    - Request method, path, user agent
    - Response status code and duration
    - Request ID for tracing
    - User information if authenticated
    """

    def process_request(self, request):
        """Add request metadata and start timer."""
        request.start_time = time.time()
        request.request_id = str(uuid.uuid4())[:8]

        # Add request ID to response headers for debugging
        request._request_id = request.request_id

        return None

    def process_response(self, request, response):
        """Log request completion with timing and response info."""
        if not hasattr(request, "start_time"):
            return response

        duration = time.time() - request.start_time

        # Skip logging for static files and health checks
        skip_paths = ["/static/", "/media/", "/favicon.ico"]
        if any(request.path.startswith(path) for path in skip_paths):
            return response

        # Prepare log data
        log_data = {
            "request_id": getattr(request, "request_id", "unknown"),
            "method": request.method,
            "path": request.path,
            "status_code": response.status_code,
            "duration_ms": round(duration * 1000, 2),
            "user_agent": request.META.get("HTTP_USER_AGENT", "")[:100],
            "ip_address": self._get_client_ip(request),
            "timestamp": timezone.now().isoformat(),
        }

        # Add user info if authenticated
        if hasattr(request, "user") and request.user.is_authenticated:
            log_data["user_id"] = request.user.id
            log_data["username"] = request.user.username

        # Add query params for GET requests (be careful with sensitive data)
        if request.method == "GET" and request.GET:
            # Only log safe query parameters
            safe_params = {
                k: v
                for k, v in request.GET.items()
                if k not in ["password", "token", "secret", "key"]
            }
            if safe_params:
                log_data["query_params"] = safe_params

        # Log at appropriate level based on status code
        if response.status_code >= 500:
            logger.error(f"Request completed: {log_data}")
        elif response.status_code >= 400:
            logger.warning(f"Request completed: {log_data}")
        else:
            logger.info(f"Request completed: {log_data}")

        # Add request ID to response headers for debugging
        response["X-Request-ID"] = request.request_id

        return response

    def _get_client_ip(self, request):
        """Extract client IP address from request."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
            return ip.strip()
        return request.META.get("REMOTE_ADDR", "unknown")


class SecurityHeadersMiddleware(MiddlewareMixin):
    """Add security headers to all responses.

    This middleware adds various security headers to protect against
    common web vulnerabilities.
    """

    def process_response(self, request, response):
        """Add security headers to response."""
        # Prevent page from being displayed in a frame/iframe
        response["X-Frame-Options"] = "DENY"

        # Prevent MIME type sniffing
        response["X-Content-Type-Options"] = "nosniff"

        # Enable XSS filtering
        response["X-XSS-Protection"] = "1; mode=block"

        # Referrer policy
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Feature policy (basic)
        response["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"

        return response


class TimeoutMiddleware(MiddlewareMixin):
    """
    Middleware to enforce a request timeout.

    NOTE: The signal-based timeout implementation has been disabled because
    it doesn't work properly in multi-threaded environments (e.g., Django's runserver).
    Timeout handling is now managed at the WSGI server level (Gunicorn with --timeout).
    """

    def process_request(self, request):
        # COMMENTED OUT: signal-based timeout doesn't work in threads
        # def handler(signum, frame):
        #     logger.warning(f"Request timed out: {request.path}")
        #     raise TimeoutError("Request processing timed out.")
        #
        # signal.signal(signal.SIGALRM, handler)
        # signal.alarm(10)

        return None

    def process_response(self, request, response):
        # COMMENTED OUT: corresponding cleanup
        # signal.alarm(0)
        return response


class HealthCheckMiddleware(MiddlewareMixin):
    """Lightweight middleware for health check endpoints.

    Bypasses expensive middleware for health check requests
    to ensure fast response times for load balancers.
    """

    def process_request(self, request):
        """Skip processing for health check endpoints."""
        if request.path in ["/health/", "/health", "/ping"]:
            # Mark request as health check to skip other middleware
            request._is_health_check = True
        return None


class IdempotencyMiddleware(MiddlewareMixin):
    """
    Handles idempotency for POST requests using an 'Idempotency-Key' header.
    """

    def process_view(self, request, view_func, view_args, view_kwargs):
        # Only apply to POST requests with the header
        idempotency_key = request.headers.get("Idempotency-Key")
        if not all(
            [request.method == "POST", idempotency_key, request.user.is_authenticated]
        ):
            return None

        try:
            key_obj = IdempotencyKey.objects.get(
                user=request.user, idempotency_key=idempotency_key
            )
            # Parse JSON antes de retornar
            try:
                response_data = (
                    json.loads(key_obj.response_body) if key_obj.response_body else {}
                )
            except (json.JSONDecodeError, TypeError):
                response_data = {}

            return JsonResponse(response_data, status=key_obj.response_code, safe=False)
        except IdempotencyKey.DoesNotExist:
            # Store the key to be processed in the response phase
            request.idempotency_key = idempotency_key
            return None

    def process_response(self, request, response):
        idempotency_key = getattr(request, "idempotency_key", None)
        # Only store if it's a successful creation and the key was new
        if not all(
            [
                idempotency_key,
                request.method == "POST",
                request.user.is_authenticated,
                200 <= response.status_code < 300,
            ]
        ):
            return response

        try:
            IdempotencyKey.objects.create(
                user=request.user,
                idempotency_key=idempotency_key,
                request_path=request.path,
                response_code=response.status_code,
                response_body=response.content.decode("utf-8"),
            )
        except Exception:
            # Avoid crashing if the key was created by a concurrent request
            pass

        return response
