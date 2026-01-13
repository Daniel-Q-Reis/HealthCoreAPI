"""
URL configuration for the Results & Imaging app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DiagnosticReportViewSet

app_name = "results"

router = DefaultRouter()
router.register(r"reports", DiagnosticReportViewSet, basename="report")

urlpatterns = [
    path(
        "reports/analyze-diagnosis/",
        DiagnosticReportViewSet.as_view({"post": "analyze_diagnosis"}),
        name="analyze-diagnosis",
    ),
    path("", include(router.urls)),
]
