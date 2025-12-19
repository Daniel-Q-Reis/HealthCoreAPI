"""
Core app URL configuration.

Includes health checks and other core functionality.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .health import (
    health_check_view,
    liveness_check_view,
    readiness_check_view,
)
from .oauth_views import oauth_callback
from .views import (
    HealthCheckAPIView,
    PostViewSet,
    approve_role_request,
    get_current_user,
    list_role_requests,
    logout_user,
    reject_role_request,
    request_professional_role,
)

app_name = "core"

# API Router
router = DefaultRouter()
router.register(r"posts", PostViewSet, basename="post")

urlpatterns = [
    # Health check endpoints for monitoring
    path("health/", health_check_view, name="health-check"),
    path("health/ready/", readiness_check_view, name="readiness-check"),
    path("health/live/", liveness_check_view, name="liveness-check"),
    # Alias for Kubernetes/Docker health checks
    path("healthz/", health_check_view, name="healthz"),
    path("readyz/", readiness_check_view, name="readyz"),
    path("livez/", liveness_check_view, name="livez"),
    # API endpoint for health check
    path("api/health/", HealthCheckAPIView.as_view(), name="api-health-check"),
    # OAuth callback endpoint (generates JWT tokens after OAuth success)
    path("api/auth/oauth/callback/", oauth_callback, name="oauth-callback"),
    # Registration endpoint (dj-rest-auth)
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    # Auth endpoints matching Frontend API
    path("api/auth/login/", TokenObtainPairView.as_view(), name="auth-login"),
    path("api/auth/logout/", logout_user, name="auth-logout"),
    path("api/auth/me/", get_current_user, name="auth-me"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    # Credential verification endpoints
    path(
        "api/auth/request-professional-role/",
        request_professional_role,
        name="request-professional-role",
    ),
    path(
        "api/admin/credential-requests/",
        list_role_requests,
        name="list-credential-requests",
    ),
    path(
        "api/admin/credential-requests/<int:request_id>/approve/",
        approve_role_request,
        name="approve-credential-request",
    ),
    path(
        "api/admin/credential-requests/<int:request_id>/reject/",
        reject_role_request,
        name="reject-credential-request",
    ),
    # API endpoints from the router
    path("api/", include(router.urls)),
]
