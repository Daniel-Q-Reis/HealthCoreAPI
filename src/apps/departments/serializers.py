"""
Serializers for the Departments & Specialties API.
"""

from rest_framework import serializers

from .models import Department


class DepartmentSerializer(serializers.ModelSerializer[Department]):
    class Meta:
        model = Department
        fields = ["id", "name", "description", "is_active", "created_at"]
        read_only_fields = ["id", "is_active", "created_at"]
