"""
Audit Logger - Kafka Integration

Helper functions to publish audit events to the audit-service via Kafka.
"""

import logging
from typing import Any, Optional

from ..kafka.producer import KafkaProducer
from .dto import KafkaAuditEvent

logger = logging.getLogger(__name__)


def log_audit_event(
    actor_id: str,
    action: str,
    target_id: Optional[str] = None,
    resource_type: str = "",
    ip_address: str = "",
    user_agent: str = "",
    details: Optional[dict[str, Any]] = None,
) -> bool:
    """
    Log an audit event via Kafka to the Audit Microservice.

    This function publishes audit events to the 'healthcore.events' Kafka topic,
    which is consumed by the Go audit-service and stored in DynamoDB.

    Args:
        actor_id: ID of the user performing the action (e.g., 'USER-123')
        action: Action performed (e.g., 'PATIENT_VIEW', 'LOGIN', 'DATA_EXPORT')
        target_id: ID of the target resource (defaults to actor_id if not provided)
        resource_type: Type of resource (e.g., 'PATIENT', 'USER', 'REPORT')
        ip_address: Source IP address
        user_agent: Client user agent string
        details: Additional context as a dictionary (will be JSON serialized)

    Returns:
        True if event was published successfully, False otherwise

    Example:
        >>> log_audit_event(
        ...     actor_id='DOC-456',
        ...     action='PATIENT_VIEW',
        ...     target_id='PAT-789',
        ...     resource_type='PATIENT',
        ...     ip_address='192.168.1.100',
        ...     user_agent='Mozilla/5.0...',
        ...     details={'reason': 'Treatment review'}
        ... )
        True
    """
    try:
        # Build event using DTO for type safety
        event = KafkaAuditEvent.create(
            actor_id=actor_id,
            action=action,
            target_id=target_id,
            resource_type=resource_type,
            ip_address=ip_address,
            user_agent=user_agent,
            details_dict=details,
        )

        # Get Kafka producer instance
        producer = KafkaProducer.get_instance()

        # Publish to 'events' topic (will become 'healthcore.events')
        success = producer.publish(
            event_type="events",  # Routes to 'healthcore.events'
            data=event.to_dict(),
            key=target_id or actor_id,  # Partition by target/actor
        )

        if success:
            logger.info(f"✅ Audit event published: {action} by {actor_id}")
        else:
            logger.warning(f"⚠️ Failed to publish audit event: {action}")

        return success

    except Exception as e:
        logger.error(f"❌ Error logging audit event: {e}")
        return False


def log_user_login(
    user_id: str, ip_address: str, user_agent: str, success: bool = True
) -> bool:
    """
    Log a user login attempt.

    Args:
        user_id: ID of the user attempting login
        ip_address: Source IP address
        user_agent: Client user agent
        success: Whether login was successful

    Returns:
        True if event was published successfully
    """
    action = "LOGIN_SUCCESS" if success else "LOGIN_FAILURE"
    return log_audit_event(
        actor_id=user_id,
        action=action,
        target_id=user_id,
        resource_type="USER",
        ip_address=ip_address,
        user_agent=user_agent,
        details={"success": success},
    )


def log_resource_access(
    actor_id: str,
    resource_type: str,
    resource_id: str,
    action: str,
    ip_address: str,
    user_agent: str,
    details: Optional[dict[str, Any]] = None,
) -> bool:
    """
    Log access to a protected resource.

    Args:
        actor_id: ID of the user accessing the resource
        resource_type: Type of resource (e.g., 'PATIENT', 'REPORT')
        resource_id: ID of the resource
        action: Action performed (e.g., 'VIEW', 'UPDATE', 'DELETE')
        ip_address: Source IP address
        user_agent: Client user agent
        details: Additional context

    Returns:
        True if event was published successfully
    """
    return log_audit_event(
        actor_id=actor_id,
        action=f"{resource_type}_{action}",
        target_id=resource_id,
        resource_type=resource_type,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details,
    )
