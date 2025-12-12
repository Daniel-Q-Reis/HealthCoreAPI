"""
Pharmacy AI Service - Drug Information Assistant.
Provides AI-powered drug information lookups.
"""

import logging
from dataclasses import dataclass
from typing import Optional

from src.apps.core.ai_client import (
    AIServiceUnavailableError,
    get_ai_client,
)

logger = logging.getLogger(__name__)


DRUG_INFO_SYSTEM_PROMPT = """You are a professional pharmacist assistant providing accurate drug information.

When given a medication name, provide the following information in a structured format:
- Generic Name
- Brand Names (common ones)
- Drug Class
- Primary Uses/Indications
- Common Dosages
- Important Side Effects
- Major Drug Interactions
- Special Precautions
- Contraindications

Important guidelines:
1. Be accurate and evidence-based
2. Always recommend consulting a healthcare provider
3. Include a disclaimer about professional medical advice
4. If you don't know something, say so clearly
5. Format the response clearly with headers

If any patient context is provided, tailor your response appropriately (e.g., elderly patients, pregnancy, renal impairment)."""


@dataclass
class DrugInfoResponse:
    """Response from drug information query."""

    medication_name: str
    information: str
    model_used: str
    success: bool
    error_message: Optional[str] = None


def get_drug_information(
    medication_name: str,
    patient_context: str = "",
) -> DrugInfoResponse:
    """
    Get AI-powered drug information.

    Args:
        medication_name: Name of the medication to look up
        patient_context: Optional patient context for tailored response

    Returns:
        DrugInfoResponse with drug information or error
    """
    try:
        ai_client = get_ai_client()

        if not ai_client.is_configured():
            return DrugInfoResponse(
                medication_name=medication_name,
                information="",
                model_used="",
                success=False,
                error_message="AI service is not configured. Please set OPENAI_API_KEY.",
            )

        # Build the query
        query = f"Provide comprehensive drug information for: {medication_name}"
        if patient_context:
            query += f"\n\nPatient context: {patient_context}"

        # Get response from AI
        response = ai_client.generate_response(
            user_query=query,
            system_prompt=DRUG_INFO_SYSTEM_PROMPT,
        )

        logger.info(f"Drug info generated for: {medication_name}")

        return DrugInfoResponse(
            medication_name=medication_name,
            information=response,
            model_used=str(ai_client.model_name),
            success=True,
        )

    except AIServiceUnavailableError as e:
        logger.error(f"AI service unavailable: {e}")
        return DrugInfoResponse(
            medication_name=medication_name,
            information="",
            model_used="",
            success=False,
            error_message=str(e),
        )
    except Exception as e:
        logger.exception(f"Unexpected error in drug info lookup: {e}")
        return DrugInfoResponse(
            medication_name=medication_name,
            information="",
            model_used="",
            success=False,
            error_message=f"Unexpected error: {str(e)}",
        )
