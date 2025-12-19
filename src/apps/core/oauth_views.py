"""
OAuth callback views for JWT token generation.

After successful OAuth authentication, social-auth creates a Django session
but doesn't provide JWT tokens. This view generates JWT tokens for the
authenticated user and redirects to the frontend with tokens in URL params.
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


def oauth_callback(request: HttpRequest) -> HttpResponse:
    """
    Generate JWT tokens after successful OAuth authentication.

    This view is called after social-auth completes the OAuth flow.
    It generates JWT tokens and redirects to the frontend with tokens.

    Args:
        request: HTTP request with authenticated user (from OAuth session)

    Returns:
        Redirect to frontend dashboard with JWT tokens in URL params
    """
    if not request.user.is_authenticated:
        # If not authenticated, redirect to login
        return redirect("/dqr-health/login")

    # Generate JWT tokens for the authenticated user
    refresh = RefreshToken.for_user(request.user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    # Redirect to frontend with tokens
    # Frontend will extract tokens from URL and save to localStorage
    redirect_url = (
        f"{settings.FRONTEND_URL}/dqr-health/auth/callback"
        f"?access={access_token}&refresh={refresh_token}"
    )

    return redirect(redirect_url)
