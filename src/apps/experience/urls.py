"""
URL configuration for the Patient Experience app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    PatientComplaintViewSet,
    PatientFeedbackViewSet,
    analyze_feedback_view,
)

app_name = "experience"

router = DefaultRouter()
router.register(r"feedback", PatientFeedbackViewSet, basename="feedback")
router.register(r"complaints", PatientComplaintViewSet, basename="complaint")

urlpatterns = [
    path("", include(router.urls)),
    path("ai/analyze/", analyze_feedback_view, name="ai-analyze-feedback"),
]
