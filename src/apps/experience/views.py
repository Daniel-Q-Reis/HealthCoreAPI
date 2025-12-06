"""
API Views for the Patient Experience bounded context.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import PatientComplaint, PatientFeedback
from .serializers import PatientComplaintSerializer, PatientFeedbackSerializer


@extend_schema(tags=["Patient Experience"])
class PatientFeedbackViewSet(viewsets.ModelViewSet):
    """
    API endpoint for submitting and viewing patient feedback.
    """

    # OPTIMIZATION: Added select_related for nested relationships.
    queryset = PatientFeedback.objects.select_related(
        "patient", "admission", "admission__bed", "admission__bed__ward"
    ).all()
    serializer_class = PatientFeedbackSerializer
    permission_classes = [IsAuthenticated]  # Or AllowAny depending on requirements
    http_method_names = ["get", "post", "head", "options"]


@extend_schema(tags=["Patient Experience"])
class PatientComplaintViewSet(viewsets.ModelViewSet):
    """
    API endpoint for submitting and viewing patient complaints.
    """

    # OPTIMIZATION: Added select_related for nested relationships.
    queryset = PatientComplaint.objects.select_related(
        "patient", "admission", "admission__bed", "admission__bed__ward"
    ).all()
    serializer_class = PatientComplaintSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]
