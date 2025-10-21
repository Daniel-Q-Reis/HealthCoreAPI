"""
URL configuration for the Scheduling app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet

app_name = "scheduling"

router = DefaultRouter()
router.register(r"appointments", AppointmentViewSet, basename="appointment")

urlpatterns = [
    path("", include(router.urls)),
]
