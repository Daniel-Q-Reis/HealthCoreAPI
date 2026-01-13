import datetime
from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from src.apps.patients.models import Patient

User = get_user_model()


class LifestyleAITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password")
        self.patient = Patient.objects.create(
            user=self.user, birth_date=datetime.date(1990, 1, 1), sex="Male"
        )
        self.client.force_authenticate(user=self.user)

    def test_analyze_diagnosis_success(self):
        """Test the ad-hoc analysis endpoint."""
        with patch("src.apps.results.views.get_ai_client") as mock_get:
            mock_client = mock_get.return_value
            mock_client.is_configured.return_value = True
            mock_client.generate_lifestyle_advice.return_value = "Mock Advice for Flu"
            mock_client.model_name = "MockModel"

            response = self.client.post(
                "/api/v1/results/reports/analyze-diagnosis/",
                {"diagnosis": "Flu"},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data["advice"], "Mock Advice for Flu")
            self.assertEqual(response.data["model_used"], "MockModel")

    def test_analyze_diagnosis_no_input(self):
        """Test validation for empty input."""
        response = self.client.post(
            "/api/v1/results/reports/analyze-diagnosis/",
            {"diagnosis": ""},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch("src.apps.results.views.get_ai_client")
    def test_analyze_diagnosis_unconfigured(self, mock_get):
        """Test handling of unconfigured AI client."""
        mock_client = mock_get.return_value
        mock_client.is_configured.return_value = False

        response = self.client.post(
            "/api/v1/results/reports/analyze-diagnosis/",
            {"diagnosis": "Flu"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch("src.apps.results.views.get_ai_client")
    def test_analyze_diagnosis_service_error(self, mock_get):
        """Test handling of AI service errors."""
        from src.apps.core.ai_client import AIServiceUnavailableError

        mock_client = mock_get.return_value
        mock_client.is_configured.return_value = True
        mock_client.generate_lifestyle_advice.side_effect = AIServiceUnavailableError(
            "API Error"
        )

        response = self.client.post(
            "/api/v1/results/reports/analyze-diagnosis/",
            {"diagnosis": "Flu"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
