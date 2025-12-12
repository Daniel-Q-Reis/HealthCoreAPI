from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DispensationViewSet, MedicationViewSet, drug_info_view

app_name = "pharmacy"
router = DefaultRouter()
router.register(r"medications", MedicationViewSet, basename="medication")
router.register(r"dispensations", DispensationViewSet, basename="dispensation")

urlpatterns = [
    path("", include(router.urls)),
    path("ai/drug-info/", drug_info_view, name="ai-drug-info"),
]
