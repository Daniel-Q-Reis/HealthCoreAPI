# 🤖 AI Integration Guide

HealthCoreAPI integrates AI-powered features for clinical decision support.

## Supported Providers

| Provider | Status | Tier | Cost |
|----------|--------|------|------|
| **Google Gemini** | ✅ Default | Free | 15 RPM, 1M tokens/month |
| **OpenAI** | 📦 Available | Paid | ~$0.002/1K tokens |

## Quick Start (Gemini - Free)

1. Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to your `.env`:
```bash
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=models/gemini-2.5-flash
```
3. Restart your server

## Features

### 1. Pharmacy - Drug Information Assistant
```bash
POST /api/v1/pharmacy/ai/drug-info/
{
    "medication_name": "Metformin",
    "patient_context": "Type 2 diabetes patient, 65 years old"
}
```
**Permission:** `IsMedicalStaff` (Doctors/Nurses only)

### 2. Experience - Feedback Analyzer with Rating Context
```bash
POST /api/v1/experience/ai/analyze/
{
    "feedback_text": "The waiting time was too long but the doctor was excellent",
    "rating": 3
}
```
**Permission:** `IsAuthenticated`

The AI analyzes feedback **in context of the patient's rating**:
- Does NOT suggest or change the rating
- Uses rating to understand overall sentiment
- Flags contradictions (e.g., good text but low rating)

## Switching Providers

### To use OpenAI instead of Gemini:

1. Edit `src/apps/core/ai_client.py`
2. Change line `AIClient = GeminiClient` to `AIClient = OpenAIClient`
3. Add to `.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

## Architecture

```
AIClient (toggleable)
├── GeminiClient (default - free)
│   └── models/gemini-2.5-flash
└── OpenAIClient (alternative - paid)
    └── gpt-3.5-turbo / gpt-4o
```

## Testing

All tests use **mocked responses** - no real API calls in CI/CD:
```bash
pytest src/apps/core/tests/test_ai_integration.py -v
```

## Error Handling

- `503 Service Unavailable`: AI provider down
- `400 Bad Request`: Invalid input (rating must be 1-5)
