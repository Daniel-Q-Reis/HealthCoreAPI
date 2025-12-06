"""
Performance tests for Scheduling app.
Verifies that N+1 queries are prevented using Upper Bound Assertion.
"""

import pytest
from django.contrib.auth import get_user_model
from django.db import connection, reset_queries
from model_bakery import baker
from rest_framework import status
from rest_framework.test import APIClient

from src.apps.patients.models import Patient
from src.apps.practitioners.models import Practitioner
from src.apps.scheduling.models import Appointment, Slot

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(api_client):
    user = User.objects.create_user(username="perf_user_sched", password="password")
    # Add user to Nurses group to have proper permissions if required by your setup
    # Using get_or_create to avoid unique constraint errors in reused DBs
    from django.contrib.auth.models import Group

    nurses_group, _ = Group.objects.get_or_create(name="Nurses")
    user.groups.add(nurses_group)
    api_client.force_authenticate(user=user)
    return api_client


@pytest.mark.django_db
class TestSchedulingPerformance:
    def test_appointment_list_query_count(self, auth_client):
        """
        Verify that listing appointments uses a constant number of queries.
        """
        # Create dependencies
        practitioner = baker.make(Practitioner)
        patient = baker.make(Patient)

        # Create a batch of appointments (5 items)
        for _ in range(5):
            slot = baker.make(Slot, practitioner=practitioner)
            baker.make(
                Appointment, patient=patient, practitioner=practitioner, slot=slot
            )

        url = "/api/v1/scheduling/appointments/"

        reset_queries()
        response = auth_client.get(url)
        query_count = len(connection.queries)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 5

        # Enterprise Pattern: Upper Bound Assertion.
        # CI runs ~3 queries. Local ~5.
        # Unoptimized would be 5+ queries easily.
        # Limit set to 8 to be safe against middleware noise but catch linear growth.
        assert query_count <= 8, (
            f"Performance regression: {query_count} queries executed. Likely N+1 problem."
        )

    def test_slot_list_query_count(self, auth_client):
        """
        Verify that listing slots is optimized.
        """
        practitioner = baker.make(Practitioner)
        baker.make(Slot, practitioner=practitioner, _quantity=10)

        url = "/api/v1/scheduling/slots/"

        reset_queries()
        auth_client.get(url)
        query_count = len(connection.queries)

        # Enterprise Pattern: Upper Bound Assertion.
        # CI runs ~3 queries. Local ~5.
        # Unoptimized with 10 items would be significantly higher.
        assert query_count <= 8, (
            f"Performance regression: {query_count} queries executed. Likely N+1 problem."
        )
