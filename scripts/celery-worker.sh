
#!/usr/bin/env bash
set -Eeuo pipefail

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[celery-worker]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[celery-worker] ✅${NC} $1"
}

log_error() {
    echo -e "${RED}[celery-worker] ❌${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}[celery-worker] ⚠️${NC} $1"
}

wait_for_web_service() {
    log "Waiting for web service to be ready..."

    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://web:8000/admin/login/ >/dev/null 2>&1; then
            log_success "Web service is ready!"
            return 0
        fi

        attempt=$((attempt + 1))
        if [ $((attempt % 10)) -eq 0 ]; then
            log "Still waiting for web service... (attempt $attempt/$max_attempts)"
        fi
        sleep 2
    done

    log_error "Timeout waiting for web service"
    exit 1
}

start_celery_worker() {
    log "Starting Celery worker..."
    log "Configuration: concurrency=2, loglevel=info"

    exec celery -A config worker \
        --loglevel=info \
        --concurrency=2 \
        --without-gossip \
        --without-mingle \
        --without-heartbeat
}

# Handle signals gracefully
trap 'log_warning "Received shutdown signal, stopping Celery worker..."; exit 0' SIGTERM SIGINT

# Main execution
wait_for_web_service
start_celery_worker
