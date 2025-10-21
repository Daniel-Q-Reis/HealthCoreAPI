"""
API Views for the Scheduling bounded context.
"""

from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import services
from .models import Appointment
from .serializers import AppointmentSerializer


@extend_schema(tags=["Scheduling"])
class AppointmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing Appointments.
    """

    queryset = Appointment.objects.select_related(
        "patient", "practitioner", "slot"
    ).filter(is_active=True)
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        try:
            patient = validated_data["patient"]
            slot = validated_data["slot"]

            appointment = services.book_appointment(patient=patient, slot_id=slot.id)
            response_serializer = self.get_serializer(appointment)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except services.SlotUnavailableError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        """
        Overrides the default creation to use the service layer.
        """
        services.register_new_appointment(**serializer.validated_data)

    def perform_destroy(self, instance):
        """
        Overrides the default destroy to perform a soft delete.
        """
        instance.soft_delete()
