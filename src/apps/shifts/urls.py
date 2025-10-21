"""
URL configuration for the Shifts & Availability app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ShiftViewSet

app_name = "shifts"

router = DefaultRouter()
router.register(r"shifts", ShiftViewSet, basename="shift")

urlpatterns = [
    path("", include(router.urls)),
]
