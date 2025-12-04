"""Custom middleware for the application."""

import json
import logging
import time
import uuid
from typing import Any

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin

from .logging import correlation_id_context
from .models import IdempotencyKey

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """Middleware to log request/response information for monitoring.

    Handles correlation ID propagation for distributed tracing:
    - Accepts correlation ID from headers (X-Correlation-ID or Correlation-ID)
    - Generates UUID if not provided
    - Stores correlation ID in contextvars for logging context
    - Adds correlation ID to response headers
    - Maintains backward compatibility with request_id

    Logs:
    - Request method, path, user agent
    - Response status code and duration
    - Request ID and correlation ID for tracing
    - User information if authenticated
    """

    def process_request(self, request: HttpRequest) -> None:
        """Add request metadata, correlation ID, and start timer."""
        request.start_time = time.time()  # type: ignore[attr-defined]
        request.request_id = str(uuid.uuid4())[:8]  # type: ignore[attr-defined]

        # Get correlation ID from headers or generate one
        correlation_id = (
            request.headers.get("X-Correlation-ID")
            or request.headers.get("Correlation-ID")
            or str(uuid.uuid4())
        )

        # Store correlation ID in request object
        request.correlation_id = correlation_id  # type: ignore[attr-defined]
        request._correlation_id = correlation_id  # type: ignore[attr-defined]

        # Store correlation ID in context variable for logging
        correlation_id_context.set(correlation_id)

        # Add request ID to response headers for debugging (backward compatibility)
        request._request_id = request.request_id  # type: ignore[attr-defined]

        return None

    def process_response(
        self, request: HttpRequest, response: HttpResponse
    ) -> HttpResponse:
        """Log request completion with timing and response info."""
        # Always add correlation ID and request ID to response headers
        # even if logging is skipped for certain paths
        if hasattr(request, "request_id"):
            response["X-Request-ID"] = request.request_id

        correlation_id = getattr(request, "correlation_id", None)
        if correlation_id:
            response["X-Correlation-ID"] = correlation_id

        # Clear correlation ID from context after request
        correlation_id_context.set(None)

        # Skip logging for static files and health checks
        if not hasattr(request, "start_time"):
            return response

        duration = time.time() - request.start_time

        skip_paths = ["/static/", "/media/", "/favicon.ico"]
        if any(request.path.startswith(path) for path in skip_paths):
            return response

        # Prepare log data
        log_data = {
            "request_id": getattr(request, "request_id", "unknown"),
            "correlation_id": getattr(request, "correlation_id", "unknown"),
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

        return response

    def _get_client_ip(self, request: HttpRequest) -> str:
        """Extract client IP address from request."""
        x_forwarded_for: Any = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = str(x_forwarded_for).split(",")[0]
            return ip.strip()
        return str(request.META.get("REMOTE_ADDR", "unknown"))


class SecurityHeadersMiddleware(MiddlewareMixin):
    """Add security headers to all responses.

    This middleware adds various security headers to protect against
    common web vulnerabilities.
    """

    def process_response(
        self, request: HttpRequest, response: HttpResponse
    ) -> HttpResponse:
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

    def process_request(self, request: HttpRequest) -> None:
        # COMMENTED OUT: signal-based timeout doesn't work in threads
        # def handler(signum, frame):
        #     logger.warning(f"Request timed out: {request.path}")
        #     raise TimeoutError("Request processing timed out.")
        #
        # signal.signal(signal.SIGALRM, handler)
        # signal.alarm(10)

        return None

    def process_response(
        self, request: HttpRequest, response: HttpResponse
    ) -> HttpResponse:
        # COMMENTED OUT: corresponding cleanup
        # signal.alarm(0)
        return response


class HealthCheckMiddleware(MiddlewareMixin):
    """Lightweight middleware for health check endpoints.

    Bypasses expensive middleware for health check requests
    to ensure fast response times for load balancers.
    """

    def process_request(self, request: HttpRequest) -> None:
        """Skip processing for health check endpoints."""
        if request.path in ["/health/", "/health", "/ping"]:
            # Mark request as health check to skip other middleware
            request._is_health_check = True  # type: ignore[attr-defined]
        return None


class IdempotencyMiddleware(MiddlewareMixin):
    """
    Handles idempotency for POST requests using an 'Idempotency-Key' header.
    """

    def process_view(
        self,
        request: HttpRequest,
        view_func: Any,
        view_args: Any,
        view_kwargs: Any,
    ) -> JsonResponse | None:
        # Only apply to POST requests with the header
        idempotency_key: str | None = request.headers.get("Idempotency-Key")
        if not all(
            [request.method == "POST", idempotency_key, request.user.is_authenticated]
        ):
            return None

        try:
            # Convert idempotency_key to UUID if it's a string
            idempotency_key_uuid: uuid.UUID
            if isinstance(idempotency_key, str):
                try:
                    idempotency_key_uuid = uuid.UUID(idempotency_key)
                except ValueError:
                    # If it's not a valid UUID, return None to proceed with request
                    request.idempotency_key = idempotency_key  # type: ignore[attr-defined]
                    return None
            else:
                request.idempotency_key = idempotency_key  # type: ignore[attr-defined]
                return None

            key_obj = IdempotencyKey.objects.get(
                user=request.user,  # type: ignore[misc]
                idempotency_key=idempotency_key_uuid,
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
            request.idempotency_key = idempotency_key  # type: ignore[attr-defined]
            return None

    def process_response(
        self, request: HttpRequest, response: HttpResponse
    ) -> HttpResponse:
        idempotency_key: str | None = getattr(request, "idempotency_key", None)
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
            # Convert idempotency_key to UUID if it's a string
            idempotency_key_uuid: uuid.UUID
            if isinstance(idempotency_key, str):
                try:
                    idempotency_key_uuid = uuid.UUID(idempotency_key)
                except ValueError:
                    # If it's not a valid UUID string, generate a new one
                    idempotency_key_uuid = uuid.uuid4()
            else:
                idempotency_key_uuid = uuid.uuid4()

            IdempotencyKey.objects.create(
                user=request.user,  # type: ignore[misc]
                idempotency_key=idempotency_key_uuid,
                request_path=request.path,
                response_code=response.status_code,
                response_body=response.content.decode("utf-8"),
            )
        except Exception:
            # Avoid crashing if the key was created by a concurrent request
            pass

        return response
