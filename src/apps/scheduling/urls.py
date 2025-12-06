"""
URL configuration for the Scheduling app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet, SlotViewSet

app_name = "scheduling"

router = DefaultRouter()
router.register(r"appointments", AppointmentViewSet, basename="appointment")
router.register(r"slots", SlotViewSet, basename="slot")

urlpatterns = [
    path("", include(router.urls)),
]
