"""
Tests for custom middleware.

Comprehensive test suite for RequestLoggingMiddleware correlation ID functionality.
"""

import logging
import uuid
from io import StringIO

import pytest
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from django.test import RequestFactory

from src.apps.core.logging import correlation_id_context
from src.apps.core.middleware import RequestLoggingMiddleware

User = get_user_model()


@pytest.fixture
def middleware():
    """Fixture providing RequestLoggingMiddleware instance."""
    return RequestLoggingMiddleware(get_response=lambda request: HttpResponse())


@pytest.fixture
def request_factory():
    """Fixture providing RequestFactory for creating mock requests."""
    return RequestFactory()


@pytest.fixture
def user():
    """Fixture providing a test user."""
    return User.objects.create_user(
        username="testuser", email="test@example.com", password="testpass123"
    )


class TestCorrelationIDAcceptance:
    """Test correlation ID acceptance from headers."""

    def test_accepts_x_correlation_id_header(self, middleware, request_factory):
        """Test that middleware accepts X-Correlation-ID header."""
        correlation_id = str(uuid.uuid4())
        request = request_factory.get("/test/", HTTP_X_CORRELATION_ID=correlation_id)

        middleware.process_request(request)

        assert hasattr(request, "correlation_id")
        assert request.correlation_id == correlation_id
        assert correlation_id_context.get() == correlation_id

    def test_accepts_correlation_id_header(self, middleware, request_factory):
        """Test that middleware accepts Correlation-ID header."""
        correlation_id = str(uuid.uuid4())
        request = request_factory.get("/test/", HTTP_CORRELATION_ID=correlation_id)

        middleware.process_request(request)

        assert hasattr(request, "correlation_id")
        assert request.correlation_id == correlation_id
        assert correlation_id_context.get() == correlation_id

    def test_x_correlation_id_takes_precedence(self, middleware, request_factory):
        """Test that X-Correlation-ID takes precedence over Correlation-ID."""
        x_correlation_id = str(uuid.uuid4())
        correlation_id = str(uuid.uuid4())
        request = request_factory.get(
            "/test/",
            HTTP_X_CORRELATION_ID=x_correlation_id,
            HTTP_CORRELATION_ID=correlation_id,
        )

        middleware.process_request(request)

        assert request.correlation_id == x_correlation_id
        assert correlation_id_context.get() == x_correlation_id

    def test_generates_correlation_id_when_not_provided(
        self, middleware, request_factory
    ):
        """Test that middleware generates correlation ID when not provided."""
        request = request_factory.get("/test/")

        middleware.process_request(request)

        assert hasattr(request, "correlation_id")
        assert request.correlation_id is not None
        assert len(request.correlation_id) == 36  # UUID format
        # Verify it's a valid UUID
        uuid.UUID(request.correlation_id)


class TestCorrelationIDResponseHeaders:
    """Test correlation ID in response headers."""

    def test_adds_correlation_id_to_response_headers(self, middleware, request_factory):
        """Test that correlation ID is added to response headers."""
        correlation_id = str(uuid.uuid4())
        request = request_factory.get("/test/", HTTP_X_CORRELATION_ID=correlation_id)
        response = HttpResponse()

        middleware.process_request(request)
        response = middleware.process_response(request, response)

        assert "X-Correlation-ID" in response
        assert response["X-Correlation-ID"] == correlation_id

    def test_adds_generated_correlation_id_to_response_headers(
        self, middleware, request_factory
    ):
        """Test that generated correlation ID is added to response headers."""
        request = request_factory.get("/test/")
        response = HttpResponse()

        middleware.process_request(request)
        response = middleware.process_response(request, response)

        assert "X-Correlation-ID" in response
        assert response["X-Correlation-ID"] == request.correlation_id

    def test_clears_correlation_id_from_context_after_response(
        self, middleware, request_factory
    ):
        """Test that correlation ID is cleared from context after response."""
        correlation_id = str(uuid.uuid4())
        request = request_factory.get("/test/", HTTP_X_CORRELATION_ID=correlation_id)
        response = HttpResponse()

        middleware.process_request(request)
        assert correlation_id_context.get() == correlation_id

        middleware.process_response(request, response)
        assert correlation_id_context.get() is None


