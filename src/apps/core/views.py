"""Core views for the application."""

import logging
from datetime import datetime
from typing import Any, cast

from django.conf import settings
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from . import repositories, services
from .models import Post, ProfessionalRoleRequest
from .permissions import IsAdmin, IsOwnerOrReadOnly
from .serializers import (
    HealthCheckSerializer,
    PostSerializer,
    ProfessionalRoleRequestSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)


# ============================================================================
# Authentication Views
# ============================================================================


@extend_schema(
    tags=["Authentication"],
    summary="Get current user",
    description="Get details of the currently authenticated user.",
    responses={200: UserSerializer},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request: Request) -> Response:
    """
    Get the currently authenticated user.
    """
    serializer = UserSerializer(cast(User, request.user))
    return Response(serializer.data)


@extend_schema(
    tags=["Authentication"],
    summary="Logout user",
    description="Logout the user by blacklisting the refresh token.",
    responses={204: None},
)
@api_view(["POST"])
@permission_classes([AllowAny])
def logout_user(request: Request) -> Response:
    """
    Logout the user.
    """
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception as e:
        # Ignore errors if token is invalid or already blacklisted
        logger.warning(f"Logout error: {e}")
        pass

    return Response(status=status.HTTP_204_NO_CONTENT)


class HealthCheckData:
    """Simple data class for health check response."""

    def __init__(self, status: str, version: str, timestamp: str) -> None:
        self.status = status
        self.version = version
        self.timestamp = timestamp


class HealthCheckAPIView(APIView):
    """
    API view for health check.

    Provides a structured health check response using DRF Serializer.
    This is more aligned with standard API practices.
    """

    permission_classes = [AllowAny]
    serializer_class = HealthCheckSerializer

    def get(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        """
        Return the health status of the application.
        """
        health_data = HealthCheckData(
            status="ok",
            version=getattr(settings, "VERSION", "1.0.0"),
            timestamp=datetime.utcnow().isoformat(),
        )
        serializer = self.serializer_class(instance=health_data)
        return Response(serializer.data)


@extend_schema(tags=["Posts"])
class PostViewSet(viewsets.ModelViewSet[Post]):
    """
    API endpoint that allows posts to be viewed or edited.

    Permissions:
    - List/Retrieve: Any authenticated user can read posts
    - Create/Update/Delete: Only post owner can modify (via IsOwnerOrReadOnly)

    Provides a full CRUD interface for the Post model.
    - `list`: Returns a list of all active posts.
    - `create`: Creates a new post. Requires authentication.
    - `retrieve`: Retrieves a single post by its slug.
    - `update`: Updates a post. Requires authentication.
    - `partial_update`: Partially updates a post. Requires authentication.
    - `destroy`: Soft-deletes a post. Requires authentication.
    """

    # OPTIMIZATION: Add select_related for author.
    # NOTE: We use the repository getter but chain select_related to it.
    queryset = repositories.get_active_posts().select_related("author")
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    lookup_field = "slug"

    @extend_schema(
        summary="List all active posts",
        description="Returns a paginated list of all posts that are marked as active.",
    )
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary="Create a new post",
        description="Creates a new post. The author will be set to the currently authenticated user.",
        examples=[
            OpenApiExample(
                "Create a new post",
                value={
                    "title": "My New Post Title",
                    "content": "This is the content of my new post.",
                },
                request_only=True,
            ),
        ],
    )
    def create(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary="Retrieve a post",
        description="Retrieves a single post by its unique slug.",
    )
    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        summary="Update a post",
        description="Updates a post. Only the author of the post can perform this action.",
        examples=[
            OpenApiExample(
                "Update a post",
                value={
                    "title": "My Updated Post Title",
                    "content": "This is the updated content of my post.",
                },
                request_only=True,
            ),
        ],
    )
    def update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().update(request, *args, **kwargs)

    @extend_schema(
        summary="Partially update a post",
        description="Partially updates a post. Only the author of the post can perform this action.",
    )
    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        summary="Delete a post",
        description="Soft-deletes a post by marking it as inactive. Only the author of the post can perform this action.",
    )
    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().destroy(request, *args, **kwargs)

    def perform_create(self, serializer: BaseSerializer[Post]) -> None:
        """
        Overrides the default create method to use the `create_post` service.
        This ensures that the author is correctly set to the request user.
        """
        user = self.request.user
        if not isinstance(user, User):
            raise ValueError("User must be authenticated")
        services.create_post(author=user, **serializer.validated_data)

    def perform_destroy(self, instance: Post) -> None:
        """
        Overrides the default destroy method to perform a soft delete.
        """
        instance.soft_delete()


