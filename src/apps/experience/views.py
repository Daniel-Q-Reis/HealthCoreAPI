"""
API Views for the Patient Experience bounded context.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from . import ai_service
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
    permission_classes = [IsAuthenticated]
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


@extend_schema(
    tags=["Experience AI"],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "feedback_text": {
                    "type": "string",
                    "example": "The waiting time was too long but the doctor was excellent",
                },
                "rating": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 5,
                    "example": 3,
                    "description": "Patient rating (1-5 stars) for context",
                },
            },
            "required": ["feedback_text"],
        }
    },
    responses={200: {"description": "Feedback analysis response"}},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def analyze_feedback_view(request: Request) -> Response:
    """
    AI-powered patient feedback analyzer.

    Analyzes patient feedback in the context of their rating,
    identifying sentiment, key themes, actionable insights,
    and priority levels to help administrators improve services.

    The AI does NOT suggest ratings - it uses the patient's rating
    as context to better understand their feedback.
    """
    feedback_text = request.data.get("feedback_text")
    rating = request.data.get("rating")

    if not feedback_text:
        return Response(
            {"error": "feedback_text is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate rating if provided
    if rating is not None:
        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                return Response(
                    {"error": "rating must be between 1 and 5"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except (TypeError, ValueError):
            return Response(
                {"error": "rating must be an integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    result = ai_service.analyze_patient_feedback(
        feedback_text=feedback_text,
        rating=rating,
    )

    if not result.success:
        return Response(
            {"error": result.error_message},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        {
            "original_text": result.original_text,
            "rating": result.rating,
            "analysis": result.analysis,
            "model_used": result.model_used,
        },
        status=status.HTTP_200_OK,
    )
