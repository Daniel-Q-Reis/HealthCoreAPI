"""
URL configuration for the Practitioners app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PractitionerViewSet

app_name = "practitioners"

router = DefaultRouter()
router.register(r"", PractitionerViewSet, basename="practitioner")

urlpatterns = [
    path("", include(router.urls)),
]
