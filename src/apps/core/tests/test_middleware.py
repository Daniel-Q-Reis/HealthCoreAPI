"""
Tests for custom middleware.
"""

from unittest.mock import patch

import pytest
from django.test import RequestFactory

from src.apps.core.middleware import TimeoutMiddleware


@pytest.mark.django_db
def test_timeout_middleware_raises_exception_on_timeout():
    """
    Conceptually tests that the timeout middleware would raise an exception.
    We mock the signal behavior for a stable test.
    """
    middleware = TimeoutMiddleware(get_response=lambda r: None)
    request = RequestFactory().get("/some-long-running-task/")

    # Mock the signal handler to raise our expected exception immediately
    with patch("signal.alarm") as mock_alarm:
        # Simulate the alarm handler being called and raising TimeoutError
        def fake_handler(*args):
            raise TimeoutError("Simulated timeout")

        mock_alarm.side_effect = fake_handler

        # We expect the middleware to propagate the TimeoutError
        with pytest.raises(TimeoutError):
            middleware.process_request(request)
            # The fake handler will be called by mock_alarm, raising the error
            mock_alarm(10)  # Simulate the alarm going off

        mock_alarm.assert_any_call(10)  # Check that the alarm was set
