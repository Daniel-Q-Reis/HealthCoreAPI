"""
Core serializers for the application.
"""

from typing import Any

from rest_framework import serializers

from .models import Post, ProfessionalRoleRequest


class HealthCheckSerializer(serializers.Serializer[Any]):
    """
    Serializer for the health check endpoint.
    """

    status = serializers.CharField(read_only=True)
    version = serializers.CharField(read_only=True)
    timestamp = serializers.DateTimeField(read_only=True)


class PostSerializer(serializers.ModelSerializer[Post]):
    """
    Serializer for the Post model.

    Handles validation and serialization for Post objects, making them
    renderable as JSON for the API.
    """

    author = serializers.StringRelatedField(read_only=True)  # type: ignore[var-annotated]

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "content",
            "author",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["slug", "author", "is_active"]


class ProfessionalRoleRequestSerializer(
    serializers.ModelSerializer[ProfessionalRoleRequest]
):
    """
    Serializer for professional role requests with credential verification.

    Handles file uploads (PDF, images) for license documents, certifications,
    and employment verification. Provides user details for admin review.

    File upload support:
    - license_document: Required (PDF/Image)
    - certification_document: Optional (PDF/Image)
    - employment_verification: Optional (PDF/Image)

    Usage:
        # Create request with file uploads
        serializer = ProfessionalRoleRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)

        # Admin review
        requests = ProfessionalRoleRequest.objects.filter(status='pending')
        serializer = ProfessionalRoleRequestSerializer(requests, many=True)
    """

    user_details = serializers.SerializerMethodField()
    reviewer_details = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalRoleRequest
        fields = [
            "id",
            "user",
            "user_details",
            "role_requested",
            "license_number",
            "license_state",
            "specialty",
            "reason",
            "license_document",
            "certification_document",
            "employment_verification",
            "status",
            "reviewed_by",
            "reviewer_details",
            "reviewed_at",
            "review_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "user",
            "status",
            "reviewed_by",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]

    def get_user_details(self, obj: ProfessionalRoleRequest) -> dict[str, Any]:
        """
        Get user details for display in admin dashboard.

        Args:
            obj: ProfessionalRoleRequest instance

        Returns:
            dict: User information including id, username, email, name
        """
        return {
            "id": obj.user.id,
            "username": obj.user.username,
            "email": obj.user.email,
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name,
            "full_name": f"{obj.user.first_name} {obj.user.last_name}".strip()
            or obj.user.username,
        }

    def get_reviewer_details(
        self, obj: ProfessionalRoleRequest
    ) -> dict[str, Any] | None:
        """
        Get reviewer details if request has been reviewed.

        Args:
            obj: ProfessionalRoleRequest instance

        Returns:
            dict | None: Reviewer information or None if not reviewed
        """
        if not obj.reviewed_by:
            return None

        return {
            "id": obj.reviewed_by.id,
            "username": obj.reviewed_by.username,
            "full_name": f"{obj.reviewed_by.first_name} {obj.reviewed_by.last_name}".strip()
            or obj.reviewed_by.username,
        }

    def validate_license_document(self, value: Any) -> Any:
        """
        Validate license document file upload.

        Args:
            value: Uploaded file

        Returns:
            Validated file

        Raises:
            ValidationError: If file is invalid or too large
        """
        # Maximum file size: 10MB
        max_size = 10 * 1024 * 1024  # 10MB in bytes

        if value.size > max_size:
            raise serializers.ValidationError(
                "License document file size cannot exceed 10MB."
            )

        # Allowed file extensions
        allowed_extensions = [".pdf", ".jpg", ".jpeg", ".png"]
        file_extension = value.name.lower().split(".")[-1]

        if f".{file_extension}" not in allowed_extensions:
            raise serializers.ValidationError(
                f"License document must be PDF or image file. "
                f"Allowed: {', '.join(allowed_extensions)}"
            )

        return value

    def validate_certification_document(self, value: Any) -> Any:
        """
        Validate certification document file upload (optional).

        Args:
            value: Uploaded file

        Returns:
            Validated file

        Raises:
            ValidationError: If file is invalid or too large
        """
        if not value:
            return value

        # Maximum file size: 10MB
        max_size = 10 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError(
                "Certification document file size cannot exceed 10MB."
            )

        # Allowed file extensions
        allowed_extensions = [".pdf", ".jpg", ".jpeg", ".png"]
        file_extension = value.name.lower().split(".")[-1]

        if f".{file_extension}" not in allowed_extensions:
            raise serializers.ValidationError(
                f"Certification document must be PDF or image file. "
                f"Allowed: {', '.join(allowed_extensions)}"
            )

        return value

    def validate_employment_verification(self, value: Any) -> Any:
        """
        Validate employment verification document (optional).

        Args:
            value: Uploaded file

        Returns:
            Validated file

        Raises:
            ValidationError: If file is invalid or too large
        """
        if not value:
            return value

        # Maximum file size: 10MB
        max_size = 10 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError(
                "Employment verification file size cannot exceed 10MB."
            )

        # Allowed file extensions
        allowed_extensions = [".pdf", ".jpg", ".jpeg", ".png"]
        file_extension = value.name.lower().split(".")[-1]

        if f".{file_extension}" not in allowed_extensions:
            raise serializers.ValidationError(
                f"Employment verification must be PDF or image file. "
                f"Allowed: {', '.join(allowed_extensions)}"
            )

        return value
