"""
Unified AI Client for Healthcare API.
Supports multiple AI providers: Google Gemini (default) and OpenAI.

=== HOW TO SWITCH PROVIDERS ===
1. Set the appropriate API key in .env
2. Change the AIClient alias at the bottom of this file:
   - AIClient = GeminiClient   (default - free tier)
   - AIClient = OpenAIClient   (alternative - paid)
"""

import logging
from functools import lru_cache
from typing import Any, Optional

from django.conf import settings

logger = logging.getLogger(__name__)


# =============================================================================
# EXCEPTIONS
# =============================================================================


class AIClientError(Exception):
    """Base exception for AI client errors."""

    pass


class AIConfigurationError(AIClientError):
    """Raised when AI client is not properly configured."""

    pass


class AIServiceUnavailableError(AIClientError):
    """Raised when AI service is unavailable."""

    pass


# =============================================================================
# GOOGLE GEMINI CLIENT (Default - Free Tier Available)
# Free tier: 15 requests/minute, 1M tokens/month
# =============================================================================


class GeminiClient:
    """Client for Google Gemini API operations."""

    def __init__(self) -> None:
        self._model: Any = None
        self._model_name: str = getattr(
            settings, "GEMINI_MODEL", "models/gemini-2.5-flash"
        )
        self._api_key: Optional[str] = getattr(settings, "GEMINI_API_KEY", None)

    @property
    def model(self) -> Any:
        """Lazy initialization of Gemini model."""
        if self._model is None:
            if not self._api_key:
                raise AIConfigurationError(
                    "GEMINI_API_KEY is not configured. "
                    "Get a free key at: https://aistudio.google.com/app/apikey"
                )

            try:
                import google.generativeai as genai

                genai.configure(api_key=self._api_key)
                self._model = genai.GenerativeModel(self._model_name)
                logger.info(f"Gemini client initialized: {self._model_name}")
            except ImportError:
                raise AIConfigurationError(
                    "google-generativeai not installed. Run: pip install google-generativeai"
                ) from None
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
                raise AIServiceUnavailableError(
                    f"Gemini connection failed: {e}"
                ) from None

        return self._model

    @property
    def model_name(self) -> str:
        """Get configured model name."""
        return self._model_name

    def is_configured(self) -> bool:
        """Check if client is properly configured."""
        return bool(self._api_key)

    def generate_content(
        self, prompt: str, system_instruction: str = "", temperature: float = 0.7
    ) -> str:
        """Generate content using Gemini."""
        try:
            full_prompt = (
                f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
            )
            response = self.model.generate_content(
                full_prompt,
                generation_config={
                    "temperature": temperature,
                    "max_output_tokens": 1000,
                },
            )
            return response.text.strip() if response.text else ""
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            raise AIServiceUnavailableError(f"AI service error: {e}") from None

    def analyze_text(
        self, text: str, system_prompt: str, temperature: float = 0.3
    ) -> str:
        """Analyze text with system instruction."""
        return self.generate_content(text, system_prompt, temperature)

    def generate_response(
        self,
        user_query: str,
        context: str = "",
        system_prompt: str = "You are a helpful medical assistant.",
    ) -> str:
        """Generate response to user query."""
        full_query = f"{context}\n\n{user_query}" if context else user_query
        return self.generate_content(full_query, system_prompt)


# =============================================================================
# OPENAI CLIENT (Alternative - Requires Paid Credits)
# To use: change AIClient = GeminiClient to AIClient = OpenAIClient below
# =============================================================================


class OpenAIClient:
    """Client for OpenAI API operations."""

    def __init__(self) -> None:
        self._client: Any = None
        self._model_name: str = getattr(settings, "OPENAI_MODEL", "gpt-3.5-turbo")
        self._api_key: Optional[str] = getattr(settings, "OPENAI_API_KEY", None)

    @property
    def client(self) -> Any:
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            if not self._api_key:
                raise AIConfigurationError(
                    "OPENAI_API_KEY is not configured. "
                    "Get your key at: https://platform.openai.com/api-keys"
                )

            try:
                from openai import OpenAI

                self._client = OpenAI(api_key=self._api_key)
                logger.info(f"OpenAI client initialized: {self._model_name}")
            except ImportError:
                raise AIConfigurationError(
                    "openai not installed. Run: pip install openai"
                ) from None
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI: {e}")
                raise AIServiceUnavailableError(
                    f"OpenAI connection failed: {e}"
                ) from None

        return self._client

    @property
    def model_name(self) -> str:
        """Get configured model name."""
        return self._model_name

    def is_configured(self) -> bool:
        """Check if client is properly configured."""
        return bool(self._api_key)

    def generate_content(
        self, prompt: str, system_instruction: str = "", temperature: float = 0.7
    ) -> str:
        """Generate content using OpenAI."""
        try:
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})

            response = self.client.chat.completions.create(
                model=self._model_name,
                messages=messages,
                temperature=temperature,
                max_tokens=1000,
            )
            content = response.choices[0].message.content
            return content.strip() if content else ""
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            raise AIServiceUnavailableError(f"AI service error: {e}") from None

    def analyze_text(
        self, text: str, system_prompt: str, temperature: float = 0.3
    ) -> str:
        """Analyze text with system instruction."""
        return self.generate_content(text, system_prompt, temperature)

    def generate_response(
        self,
        user_query: str,
        context: str = "",
        system_prompt: str = "You are a helpful medical assistant.",
    ) -> str:
        """Generate response to user query."""
        full_query = f"{context}\n\n{user_query}" if context else user_query
        return self.generate_content(full_query, system_prompt)


# =============================================================================
# PROVIDER SELECTION - Change this line to switch providers
# =============================================================================

# ACTIVE PROVIDER: Google Gemini (Free Tier)
AIClient = GeminiClient

# ALTERNATIVE: OpenAI (Paid) - Uncomment line below and comment line above
# AIClient = OpenAIClient


# =============================================================================
# SINGLETON GETTER
# =============================================================================


@lru_cache(maxsize=1)
def get_ai_client() -> GeminiClient | OpenAIClient:
    """Get singleton AI client instance."""
    return AIClient()
