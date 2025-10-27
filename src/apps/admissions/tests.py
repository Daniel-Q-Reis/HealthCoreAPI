"""
Comprehensive test suite for the Admissions & Beds bounded context.
"""

import time
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from faker import Faker
from pybreaker import CircuitBreakerError
from rest_framework.test import APIClient

from src.apps.patients.models import Patient

from . import services
from .models import Bed, Ward

fake = Faker()
User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_user():
    return User.objects.create_user(username="testuser", password="password123")


@pytest.fixture
def authenticated_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client


@pytest.fixture
def patient():
    return Patient.objects.create(
        mrn=fake.unique.numerify(text="MRN-#######"),
        given_name=fake.first_name(),
        family_name=fake.last_name(),
        birth_date=fake.date_of_birth(minimum_age=30, maximum_age=70),
        sex="male",
    )


@pytest.fixture
def ward():
    return Ward.objects.create(name="General Ward", capacity=10)


@pytest.fixture
def available_bed(ward):
    return Bed.objects.create(ward=ward, bed_number="101-A")


@pytest.fixture
def bed(ward):
    return Bed.objects.create(ward=ward, bed_number="102-B")


@pytest.mark.django_db
class TestAdmissionsService:
    def test_admit_patient_success(self, patient, available_bed):
        admission = services.admit_patient_to_ward(
            patient_id=patient.id, ward_id=available_bed.ward.id
        )
        available_bed.refresh_from_db()

        assert admission is not None
        assert admission.patient == patient
        assert admission.bed == available_bed
        assert available_bed.is_occupied is True

    def test_admit_patient_no_available_beds(self, patient, ward):
        # No beds created in this ward
        with pytest.raises(services.BedUnavailableError):
            services.admit_patient_to_ward(patient_id=patient.id, ward_id=ward.id)


@pytest.mark.django_db
class TestAdmissionsAPI:
    def test_create_admission_api_success(
        self, authenticated_client, patient, available_bed
    ):
        url = "/api/v1/admissions/admissions/"
        data = {"patient_id": str(patient.id), "ward_id": str(available_bed.ward.id)}
        response = authenticated_client.post(url, data=data, format="json")

        available_bed.refresh_from_db()

        assert response.status_code == 201
        assert response.data["patient"] == patient.id
        assert response.data["bed"]["id"] == available_bed.id
        assert available_bed.is_occupied is True

    def test_create_admission_unauthenticated(self, api_client, patient, ward):
        url = "/api/v1/admissions/admissions/"
        data = {"patient_id": str(patient.id), "ward_id": str(ward.id)}
        response = api_client.post(url, data=data, format="json")
        # Can be either 401 (unauthorized) or 403 (forbidden) depending on authentication settings
        assert response.status_code in [401, 403]

    def test_list_wards_authenticated(self, authenticated_client, ward):
        url = "/api/v1/admissions/wards/"
        response = authenticated_client.get(url)
        assert response.status_code == 200
        assert len(response.data["results"]) == 1


@pytest.mark.django_db
class TestResiliencePatterns:
    def setup_method(self):
        """Reset circuit breaker state before each test"""
        services.bed_assignment_breaker.close()
        # Reset failure count
        services.bed_assignment_breaker._failure_count = 0
        services.bed_assignment_breaker._last_failure_time = None

    def test_circuit_breaker_opens_after_failures(self, patient, ward):
        """
        Verify that the circuit breaker opens after repeated failures.
        """
        # Simulate the bed assignment process failing by patching the repository
        with patch(
            "src.apps.admissions.repositories.find_available_bed_in_ward",
            side_effect=services.BedUnavailableError("Simulated DB failure"),
        ):
            # First 2 calls should fail normally and increment the breaker's fail counter
            for i in range(2):
                with pytest.raises(services.BedUnavailableError):
                    services.admit_patient_to_ward(
                        patient_id=patient.id, ward_id=ward.id
                    )
                print(
                    f"Failure {i + 1}: Circuit breaker state = {services.bed_assignment_breaker.current_state}"
                )

            # The 3rd call should fail with CircuitBreakerError as the breaker opens after this failure
            with pytest.raises(CircuitBreakerError):
                services.admit_patient_to_ward(patient_id=patient.id, ward_id=ward.id)

        # The breaker should now be open
        assert services.bed_assignment_breaker.current_state == "open"

    def test_circuit_breaker_recovery(self, patient, ward, bed):
        """
        Verify that the circuit breaker can recover after the reset timeout.
        """
        # First, force the breaker to open by causing failures
        with patch(
            "src.apps.admissions.repositories.find_available_bed_in_ward",
            side_effect=services.BedUnavailableError("Failures to open breaker"),
        ):
            for _ in range(2):  # Only 2 failures, the 3rd will open the breaker
                with pytest.raises(services.BedUnavailableError):
                    services.admit_patient_to_ward(
                        patient_id=patient.id, ward_id=ward.id
                    )

            # The 3rd call should trigger the breaker to open
            with pytest.raises(CircuitBreakerError):
                services.admit_patient_to_ward(patient_id=patient.id, ward_id=ward.id)

        # Verify breaker is open
        assert services.bed_assignment_breaker.current_state == "open"

        # Configure a very short reset timeout for testing
        original_timeout = services.bed_assignment_breaker._reset_timeout
        services.bed_assignment_breaker._reset_timeout = 1  # 1 second

        try:
            # Wait for reset timeout
            time.sleep(1.1)

            # Now mock successful bed assignment
            with (
                patch(
                    "src.apps.admissions.repositories.find_available_bed_in_ward",
                    return_value=bed,
                ),
                patch("src.apps.admissions.repositories.occupy_bed"),
                patch(
                    "src.apps.admissions.repositories.create_admission"
                ) as mock_create,
            ):
                # This call should succeed and move breaker to half-open, then closed
                services.admit_patient_to_ward(patient_id=patient.id, ward_id=ward.id)
                mock_create.assert_called_once()

                # After successful call, breaker should be closed
                assert services.bed_assignment_breaker.current_state == "closed"

        finally:
            # Restore original timeout
            services.bed_assignment_breaker._reset_timeout = original_timeout
