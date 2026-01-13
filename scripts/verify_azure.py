import os
import sys

import django

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "healthcoreapi.settings.development")
django.setup()

from src.apps.core.ai_client import get_ai_client  # noqa: E402


def verify_azure() -> None:
    print("--- Verifying Azure OpenAI Configuration (App Client) ---")

    try:
        client = get_ai_client()
        print(f"Client Type: {type(client).__name__}")

        if not client.is_configured():
            print("❌ Client reports NOT configured.")
            return

        print(f"Model Name: {client.model_name}")
        # Accessing private attribute safely for verification
        endpoint = getattr(client, "_endpoint", "N/A")
        print(f"Sanitized Endpoint: {endpoint}")

        print("\nAttempting generation...")
        response = client.generate_content("Hello, can you hear me?")
        print("✅ Connection Successful!")
        print(f"Response: {response}")

    except Exception as e:
        print(f"\n❌ Connection Failed: {e}")


if __name__ == "__main__":
    verify_azure()
