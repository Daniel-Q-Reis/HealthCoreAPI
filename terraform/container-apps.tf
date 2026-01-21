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
        name  = "DATABASE_URL"
        value = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/healthcoreapi_db"
      }

      env {
        name  = "REDIS_URL"
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
        value = azurerm_cosmosdb_account.main.connection_strings[0]
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
    min_replicas = 0  # Scale to zero during off-hours
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
        value = "HealthCore2026!"  # TODO: Move to Azure Key Vault
      }

      env {
        name  = "GF_USERS_ALLOW_SIGN_UP"
        value = "false"
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
    min_replicas = 0  # Scale to zero during off-hours
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
    external_enabled = false  # Internal only
    target_port      = 9090

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = var.tags
}
