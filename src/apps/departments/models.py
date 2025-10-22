"""
Domain models for the Departments & Specialties bounded context.
"""

from django.db import models

from src.apps.core.models import ActivatableModel


class Department(ActivatableModel):
    """
    Represents a hospital department (e.g., Cardiology, Radiology).
    """

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    # 'capabilities' flag field can be added later

    class Meta:
        verbose_name = "Department"
        verbose_name_plural = "Departments"
        ordering = ["name"]

    def __str__(self):
        return self.name


class SpecialtyRule(ActivatableModel):
    """
    Placeholder for department-specific rules (feature-flag aware).
    For MVP, it's a basic structure.
    """

    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="rules"
    )
    rule_key = models.CharField(max_length=100, help_text="Identifier for the rule")
    rule_value = models.JSONField(
        help_text="JSON structure defining the rule's parameters"
    )
    effective_from = models.DateTimeField(null=True, blank=True)
    effective_to = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Specialty Rule"
        verbose_name_plural = "Specialty Rules"
        ordering = ["department", "rule_key"]
        unique_together = (
            "department",
            "rule_key",
        )  # Ensure unique rule per department

    def __str__(self):
        return f"Rule '{self.rule_key}' for {self.department.name}"
