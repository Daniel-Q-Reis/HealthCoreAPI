"""App configuration for Clinical Orders."""

from django.apps import AppConfig


class OrdersConfig(AppConfig):
    """Configuration for orders app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "src.apps.orders"
    verbose_name = "Clinical Orders"
