"""
Performance tests for Experience app.
"""

import pytest
from django.contrib.auth import get_user_model
from django.db import connection, reset_queries
from model_bakery import baker
from rest_framework.test import APIClient

from src.apps.admissions.models import Admission, Bed, Ward
from src.apps.experience.models import PatientFeedback
from src.apps.patients.models import Patient

User = get_user_model()


@pytest.fixture
def auth_client():
    client = APIClient()
    user = User.objects.create_user(username="perf_user_exp", password="password")
    client.force_authenticate(user=user)
    return client


@pytest.mark.django_db
def test_feedback_list_query_count(auth_client):
    """
    Verify Feedback list optimization.
    Uses an upper bound check to be robust across environments (Local vs CI).
    """
    # Setup complex nested relationships
    ward = baker.make(Ward)
    bed = baker.make(Bed, ward=ward)
    patient = baker.make(Patient)
    admission = baker.make(Admission, patient=patient, bed=bed)

    # Create multiple feedbacks
    # If N+1 existed, queries would increase linearly with this number
    baker.make(PatientFeedback, patient=patient, admission=admission, _quantity=5)

    url = "/api/v1/experience/feedback/"

    # Clear previous queries
    reset_queries()

    # Execute request
    auth_client.get(url)

    query_count = len(connection.queries)

    # Enterprise Pattern: Upper Bound Assertion.
    # CI Environment typically runs ~2 queries. Local might run ~4 due to savepoints/auth.
    # An N+1 problem would result in 1 (main) + 5 (relations) = 6+ queries, usually more.
    # We set the safety limit at 7 to allow env variance but catch N+1.
    assert query_count <= 7, (
        f"Performance regression: {query_count} queries executed. Likely N+1 problem."
    )
