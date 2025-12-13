"""Core views for the application."""

import logging
from datetime import datetime
from typing import Any

from django.conf import settings
from django.contrib.auth.models import User
from drf_spectacular.utils import OpenApiExample, extend_schema
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.serializers import BaseSerializer
from rest_framework.views import APIView

from . import repositories, services
from .models import Post
from .permissions import IsOwnerOrReadOnly
from .serializers import HealthCheckSerializer, PostSerializer

logger = logging.getLogger(__name__)


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
