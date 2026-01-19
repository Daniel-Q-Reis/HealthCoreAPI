"""
Test suite for OAuth callback views.

Tests the JWT token generation and redirection logic after
social-auth authentication.
"""

import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import RequestFactory

from src.apps.core.oauth_views import oauth_callback

User = get_user_model()


@pytest.fixture
def request_factory():
    """Fixture providing request factory."""
    return RequestFactory()


@pytest.fixture
def user():
    """Fixture providing a test user."""
    return User.objects.create_user(
        username="testuser", email="test@example.com", password="testpass123"
    )


@pytest.mark.django_db
class TestOAuthCallback:
    """Test suite for oauth_callback view."""

    def test_unauthenticated_redirect(self, request_factory):
        """Test that unauthenticated users are redirected to login."""
        # Create request without user authentication
        request = request_factory.get("/api/v1/auth/callback/")

        # Simulate unauthenticated user
        from django.contrib.auth.models import AnonymousUser

        request.user = AnonymousUser()

        response = oauth_callback(request)

        # Should redirect to frontend login
        assert response.status_code == 302
        assert response.url == "/dqr-health/login"

    def test_authenticated_token_generation(self, request_factory, user):
        """Test that authenticated users get tokens and redirect."""
        request = request_factory.get("/api/v1/auth/callback/")
        request.user = user

        response = oauth_callback(request)

        # Should redirect to frontend auth callback
        assert response.status_code == 302
        assert f"{settings.FRONTEND_URL}/dqr-health/auth/callback" in response.url

        # URL should contain access and refresh tokens
        assert "access=" in response.url
        assert "refresh=" in response.url
