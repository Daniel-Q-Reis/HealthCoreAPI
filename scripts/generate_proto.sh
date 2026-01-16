#!/bin/bash
#
# Generate Python gRPC stubs from proto files
#
# This script runs inside the Docker container to ensure consistent environment
# Usage: bash scripts/generate_proto.sh

set -e

echo "🔧 Generating Python gRPC stubs from proto files..."
echo "   Running inside Docker container..."

# Run the generation inside the web container
docker-compose exec -T web bash << 'EOF'
cd /usr/src/app

PROTO_DIR="services/audit-service/proto"
OUTPUT_DIR="src/apps/core/proto"

echo "   Proto dir: $PROTO_DIR"
echo "   Output dir: $OUTPUT_DIR"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Generate Python code
python -m grpc_tools.protoc \
    -I"$PROTO_DIR" \
    --python_out="$OUTPUT_DIR" \
    --grpc_python_out="$OUTPUT_DIR" \
    --pyi_out="$OUTPUT_DIR" \
    "$PROTO_DIR/audit.proto"

# Create __init__.py
touch "$OUTPUT_DIR/__init__.py"

echo ""
echo "✅ Generated files:"
ls -lh "$OUTPUT_DIR" | grep audit_pb2

EOF

echo ""
echo "✅ Python gRPC stubs generated successfully!"
echo "   - audit_pb2.py (message definitions)"
echo "   - audit_pb2_grpc.py (service stubs)"
echo "   - audit_pb2.pyi (type hints)"
