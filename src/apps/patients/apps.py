from django.apps import AppConfig


class PatientsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "src.apps.patients"

    def ready(self) -> None:
        """Import signals when app is ready"""
        import src.apps.patients.signals  # noqa: F401
