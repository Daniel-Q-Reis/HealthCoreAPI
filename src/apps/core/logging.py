"""Logging utilities for correlation ID propagation."""

import contextvars
import logging

# Context variable to store correlation ID for the current request
correlation_id_context: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "correlation_id", default=None
)


class CorrelationIDFilter(logging.Filter):
    """Logging filter that injects correlation ID into all log records.

    This filter retrieves the correlation ID from the context variable
    and adds it to every log record, enabling request tracing across
    all application logs. The correlation_id will be automatically
    included in JSON formatters and can be referenced in verbose formatters.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        """Add correlation ID to log record if available."""
        correlation_id = correlation_id_context.get(None)
        # Add correlation_id as an attribute to the log record
        # This will be automatically included in JSON formatters
        record.correlation_id = correlation_id if correlation_id else ""
        return True