# ============================================================================
# Professional Role Request Views (Credential Verification)
# ============================================================================


@extend_schema(
    tags=["Authentication"],
    summary="Request professional role",
    description=(
        "Submit a request for professional role elevation (Doctor, Nurse, "
        "Pharmacist, Receptionist). Requires upload of credential documents "
        "(license, certification, employment verification). Admin approval required."
    ),
    request=ProfessionalRoleRequestSerializer,
    responses={
        201: ProfessionalRoleRequestSerializer,
        400: {"description": "Invalid data or file upload error"},
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_professional_role(request: Request) -> Response:
    """
    Submit request for professional role with credential verification.

    Authenticated users can request elevation to professional roles by
    submitting their credentials and supporting documents. All requests
    require admin approval.

    Security:
    - Requires authentication
    - User is automatically set from request.user
    - Status defaults to 'pending'
    - Complete audit trail maintained

    File uploads:
    - license_document: Required (PDF/Image, max 10MB)
    - certification_document: Optional (PDF/Image, max 10MB)
    - employment_verification: Optional (PDF/Image, max 10MB)

    Args:
        request: HTTP request with multipart/form-data containing:
            - role_requested: str (Doctors, Nurses, Pharmacists, Receptionists)
            - license_number: str
            - license_state: str
            - specialty: str (optional, for doctors)
            - reason: str
            - license_document: file
            - certification_document: file (optional)
            - employment_verification: file (optional)

    Returns:
        Response: Created request with status 201, or validation errors with 400

    Example:
        POST /api/v1/auth/request-professional-role/
        Content-Type: multipart/form-data

        {
            "role_requested": "Doctors",
            "license_number": "MD123456",
            "license_state": "CA",
            "specialty": "Cardiology",
            "reason": "Licensed cardiologist at UCLA Health",
            "license_document": <file>,
            "certification_document": <file>
        }
    """
    serializer = ProfessionalRoleRequestSerializer(data=request.data)

    if serializer.is_valid():
        # Save with current user
        serializer.save(user=request.user)

        # Audit log
        logger.info(
            f"Professional role request submitted: "
            f"user={request.user.username}, "
            f"role={serializer.data['role_requested']}, "
            f"license={serializer.data['license_number']}"
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Admin"],
    summary="List professional role requests",
    description=(
        "List all professional role requests. Admin only. "
        "Can filter by status (pending, approved, rejected)."
    ),
    responses={
        200: ProfessionalRoleRequestSerializer(many=True),
        403: {"description": "Admin privileges required"},
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def list_role_requests(request: Request) -> Response:
    """
    List all professional role requests (Admin only).

    Allows admins to view and filter credential verification requests.
    Supports filtering by status to show pending, approved, or rejected requests.

    Security:
    - Requires authentication
    - Requires admin privileges (IsAdmin permission)

    Query Parameters:
        status: str (optional) - Filter by status (pending, approved, rejected)
                Default: 'pending'

    Returns:
        Response: List of role requests with status 200

    Example:
        GET /api/v1/admin/credential-requests/?status=pending
        GET /api/v1/admin/credential-requests/?status=approved
    """
    request_status = request.query_params.get("status", "pending")

    # Validate status parameter
    valid_statuses = ["pending", "approved", "rejected"]
    if request_status not in valid_statuses:
        return Response(
            {"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Query requests with related user data
    requests_queryset = ProfessionalRoleRequest.objects.filter(
        status=request_status
    ).select_related("user", "reviewed_by")

    serializer = ProfessionalRoleRequestSerializer(requests_queryset, many=True)

    logger.info(
        f"Admin {request.user.username} listed {len(serializer.data)} "
        f"{request_status} role requests"
    )

    return Response(serializer.data)


@extend_schema(
    tags=["Admin"],
    summary="Approve professional role request",
    description=(
        "Approve a professional role request and grant the role to the user. "
        "Admin only. Adds user to the requested group."
    ),
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "notes": {
                    "type": "string",
                    "description": "Optional notes about the approval decision",
                }
            },
        }
    },
    responses={
        200: {
            "description": "Request approved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "status": "approved",
                        "message": "Role granted successfully",
                        "user": "john.doe",
                        "role": "Doctors",
                    }
                }
            },
        },
        403: {"description": "Admin privileges required"},
        404: {"description": "Request not found"},
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_role_request(request: Request, request_id: int) -> Response:
    """
    Approve a professional role request (Admin only).

    Grants the requested role to the user by adding them to the appropriate
    Django group. Records the approval with admin details and timestamp.

    Security:
    - Requires authentication
    - Requires admin privileges (IsAdmin permission)
    - Complete audit trail maintained

    Side effects:
    - Adds user to requested group (Doctors, Nurses, etc.)
    - Updates request status to 'approved'
    - Records reviewer, timestamp, and notes

    Args:
        request: HTTP request with optional JSON body containing:
            - notes: str (optional) - Admin notes about approval
        request_id: int - ID of the ProfessionalRoleRequest to approve

    Returns:
        Response: Success message with status 200, or error with 404

    Example:
        POST /api/v1/admin/credential-requests/123/approve/
        {
            "notes": "License MD123456 verified with CA Medical Board. Active until 2026-12-31."
        }
    """
    role_request = get_object_or_404(ProfessionalRoleRequest, id=request_id)

    # Get approval notes from request body
    notes = request.data.get("notes", "")

    # Approve the request (uses model method)
    role_request.approve(reviewer=request.user, notes=notes)

    # Audit log
    logger.info(
        f"Role request approved: "
        f"user={role_request.user.username}, "
        f"role={role_request.role_requested}, "
        f"approved_by={request.user.username}, "
        f"license={role_request.license_number}"
    )

    return Response(
        {
            "status": "approved",
            "message": "Role granted successfully",
            "user": role_request.user.username,
            "role": role_request.role_requested,
        }
    )


@extend_schema(
    tags=["Admin"],
    summary="Reject professional role request",
    description=(
        "Reject a professional role request. Admin only. "
        "Requires a reason for rejection."
    ),
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "reason": {
                    "type": "string",
                    "description": "Reason for rejection (required)",
                }
            },
            "required": ["reason"],
        }
    },
    responses={
        200: {
            "description": "Request rejected successfully",
            "content": {
                "application/json": {
                    "example": {
                        "status": "rejected",
                        "message": "Request rejected",
                        "user": "john.doe",
                        "role": "Doctors",
                    }
                }
            },
        },
        400: {"description": "Reason is required"},
        403: {"description": "Admin privileges required"},
        404: {"description": "Request not found"},
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def reject_role_request(request: Request, request_id: int) -> Response:
    """
    Reject a professional role request (Admin only).

    Rejects the credential verification request with a mandatory reason.
    Records the rejection with admin details and timestamp.

    Security:
    - Requires authentication
    - Requires admin privileges (IsAdmin permission)
    - Complete audit trail maintained

    Side effects:
    - Updates request status to 'rejected'
    - Records reviewer, timestamp, and rejection reason

    Args:
        request: HTTP request with JSON body containing:
            - reason: str (required) - Reason for rejection
        request_id: int - ID of the ProfessionalRoleRequest to reject

    Returns:
        Response: Success message with status 200, or error with 400/404

    Example:
        POST /api/v1/admin/credential-requests/123/reject/
        {
            "reason": "License number MD123456 not found in CA Medical Board database. Please verify and resubmit."
        }
    """
    role_request = get_object_or_404(ProfessionalRoleRequest, id=request_id)

    # Get rejection reason from request body (required)
    reason = request.data.get("reason", "").strip()

    if not reason:
        return Response(
            {"error": "Rejection reason is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Reject the request (uses model method)
    role_request.reject(reviewer=request.user, reason=reason)

    # Audit log
    logger.info(
        f"Role request rejected: "
        f"user={role_request.user.username}, "
        f"role={role_request.role_requested}, "
        f"rejected_by={request.user.username}, "
        f"reason={reason[:100]}"  # Log first 100 chars of reason
    )

    return Response(
        {
            "status": "rejected",
            "message": "Request rejected",
            "user": role_request.user.username,
            "role": role_request.role_requested,
        }
    )
