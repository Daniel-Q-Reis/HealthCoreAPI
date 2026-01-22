# Terraform Outputs - Deployment Information
# ===========================================
# Exposes URLs, connection strings, and other important values after deployment

# ============================================================
# Public URLs
# ============================================================

output "django_api_url" {
  value       = "https://${azurerm_container_app.django_api.ingress[0].fqdn}"
  description = "Django API public URL"
}

output "grafana_url" {
  value       = "https://${azurerm_container_app.grafana.ingress[0].fqdn}"
  description = "Grafana dashboard URL (admin/HealthCore2026!)"
}

# ============================================================
# Internal Service URLs
# ============================================================

output "audit_service_internal_url" {
  value       = "http://${azurerm_container_app.audit_service.ingress[0].fqdn}:50051"
  description = "Go Audit Service internal gRPC URL (Container Apps network)"
}

output "prometheus_internal_url" {
  value       = "http://${azurerm_container_app.prometheus.ingress[0].fqdn}:9090"
  description = "Prometheus metrics URL (internal only)"
}

# ============================================================
# Database Connection Information
# ============================================================

output "postgres_fqdn" {
  value       = azurerm_postgresql_flexible_server.main.fqdn
  description = "PostgreSQL server FQDN"
  sensitive   = true
}

output "postgres_connection_string" {
  value       = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/healthcoreapi_db"
  description = "Full PostgreSQL connection string"
  sensitive   = true
}

output "redis_hostname" {
  value       = azurerm_redis_cache.main.hostname
  description = "Redis cache hostname"
  sensitive   = true
}

output "redis_primary_key" {
  value       = azurerm_redis_cache.main.primary_access_key
  description = "Redis primary access key"
  sensitive   = true
}

output "mongodb_connection_string" {
  value       = azurerm_cosmosdb_account.main.primary_mongodb_connection_string
  description = "MongoDB (Cosmos DB) connection string"
  sensitive   = true
}

# ============================================================
# Event Hubs / Kafka Configuration
# ============================================================

output "kafka_broker_endpoint" {
  value       = "${azurerm_eventhub_namespace.main.name}.servicebus.windows.net:9093"
  description = "Kafka broker endpoint (Event Hubs)"
}

output "kafka_connection_string" {
  value       = azurerm_eventhub_authorization_rule.kafka_client.primary_connection_string
  description = "Kafka SASL connection string"
  sensitive   = true
}

# ============================================================
# Monitoring & Observability
# ============================================================

output "application_insights_connection_string" {
  value       = azurerm_application_insights.main.connection_string
  description = "Application Insights connection string for telemetry"
  sensitive   = true
}

output "application_insights_instrumentation_key" {
  value       = azurerm_application_insights.main.instrumentation_key
  description = "Application Insights instrumentation key (legacy)"
  sensitive   = true
}

output "log_analytics_workspace_id" {
  value       = azurerm_log_analytics_workspace.main.id
  description = "Log Analytics Workspace ID for Container Apps"
}

# ============================================================
# Resource Identifiers
# ============================================================

output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "Resource group name"
}

output "resource_group_location" {
  value       = azurerm_resource_group.main.location
  description = "Azure region"
}

output "container_app_environment_id" {
  value       = azurerm_container_app_environment.main.id
  description = "Container Apps Environment ID"
}

# ============================================================
# Cost Estimation Helper
# ============================================================

output "deployment_summary" {
  value = <<-EOT

  ========================================
  HealthCoreAPI Azure Deployment Summary
  ========================================

  Region: ${azurerm_resource_group.main.location}
  Environment: ${var.environment}

  Public Endpoints:
  - Django API: https://${azurerm_container_app.django_api.ingress[0].fqdn}
  - Grafana:    https://${azurerm_container_app.grafana.ingress[0].fqdn}

  Database:
  - PostgreSQL: ${azurerm_postgresql_flexible_server.main.fqdn}
  - MongoDB:    ${azurerm_cosmosdb_account.main.name}.mongo.cosmos.azure.com

  Estimated Monthly Cost:
  - PostgreSQL B1ms: ~$30
  - Redis C1: ~$16
  - Event Hubs Standard: ~$11
  - Cosmos DB Serverless: ~$24
  - Container Apps: ~$30-50
  - Total: ~$110-150/month

  Next Steps:
  1. Run database migrations: az containerapp exec --name ca-django-api --command "/bin/bash"
  2. Create superuser: python manage.py createsuperuser
  3. Test API: curl https://${azurerm_container_app.django_api.ingress[0].fqdn}/api/v1/health/

  ========================================
  EOT
  description = "Deployment summary with URLs and next steps"
}