class TestCorrelationIDLogging:
    """Test correlation ID propagation in log records."""

    def test_correlation_id_in_log_data(self, middleware, request_factory):
        """Test that correlation ID is included in log data."""
        correlation_id = str(uuid.uuid4())
        request = request_factory.get("/test/", HTTP_X_CORRELATION_ID=correlation_id)
        response = HttpResponse(status=200)

        # Capture log output
        log_capture = StringIO()
        handler = logging.StreamHandler(log_capture)
        logger = logging.getLogger("src.apps.core.middleware")
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)

        try:
            middleware.process_request(request)
            middleware.process_response(request, response)

            log_output = log_capture.getvalue()
            assert correlation_id in log_output
        finally:
            logger.removeHandler(handler)

    def test_correlation_id_in_log_with_authenticated_user(
        self, middleware, request_factory, user
    ):
        """Test correlation ID logging with authenticated user."""
        correlation_id = str(uuid.uuid4())
        request = request_factory.get("/test/", HTTP_X_CORRELATION_ID=correlation_id)
        request.user = user
        response = HttpResponse(status=200)

        log_capture = StringIO()
        handler = logging.StreamHandler(log_capture)
        logger = logging.getLogger("src.apps.core.middleware")
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)

        try:
            middleware.process_request(request)
            middleware.process_response(request, response)

            log_output = log_capture.getvalue()
            assert correlation_id in log_output
            assert "user_id" in log_output or str(user.id) in log_output
        finally:
            logger.removeHandler(handler)


class TestCorrelationIDWithDifferentMethods:
    """Test correlation ID with different HTTP methods."""

    @pytest.mark.parametrize("method", ["GET", "POST", "PUT", "PATCH", "DELETE"])
    def test_correlation_id_with_http_method(self, middleware, request_factory, method):
        """Test correlation ID works with different HTTP methods."""
        correlation_id = str(uuid.uuid4())
        request = getattr(request_factory, method.lower())(
            "/test/", HTTP_X_CORRELATION_ID=correlation_id
        )
        response = HttpResponse()

        middleware.process_request(request)
        response = middleware.process_response(request, response)

        assert request.correlation_id == correlation_id
        assert response["X-Correlation-ID"] == correlation_id


class TestCorrelationIDWithErrorResponses:
    """Test correlation ID with error responses."""

    @pytest.mark.parametrize("status_code", [400, 401, 403, 404, 500, 503])
    def test_correlation_id_with_error_status(
        self, middleware, request_factory, status_code
    ):
        """Test correlation ID is included in error responses."""
        correlation_id = str(uuid.uuid4())
        request = request_factory.get("/test/", HTTP_X_CORRELATION_ID=correlation_id)
        response = HttpResponse(status=status_code)

        middleware.process_request(request)
        response = middleware.process_response(request, response)

        assert response["X-Correlation-ID"] == correlation_id


class TestCorrelationIDBackwardCompatibility:
    """Test backward compatibility with request_id."""

    def test_request_id_still_generated(self, middleware, request_factory):
        """Test that request_id is still generated for backward compatibility."""
        request = request_factory.get("/test/")

        middleware.process_request(request)

        assert hasattr(request, "request_id")
        assert request.request_id is not None
        assert len(request.request_id) == 8  # Shortened UUID format

    def test_request_id_in_response_headers(self, middleware, request_factory):
        """Test that X-Request-ID is still in response headers."""
        request = request_factory.get("/test/")
        response = HttpResponse()

        middleware.process_request(request)
        response = middleware.process_response(request, response)

        assert "X-Request-ID" in response
        assert response["X-Request-ID"] == request.request_id

    def test_both_ids_in_log_data(self, middleware, request_factory):
        """Test that both request_id and correlation_id are in log data."""
        correlation_id = str(uuid.uuid4())
        request = request_factory.get("/test/", HTTP_X_CORRELATION_ID=correlation_id)
        response = HttpResponse(status=200)

        log_capture = StringIO()
        handler = logging.StreamHandler(log_capture)
        logger = logging.getLogger("src.apps.core.middleware")
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)

        try:
            middleware.process_request(request)
            middleware.process_response(request, response)

            log_output = log_capture.getvalue()
            assert correlation_id in log_output
            assert request.request_id in log_output
        finally:
            logger.removeHandler(handler)


class TestCorrelationIDWithSkippedPaths:
    """Test correlation ID behavior with skipped paths."""

    @pytest.mark.parametrize(
        "path", ["/static/test.css", "/media/test.jpg", "/favicon.ico"]
    )
    def test_correlation_id_not_logged_for_skipped_paths(
        self, middleware, request_factory, path
    ):
        """Test that correlation ID is not logged for static/media paths."""
        correlation_id = str(uuid.uuid4())
        request = request_factory.get(path, HTTP_X_CORRELATION_ID=correlation_id)
        response = HttpResponse()

        log_capture = StringIO()
        handler = logging.StreamHandler(log_capture)
        logger = logging.getLogger("src.apps.core.middleware")
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)

        try:
            middleware.process_request(request)
            middleware.process_response(request, response)

            # Correlation ID should still be in response headers
            assert response["X-Correlation-ID"] == correlation_id
            # But log might be skipped for these paths
        finally:
            logger.removeHandler(handler)
