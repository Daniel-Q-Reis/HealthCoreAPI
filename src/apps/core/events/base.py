"""
Base Event Class

Foundation for all domain events in the system.
"""

import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class BaseEvent:
    """
    Base class for all domain events

    Attributes:
        event_id: Unique event identifier
        event_type: Event type (e.g., 'patient.created')
        timestamp: Event timestamp in UTC
        data: Event payload
        metadata: Additional metadata
    """

    event_type: str
    data: dict[str, Any]
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        """Set default metadata"""
        if "source" not in self.metadata:
            self.metadata["source"] = "healthcore-api"
        if "version" not in self.metadata:
            self.metadata["version"] = "1.0"

    def to_dict(self) -> dict[str, Any]:
        """Convert event to dictionary"""
        return asdict(self)

    def to_json_serializable(self) -> dict[str, Any]:
        """
        Convert event to JSON-serializable dictionary

        Returns:
            Dictionary ready for JSON serialization
        """
        return self.to_dict()
