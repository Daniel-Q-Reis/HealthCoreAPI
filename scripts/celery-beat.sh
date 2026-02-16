
#!/usr/bin/env bash
set -Eeuo pipefail

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[celery-beat]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[celery-beat] ✅${NC} $1"
}

log_error() {
    echo -e "${RED}[celery-beat] ❌${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}[celery-beat] ⚠️${NC} $1"
}

# Database check function (copied/adapted from entrypoint.sh)
wait_for_postgres() {
    # If DATABASE_URL is set, extract host/port/user/db
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

run_celery_beat_migrations() {
    log "Running Celery Beat migrations..."
    if python manage.py migrate django_celery_beat --noinput; then
        log_success "Celery Beat migrations completed"
    else
        log_warning "Celery Beat migrations failed (continuing anyway)"
    fi
}

start_celery_beat() {
    log "Starting Celery beat..."
    log "Configuration: scheduler=django_celery_beat.schedulers:DatabaseScheduler"

    mkdir -p logs

    exec celery -A healthcoreapi beat \
        --loglevel=info \
        --scheduler django_celery_beat.schedulers:DatabaseScheduler
}

# Handle signals gracefully
trap 'log_warning "Received shutdown signal, stopping Celery beat..."; exit 0' SIGTERM SIGINT

# Main execution
wait_for_postgres
run_celery_beat_migrations
start_celery_beat
