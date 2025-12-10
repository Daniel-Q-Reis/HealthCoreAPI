"""URL configuration for Clinical Orders API."""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ClinicalOrderViewSet

app_name = "orders"

router = DefaultRouter()
router.register(r"orders", ClinicalOrderViewSet, basename="order")

urlpatterns = [
    path("", include(router.urls)),
]
