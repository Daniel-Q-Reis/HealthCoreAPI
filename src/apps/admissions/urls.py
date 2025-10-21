"""
URL configuration for the Admissions & Beds app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdmissionViewSet, BedViewSet, WardViewSet

app_name = "admissions"

router = DefaultRouter()
router.register(r"admissions", AdmissionViewSet, basename="admission")
router.register(r"beds", BedViewSet, basename="bed")
router.register(r"wards", WardViewSet, basename="ward")

urlpatterns = [
    path("", include(router.urls)),
]
