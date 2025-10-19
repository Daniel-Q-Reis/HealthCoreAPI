"""
URL configuration for the Patients app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PatientViewSet

app_name = "patients"

router = DefaultRouter()
router.register(r"", PatientViewSet, basename="patient")

urlpatterns = [
    path("", include(router.urls)),
]
