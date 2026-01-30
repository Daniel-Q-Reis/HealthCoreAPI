"""
Tests for AI integration.
Uses mocked AI responses to avoid real API calls.
Provider-agnostic: works with both Gemini and OpenAI.
"""

from unittest.mock import MagicMock, patch

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.test import APIClient

User = get_user_model()

# Test model name (provider-agnostic)
TEST_MODEL_NAME = "test-model"


# --- Fixtures ---


@pytest.fixture
def api_client() -> APIClient:
    """Provides standard DRF API client."""
    return APIClient()


@pytest.fixture
def doctor_user():
    """Create a doctor user for tests."""
    user = User.objects.create_user(username="ai_test_doctor", password="testpass")
    doctor_group, _ = Group.objects.get_or_create(name="Doctors")
    user.groups.add(doctor_group)
    return user


@pytest.fixture
def authenticated_client(api_client: APIClient, doctor_user):
    """Authenticated client with doctor role."""
    api_client.force_authenticate(user=doctor_user)
    return api_client


# --- AIClient Tests ---


@pytest.mark.django_db
class TestAIClient:
    """Tests for the core AIClient (provider-agnostic)."""

    def test_ai_client_configuration(self, settings):
        """Test client reports configured when correct API keys are present."""
        from src.apps.core.ai_client import (
            AzureClient,
            GeminiClient,
            OpenAIClient,
            get_ai_client,
        )

        get_ai_client.cache_clear()
        # Determine the active client type first
        initial_client = get_ai_client()
        get_ai_client.cache_clear()

        if isinstance(initial_client, AzureClient):
            settings.AZURE_OPENAI_API_KEY = "test-azure-key"
            settings.AZURE_OPENAI_ENDPOINT = "https://test.openai.azure.com"
            client = get_ai_client()
            assert client.is_configured() is True

            get_ai_client.cache_clear()
            settings.AZURE_OPENAI_API_KEY = None
            client = get_ai_client()
            assert client.is_configured() is False

        elif isinstance(initial_client, GeminiClient):
            settings.GEMINI_API_KEY = "test-gemini-key"
            client = get_ai_client()
            assert client.is_configured() is True

            get_ai_client.cache_clear()
            settings.GEMINI_API_KEY = None
            client = get_ai_client()
            assert client.is_configured() is False

        elif isinstance(initial_client, OpenAIClient):
            settings.OPENAI_API_KEY = "test-openai-key"
            client = get_ai_client()
            assert client.is_configured() is True

            get_ai_client.cache_clear()
            settings.OPENAI_API_KEY = None
            client = get_ai_client()
            assert client.is_configured() is False


# --- Pharmacy AI Tests ---


@pytest.mark.django_db
class TestPharmacyAIDrugInfo:
    """Tests for Pharmacy AI Drug Info endpoint."""

    def test_drug_info_requires_authentication(self, api_client):
        """Test unauthenticated requests are rejected."""
        response = api_client.post(
            "/api/v1/pharmacy/ai/drug-info/",
            {"medication_name": "Metformin"},
            format="json",
        )
        assert response.status_code == 401

    def test_drug_info_missing_medication_name(self, authenticated_client):
        """Test request without medication_name returns 400."""
        response = authenticated_client.post(
            "/api/v1/pharmacy/ai/drug-info/",
            {},
            format="json",
        )
        assert response.status_code == 400
        assert "medication_name" in response.data.get("error", "")

    @patch("src.apps.pharmacy.ai_service.get_ai_client")
    def test_drug_info_success(self, mock_get_client, authenticated_client):
        """Test successful drug info request."""
        mock_client = MagicMock()
        mock_client.is_configured.return_value = True
        mock_client.model_name = TEST_MODEL_NAME
        mock_client.generate_response.return_value = (
            "## Metformin Information\n\n"
            "**Generic Name:** Metformin\n"
            "**Drug Class:** Biguanide"
        )
        mock_client.generate_lifestyle_advice.return_value = "Lifestyle advice"
        mock_get_client.return_value = mock_client

        response = authenticated_client.post(
            "/api/v1/pharmacy/ai/drug-info/",
            {"medication_name": "Metformin"},
            format="json",
        )

        assert response.status_code == 200
        assert response.data["medication_name"] == "Metformin"
        assert "Metformin" in response.data["information"]
        assert response.data["model_used"] == TEST_MODEL_NAME

    @patch("src.apps.pharmacy.ai_service.get_ai_client")
    def test_drug_info_with_patient_context(
        self, mock_get_client, authenticated_client
    ):
        """Test drug info with patient context."""
        mock_client = MagicMock()
        mock_client.is_configured.return_value = True
        mock_client.model_name = TEST_MODEL_NAME
        mock_client.generate_response.return_value = "Drug info with context"
        mock_get_client.return_value = mock_client

        response = authenticated_client.post(
            "/api/v1/pharmacy/ai/drug-info/",
            {
                "medication_name": "Metformin",
                "patient_context": "65-year-old with renal impairment",
            },
            format="json",
        )

        assert response.status_code == 200


