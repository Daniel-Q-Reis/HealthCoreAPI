# ADR-0012: AI Integration Strategy

**Status:** Accepted
**Date:** 2025-12-10

## Context

HealthCoreAPI requires intelligent features to enhance clinical decision support and operational efficiency. We need to integrate AI capabilities for:
- Drug information assistance (Pharmacy)
- Patient feedback analysis (Experience)
- Future: Diagnostic insights (Results)

## Decision

We will integrate **OpenAI API** using the official Python SDK with a unified client abstraction.

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    AIClient                          │
│         (src/apps/core/ai_client.py)                │
│  - Unified interface for all AI operations           │
│  - Handles authentication, retries, rate limiting    │
│  - Model configuration from environment              │
└──────────────────────┬──────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Pharmacy AI  │ │ Experience   │ │ Results AI   │
│ Drug Info    │ │ Feedback     │ │ (Future)     │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Key Decisions

1. **OpenAI SDK**: Using `openai>=1.50.0` for latest API compatibility
2. **Model**: Default `gpt-3.5-turbo` (cost-effective, easily upgradeable to GPT-4)
3. **Abstraction**: Central `AIClient` class for all AI operations
4. **Testing**: All AI calls mocked in tests (no real API calls in CI/CD)
5. **Graceful Degradation**: AI features fail gracefully if service unavailable

### Configuration

```python
# Environment Variables
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo  # Configurable
```

## Consequences

**Positive:**
- Adds intelligent features that differentiate the platform
- Centralized AI client simplifies maintenance
- Easy model upgrades via configuration
- Mocked tests ensure CI/CD reliability

**Negative:**
- External API dependency (mitigated by graceful degradation)
- API costs for production usage
- Rate limiting considerations for high traffic

## API Endpoints

| Endpoint | Description | Permission |
|----------|-------------|------------|
| `POST /api/v1/pharmacy/ai/drug-info/` | Drug information lookup | IsMedicalStaff |
| `POST /api/v1/experience/ai/analyze/` | Feedback sentiment analysis | IsAuthenticated |

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Python SDK](https://github.com/openai/openai-python)
