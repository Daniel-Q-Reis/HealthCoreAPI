#!/usr/bin/env python
"""
Test script for gRPC communication between Django and Audit Service.
Tests: Python client → Go gRPC server → DynamoDB
"""

import os
import sys

# Add src to path
sys.path.insert(0, "/usr/src/app")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "healthcoreapi.settings.development")

import django

django.setup()

from src.apps.core.services.grpc_client import AuditGRPCClient  # noqa: E402


def test_grpc_connection():
    """Test 1: Basic gRPC connection"""
    print("\n🧪 Test 1: Testing gRPC connection...")
    try:
        client = AuditGRPCClient(host="audit-service", port=50051, timeout=10)
        client.connect()
        print("✅ Successfully connected to audit-service:50051")
        client.close()
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


def test_log_event():
    """Test 2: Log an audit event via gRPC"""
    print("\n🧪 Test 2: Logging audit event via gRPC...")
    try:
        with AuditGRPCClient(host="audit-service", port=50051, timeout=10) as client:
            event_id = client.log_event(
                actor_id="TEST-USER-123",
                action="GRPC_TEST",
                target_id="TEST-PATIENT-456",
                resource_type="PATIENT",
                ip_address="192.168.1.100",
                user_agent="Python Test Script",
                details={"test": "end-to-end", "timestamp": "now"},
            )
            print(f"✅ Event logged successfully! Event ID: {event_id}")
            return event_id
    except Exception as e:
        print(f"❌ Failed to log event: {e}")
        import traceback

        traceback.print_exc()
        return None


def test_get_logs(target_id):
    """Test 3: Retrieve audit logs via gRPC"""
    print(f"\n🧪 Test 3: Retrieving logs for target_id={target_id}...")
    try:
        with AuditGRPCClient(host="audit-service", port=50051, timeout=10) as client:
            logs = client.get_audit_logs(target_id=target_id, limit=10)
            print(f"✅ Retrieved {len(logs)} audit logs")
            if logs:
                print("\n📋 Sample log entry:")
                import json

                print(json.dumps(logs[0], indent=2))
            return logs
    except Exception as e:
        print(f"❌ Failed to retrieve logs: {e}")
        import traceback

        traceback.print_exc()
        return None


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 AUDIT SERVICE gRPC END-TO-END TEST")
    print("=" * 60)

    # Test 1: Connection
    if not test_grpc_connection():
        print("\n❌ Connection test failed. Exiting.")
        sys.exit(1)

    # Test 2: Log Event
    event_id = test_log_event()
    if not event_id:
        print("\n❌ Log event test failed. Exiting.")
        sys.exit(1)

    # Test 3: Get Logs
    logs = test_get_logs("TEST-PATIENT-456")

    print("\n" + "=" * 60)
    if logs is not None:
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("❌ SOME TESTS FAILED")
        print("=" * 60)
        sys.exit(1)
