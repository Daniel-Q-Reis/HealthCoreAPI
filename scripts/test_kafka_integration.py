#!/usr/bin/env python
"""
Test script for Kafka → Go Audit Service integration.
Tests: Django Kafka producer → Go consumer → DynamoDB
"""

import os
import sys
import time

# Add src to path
sys.path.insert(0, "/usr/src/app")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "healthcoreapi.settings.development")

import django

django.setup()

from src.apps.core.services.audit_logger import log_audit_event  # noqa: E402
from src.apps.core.services.grpc_client import AuditGRPCClient  # noqa: E402


def test_kafka_to_audit_service() -> bool:
    """Test: Publish event via Kafka, verify it reaches DynamoDB"""
    print("\n" + "=" * 60)
    print("🧪 KAFKA → GO AUDIT SERVICE INTEGRATION TEST")
    print("=" * 60)

    # Test 1: Publish event via Kafka
    print("\n🧪 Test 1: Publishing audit event via Kafka...")
    target_id = f"KAFKA-TEST-PATIENT-{int(time.time())}"

    success = log_audit_event(
        actor_id="KAFKA-TEST-USER-999",
        action="KAFKA_INTEGRATION_TEST",
        target_id=target_id,
        resource_type="PATIENT",
        ip_address="10.0.0.1",
        user_agent="Kafka Test Script",
        details={"test": "kafka-to-go", "timestamp": str(time.time())},
    )

    if not success:
        print("❌ Failed to publish event to Kafka")
        return False

    print("✅ Event published to Kafka topic: healthcore.events")

    # Test 2: Wait for Go consumer to process
    print("\n⏳ Waiting 5 seconds for Go consumer to process...")
    time.sleep(5)

    # Test 3: Query DynamoDB via gRPC
    print(f"\n🧪 Test 2: Querying DynamoDB for target_id={target_id}...")
    try:
        with AuditGRPCClient(host="audit-service", port=50051, timeout=10) as client:
            logs = client.get_audit_logs(target_id=target_id, limit=10)

            if not logs:
                print(
                    "❌ No logs found in DynamoDB - Kafka event may not have been processed"
                )
                return False

            print(f"✅ Retrieved {len(logs)} log(s) from DynamoDB")
            print("\n📋 Event details:")
            import json

            print(json.dumps(logs[0], indent=2))

            # Verify event data
            log_entry = logs[0]
            assert log_entry["actorId"] == "KAFKA-TEST-USER-999"
            assert log_entry["action"] == "KAFKA_INTEGRATION_TEST"
            assert log_entry["resourceType"] == "PATIENT"
            print("\n✅ Event data verified!")

            return True

    except Exception as e:
        print(f"❌ Error querying DynamoDB: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    result = test_kafka_to_audit_service()

    print("\n" + "=" * 60)
    if result:
        print("✅ KAFKA INTEGRATION TEST PASSED!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("❌ KAFKA INTEGRATION TEST FAILED")
        print("=" * 60)
        sys.exit(1)
