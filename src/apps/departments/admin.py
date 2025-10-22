"""
Django Admin configuration for the Departments & Specialties bounded context.
"""

from django.contrib import admin

from .models import Department, SpecialtyRule


class SpecialtyRuleInline(admin.TabularInline):
    model = SpecialtyRule
    extra = 1


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_at")
    search_fields = ("name", "description")
    inlines = [SpecialtyRuleInline]


@admin.register(SpecialtyRule)
class SpecialtyRuleAdmin(admin.ModelAdmin):
    list_display = (
        "department",
        "rule_key",
        "effective_from",
        "effective_to",
        "is_active",
    )
    list_filter = ("department", "is_active")
    search_fields = ("rule_key", "department__name")
    autocomplete_fields = ("department",)
