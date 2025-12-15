from django.apps import AppConfig


class SchedulingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "src.apps.scheduling"

    def ready(self) -> None:
        """Import signals when app is ready"""
        import src.apps.scheduling.signals  # noqa: F401