# --- Experience AI Tests ---


@pytest.mark.django_db
class TestExperienceAIFeedbackAnalysis:
    """Tests for Experience AI Feedback Analysis endpoint."""

    @pytest.fixture
    def regular_user(self):
        """Create a regular authenticated user."""
        return User.objects.create_user(username="ai_test_user", password="testpass")

    @pytest.fixture
    def user_client(self, api_client, regular_user):
        """Client with regular user auth."""
        api_client.force_authenticate(user=regular_user)
        return api_client

    def test_feedback_analysis_requires_auth(self, api_client):
        """Test unauthenticated requests are rejected."""
        response = api_client.post(
            "/api/v1/experience/ai/analyze/",
            {"feedback_text": "Great service!"},
            format="json",
        )
        assert response.status_code == 401

    def test_feedback_analysis_missing_text(self, user_client):
        """Test request without feedback_text returns 400."""
        response = user_client.post(
            "/api/v1/experience/ai/analyze/",
            {},
            format="json",
        )
        assert response.status_code == 400

    @patch("src.apps.experience.ai_service.get_ai_client")
    def test_feedback_analysis_success(self, mock_get_client, user_client):
        """Test successful feedback analysis."""
        mock_client = MagicMock()
        mock_client.is_configured.return_value = True
        mock_client.model_name = TEST_MODEL_NAME
        mock_client.analyze_text.return_value = (
            "**Sentiment:** POSITIVE\n"
            "**Score:** 8/10\n"
            "**Key Themes:** Staff Attitude, Cleanliness"
        )
        mock_get_client.return_value = mock_client

        response = user_client.post(
            "/api/v1/experience/ai/analyze/",
            {"feedback_text": "The staff was very friendly and the facility was clean"},
            format="json",
        )

        assert response.status_code == 200
        assert "analysis" in response.data
        assert "POSITIVE" in response.data["analysis"]
        assert response.data["model_used"] == TEST_MODEL_NAME

    @patch("src.apps.experience.ai_service.get_ai_client")
    def test_feedback_analysis_with_rating(self, mock_get_client, user_client):
        """Test feedback analysis with patient rating context."""
        mock_client = MagicMock()
        mock_client.is_configured.return_value = True
        mock_client.model_name = TEST_MODEL_NAME
        mock_client.analyze_text.return_value = (
            "**Sentiment:** MIXED\n**Rating Context:** Patient gave 2/5 stars"
        )
        mock_get_client.return_value = mock_client

        response = user_client.post(
            "/api/v1/experience/ai/analyze/",
            {
                "feedback_text": "The doctor was nice but I waited 2 hours",
                "rating": 2,
            },
            format="json",
        )

        assert response.status_code == 200
        assert response.data["rating"] == 2
        assert response.data["model_used"] == TEST_MODEL_NAME

    def test_feedback_analysis_invalid_rating(self, user_client):
        """Test feedback with invalid rating returns 400."""
        response = user_client.post(
            "/api/v1/experience/ai/analyze/",
            {"feedback_text": "Great service!", "rating": 10},
            format="json",
        )
        assert response.status_code == 400
        assert "rating" in response.data.get("error", "")

    @patch("src.apps.experience.ai_service.get_ai_client")
    def test_feedback_analysis_negative_sentiment(self, mock_get_client, user_client):
        """Test feedback with negative sentiment."""
        mock_client = MagicMock()
        mock_client.is_configured.return_value = True
        mock_client.model_name = TEST_MODEL_NAME
        mock_client.analyze_text.return_value = (
            "**Sentiment:** NEGATIVE\n**Priority:** HIGH\n**Issue:** Long wait times"
        )
        mock_get_client.return_value = mock_client

        response = user_client.post(
            "/api/v1/experience/ai/analyze/",
            {"feedback_text": "Waited 3 hours to be seen, completely unacceptable"},
            format="json",
        )

        assert response.status_code == 200
        assert "NEGATIVE" in response.data["analysis"]
