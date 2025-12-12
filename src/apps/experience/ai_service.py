"""
Experience AI Service - Feedback Analyzer.
Provides AI-powered patient feedback analysis with rating context.
"""

import logging
from dataclasses import dataclass
from typing import Optional

from src.apps.core.ai_client import (
    AIServiceUnavailableError,
    get_ai_client,
)

logger = logging.getLogger(__name__)


def get_feedback_analysis_prompt(rating: Optional[int] = None) -> str:
    """Generate the analysis prompt with optional rating context."""
    base_prompt = """You are an expert healthcare quality analyst specializing in patient experience.

Analyze the provided patient feedback and return a structured analysis including:

1. **Sentiment**: Overall sentiment (POSITIVE, NEGATIVE, NEUTRAL, MIXED)
2. **Key Themes**: Main topics mentioned (e.g., Wait Time, Staff Attitude, Cleanliness, Communication)
3. **Actionable Insights**: Specific improvements that could be made
4. **Priority Level**: LOW, MEDIUM, HIGH, CRITICAL (based on severity of issues)
5. **Department Relevance**: Which departments should be notified
6. **Summary**: A brief 2-3 sentence summary for administrators

Format your response as a clear, structured report that hospital administrators can act on.
Be objective and focus on constructive feedback."""

    if rating is not None:
        rating_context = f"""

IMPORTANT CONTEXT: The patient gave a rating of {rating}/5 stars.
Analyze the feedback text in the context of this rating:
- If rating is low (1-2) but text seems positive, flag potential issues not mentioned in text
- If rating is high (4-5) but text has complaints, identify what made the overall experience positive
- Consider the rating as the patient's true sentiment when text is ambiguous
- DO NOT suggest changing the rating - it's the patient's final decision"""
        return base_prompt + rating_context

    return base_prompt


@dataclass
class FeedbackAnalysisResponse:
    """Response from feedback analysis."""

    original_text: str
    rating: Optional[int]
    analysis: str
    model_used: str
    success: bool
    error_message: Optional[str] = None


def analyze_patient_feedback(
    feedback_text: str,
    rating: Optional[int] = None,
) -> FeedbackAnalysisResponse:
    """
    Analyze patient feedback using AI with optional rating context.

    Args:
        feedback_text: The patient feedback text to analyze
        rating: Optional patient rating (1-5 stars) for context

    Returns:
        FeedbackAnalysisResponse with analysis or error
    """
    if not feedback_text or not feedback_text.strip():
        return FeedbackAnalysisResponse(
            original_text=feedback_text,
            rating=rating,
            analysis="",
            model_used="",
            success=False,
            error_message="Feedback text cannot be empty.",
        )

    # Validate rating if provided
    if rating is not None and (rating < 1 or rating > 5):
        return FeedbackAnalysisResponse(
            original_text=feedback_text,
            rating=rating,
            analysis="",
            model_used="",
            success=False,
            error_message="Rating must be between 1 and 5.",
        )

    try:
        ai_client = get_ai_client()

        if not ai_client.is_configured():
            return FeedbackAnalysisResponse(
                original_text=feedback_text,
                rating=rating,
                analysis="",
                model_used="",
                success=False,
                error_message="AI service is not configured. Please set GEMINI_API_KEY.",
            )

        # Build prompt with rating context
        prompt = get_feedback_analysis_prompt(rating)

        # Analyze feedback
        analysis = ai_client.analyze_text(
            text=feedback_text,
            system_prompt=prompt,
            temperature=0.3,
        )

        logger.info(f"Patient feedback analyzed successfully (rating: {rating})")

        return FeedbackAnalysisResponse(
            original_text=feedback_text,
            rating=rating,
            analysis=analysis,
            model_used=str(ai_client.model_name),
            success=True,
        )

    except AIServiceUnavailableError as e:
        logger.error(f"AI service unavailable: {e}")
        return FeedbackAnalysisResponse(
            original_text=feedback_text,
            rating=rating,
            analysis="",
            model_used="",
            success=False,
            error_message=str(e),
        )
    except Exception as e:
        logger.exception(f"Unexpected error in feedback analysis: {e}")
        return FeedbackAnalysisResponse(
            original_text=feedback_text,
            rating=rating,
            analysis="",
            model_used="",
            success=False,
            error_message=f"Unexpected error: {str(e)}",
        )
