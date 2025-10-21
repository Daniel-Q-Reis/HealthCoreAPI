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

    queryset = PatientFeedback.objects.all()
    serializer_class = PatientFeedbackSerializer
    permission_classes = [IsAuthenticated]  # Or AllowAny depending on requirements
    http_method_names = ["get", "post", "head", "options"]


@extend_schema(tags=["Patient Experience"])
class PatientComplaintViewSet(viewsets.ModelViewSet):
    """
    API endpoint for submitting and viewing patient complaints.
    """

    queryset = PatientComplaint.objects.all()
    serializer_class = PatientComplaintSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]
