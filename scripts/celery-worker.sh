
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

# Database check function
wait_for_postgres() {
    if [ -n "${DATABASE_URL:-}" ]; then
        DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
        DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
        DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*|\1|p')
    else
        DB_HOST="${DB_HOST:-db}"
        DB_PORT="${DB_PORT:-5432}"
        DB_USER="${DB_USER:-postgres}"
    fi

    log "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        if pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" >/dev/null 2>&1; then
            log_success "PostgreSQL is ready!"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    log_error "Timeout waiting for PostgreSQL"
    exit 1
}

start_celery_worker() {
    log "Starting Celery worker..."
    log "Configuration: concurrency=2, loglevel=info"

    exec celery -A healthcoreapi worker \
        --loglevel=info \
        --concurrency=2 \
        --without-gossip \
        --without-mingle \
        --without-heartbeat
}

# Handle signals gracefully
trap 'log_warning "Received shutdown signal, stopping Celery worker..."; exit 0' SIGTERM SIGINT

# Main execution
wait_for_postgres
start_celery_worker
