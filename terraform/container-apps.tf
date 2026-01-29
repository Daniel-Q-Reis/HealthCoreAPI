# Container Apps Configuration
# =============================
# Deploys Django API, Go Audit Service, Celery Worker/Beat, Grafana, Prometheus

# NOTE: Container Apps require images to be pushed to a registry first
# This config uses GitHub Container Registry (GHCR): ghcr.io/daniel-q-reis/healthcoreapi/*
# Images must be built and pushed before applying this Terraform

# ============================================================
# Django API - Main Application
# ============================================================
# Serves RESTful API endpoints for HealthCoreAPI
# Min 0 replicas (scale-to-zero), Max 3 replicas (autoscale on load)

resource "azurerm_container_app" "django_api" {
  name                         = "ca-django-api"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  # GHCR Private Registry Authentication
  registry {
    server               = "ghcr.io"
    username             = var.ghcr_username
    password_secret_name = "ghcr-token"
  }

  secret {
    name  = "ghcr-token"
    value = var.ghcr_token
  }

  template {
    min_replicas = var.django_min_replicas  # Default: 0 (scale-to-zero)
    max_replicas = var.django_max_replicas  # Default: 3

    container {
      name   = "django"
      image  = "ghcr.io/daniel-q-reis/healthcoreapi/django-api:latest"
      cpu    = var.django_cpu     # Default: 0.25
      memory = var.django_memory  # Default: 0.5Gi

      env {
        name  = "DJANGO_SETTINGS_MODULE"
        value = "healthcoreapi.settings.production"
      }

      env {
        name  = "COLLECTSTATIC"
        value = "1"
      }

      # Django security settings for Azure Container Apps
      env {
        name  = "ALLOWED_HOSTS"
        value = ".azurecontainerapps.io,.danielqreis.com,localhost,127.0.0.1"
      }

      env {
        name  = "CORS_ALLOWED_ORIGINS"
        value = "https://app.danielqreis.com,https://api.danielqreis.com,https://ca-django-api.politebush-1e329a2d.centralus.azurecontainerapps.io"
      }

      env {
        name  = "CSRF_TRUSTED_ORIGINS"
        value = "https://app.danielqreis.com,https://api.danielqreis.com,https://ca-django-api.politebush-1e329a2d.centralus.azurecontainerapps.io"
      }

      # Frontend URL for OAuth callback redirect
      env {
        name  = "FRONTEND_URL"
        value = "https://app.danielqreis.com"
      }

      env {
        name  = "SECRET_KEY"
        value = "azure-prod-8kJx2Lm9Np3Qr5Tv7Wz-healthcoreapi-2026"
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/healthcoreapi_db"
      }

      env {
        name  = "REDIS_URL"
        value = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:6380/0"
      }

      # Django cache uses CACHE_URL
      env {
        name  = "CACHE_URL"
        value = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:6380/1"
      }

      # Celery broker also needs Redis URL
      env {
        name  = "CELERY_BROKER_URL"
        value = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:6380/0"
      }

      env {
        name  = "KAFKA_BROKERS"
        value = "${azurerm_eventhub_namespace.main.name}.servicebus.windows.net:9093"
      }

      env {
        name  = "KAFKA_SASL_USERNAME"
        value = "$ConnectionString"
      }

      env {
        name  = "KAFKA_SASL_PASSWORD"
        value = azurerm_eventhub_authorization_rule.kafka_client.primary_connection_string
      }

      env {
        name  = "APPLICATIONINSIGHTS_CONNECTION_STRING"
        value = azurerm_application_insights.main.connection_string
      }

      # Google OAuth2 Credentials
      env {
        name  = "GOOGLE_OAUTH_CLIENT_ID"
        value = var.google_client_id
      }

      env {
        name  = "GOOGLE_OAUTH_CLIENT_SECRET"
        value = var.google_client_secret
      }

      env {
        name  = "GOOGLE_OAUTH_REDIRECT_URI"
        value = "https://api.danielqreis.com/api/auth/complete/google-oauth2/"
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 8000

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = var.tags
}

# ============================================================
# Go Audit Service - gRPC Microservice
# ============================================================
# Consumes Kafka events and stores audit logs in MongoDB (Cosmos DB)
# Min 1 replica (always-on for audit logging), Max 2 replicas

resource "azurerm_container_app" "audit_service" {
  name                         = "ca-audit-service"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  # GHCR Private Registry Authentication
  registry {
    server               = "ghcr.io"
    username             = var.ghcr_username
    password_secret_name = "ghcr-token"
  }

  secret {
    name  = "ghcr-token"
    value = var.ghcr_token
  }

  template {
    min_replicas = 1  # Always-on for audit logs
    max_replicas = 2

    container {
      name   = "audit-service"
      image  = "ghcr.io/daniel-q-reis/healthcoreapi/audit-service:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "KAFKA_BROKERS"
        value = "${azurerm_eventhub_namespace.main.name}.servicebus.windows.net:9093"
      }

      env {
        name  = "KAFKA_SASL_USERNAME"
        value = "$ConnectionString"
      }

      env {
        name  = "KAFKA_SASL_PASSWORD"
        value = azurerm_eventhub_authorization_rule.kafka_client.primary_connection_string
      }

      env {
        name  = "MONGODB_URI"
        value = azurerm_cosmosdb_account.main.primary_mongodb_connection_string
      }
    }
  }

  ingress {
    external_enabled = false  # Internal only (gRPC communication)
    target_port      = 50051

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = var.tags
}

# ============================================================
# Celery Worker - Async Task Processing
# ============================================================
# Processes background tasks (appointment reminders, auto-completion)
# Uses same Django image with different command

resource "azurerm_container_app" "celery_worker" {
  name                         = "ca-celery-worker"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  # GHCR Private Registry Authentication
  registry {
    server               = "ghcr.io"
    username             = var.ghcr_username
    password_secret_name = "ghcr-token"
  }

  secret {
    name  = "ghcr-token"
    value = var.ghcr_token
  }

  template {
    min_replicas = 1  # Always-on for scheduled tasks
    max_replicas = 2

    container {
      name   = "celery-worker"
      image  = "ghcr.io/daniel-q-reis/healthcoreapi/django-api:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      command = ["/bin/bash", "/opt/docker/scripts/celery-worker.sh"]

      env {
        name  = "DJANGO_SETTINGS_MODULE"
        value = "healthcoreapi.settings.production"
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/healthcoreapi_db"
      }

      env {
        name  = "REDIS_URL"
        value = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:6380/0"
      }
    }
  }

  tags = var.tags
}

# ============================================================
# Celery Beat - Task Scheduler
# ============================================================
# Schedules periodic tasks (daily reminders, weekly slot generation)
# Single replica only (to prevent duplicate scheduling)

resource "azurerm_container_app" "celery_beat" {
  name                         = "ca-celery-beat"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  # GHCR Private Registry Authentication
  registry {
    server               = "ghcr.io"
    username             = var.ghcr_username
    password_secret_name = "ghcr-token"
  }

  secret {
    name  = "ghcr-token"
    value = var.ghcr_token
  }

  template {
    min_replicas = 1  # Must be exactly 1 (no duplicates)
    max_replicas = 1

    container {
      name   = "celery-beat"
      image  = "ghcr.io/daniel-q-reis/healthcoreapi/django-api:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      command = ["/bin/bash", "/opt/docker/scripts/celery-beat.sh"]

      env {
        name  = "DJANGO_SETTINGS_MODULE"
        value = "healthcoreapi.settings.production"
      }

      env {
        name  = "DATABASE_URL"
        value = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/healthcoreapi_db"
      }

      env {
        name  = "REDIS_URL"
        value = "rediss://:${azurerm_redis_cache.main.primary_access_key}@${azurerm_redis_cache.main.hostname}:6380/0"
      }
    }
  }

  tags = var.tags
}

# ============================================================
# Grafana - Monitoring Dashboard
# ============================================================
# Provides observability dashboards for application metrics

resource "azurerm_container_app" "grafana" {
  name                         = "ca-grafana"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  template {
    min_replicas = 1  # Keep always on for monitoring
    max_replicas = 1

    container {
      name   = "grafana"
      image  = "grafana/grafana:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "GF_SECURITY_ADMIN_USER"
        value = "admin"
      }

      env {
        name  = "GF_SECURITY_ADMIN_PASSWORD"
        value = "admin123"  # Matches Django admin for easier demo access
      }

      env {
        name  = "GF_USERS_ALLOW_SIGN_UP"
        value = "false"
      }

      env {
        name  = "GF_INSTALL_PLUGINS"
        value = ""  # No additional plugins needed
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 3000

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = var.tags
}

# ============================================================
# Prometheus - Metrics Collector
# ============================================================
# Scrapes application metrics from Django /metrics endpoint

resource "azurerm_container_app" "prometheus" {
  name                         = "ca-prometheus"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  template {
    min_replicas = 1  # Keep always on for metrics collection
    max_replicas = 1

    container {
      name   = "prometheus"
      image  = "prom/prometheus:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      # Note: Prometheus config will need to be provided via ConfigMap or volume
      # For now using default config, update in future iteration
    }
  }

  ingress {
    external_enabled = true  # Enable external access for testing/demos
    target_port      = 9090

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = var.tags
}
