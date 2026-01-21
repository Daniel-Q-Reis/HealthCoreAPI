# Managed Azure Services Configuration
# ======================================
# PostgreSQL, Redis, Event Hubs (Kafka), Cosmos DB (MongoDB)

# ============================================================
# PostgreSQL Flexible Server - Main Application Database
# ============================================================
# B1ms: 2GB RAM, 32GB storage - Optimized for 15 concurrent users
# Cost: ~$30/month

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "psql-${var.project_name}-${var.environment}"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "15"
  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password

  sku_name   = var.postgres_sku  # Default: B_Standard_B1ms (2GB RAM)
  storage_mb = var.postgres_storage_mb  # Default: 32GB

  backup_retention_days = 7  # Automatic backups for 7 days
  geo_redundant_backup_enabled = false  # Disable for cost savings (single region)

  tags = var.tags
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "healthcoreapi_db"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# PostgreSQL Firewall Rule - Allow Azure services
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# ============================================================
# Azure Cache for Redis - Celery Broker & Django Cache
# ============================================================
# C1: 1GB RAM - Sufficient for Celery worker/beat coordination
# Cost: ~$16/month

resource "azurerm_redis_cache" "main" {
  name                = "redis-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  capacity            = var.redis_capacity  # Default: 1 (C1 = 1GB)
  family              = "C"
  sku_name            = "Basic"
  enable_non_ssl_port = false  # Force SSL for security
  minimum_tls_version = "1.2"

  redis_configuration {
    maxmemory_policy = "allkeys-lru"  # Evict least recently used keys
  }

  tags = var.tags
}

# ============================================================
# Event Hubs Namespace - Kafka-compatible Event Streaming
# ============================================================
# Standard: 1 Throughput Unit - Replaces local Kafka container
# Cost: ~$11/month

resource "azurerm_eventhub_namespace" "main" {
  name                = "evhns-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Standard"
  capacity            = 1  # 1 Throughput Unit

  tags = var.tags
}

# Event Hub (Kafka Topic) - healthcore.events
resource "azurerm_eventhub" "healthcore_events" {
  name                = "healthcore.events"
  namespace_name      = azurerm_eventhub_namespace.main.name
  resource_group_name = azurerm_resource_group.main.name
  partition_count     = 2  # 2 partitions for parallel processing
  message_retention   = 1  # Retain messages for 1 day
}

# Event Hubs Authorization Rule - Connection string for Kafka clients
resource "azurerm_eventhub_authorization_rule" "kafka_client" {
  name                = "kafka-client"
  namespace_name      = azurerm_eventhub_namespace.main.name
  eventhub_name       = azurerm_eventhub.healthcore_events.name
  resource_group_name = azurerm_resource_group.main.name

  listen = true
  send   = true
  manage = false
}

# ============================================================
# Cosmos DB for MongoDB - Audit Logs (NoSQL)
# ============================================================
# Serverless: Pay-per-request - Optimized for sporadic audit log access
# Cost: ~$24/month (400 RU/s autoscale baseline)

resource "azurerm_cosmosdb_account" "main" {
  name                = "cosmos-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  offer_type          = "Standard"
  kind                = "MongoDB"

  # MongoDB API compatibility (Version 4.2)
  capabilities {
    name = "EnableMongo"
  }

  # Serverless mode - pay only for requests (no idle costs)
  capabilities {
    name = "EnableServerless"
  }

  # Session consistency - balance between performance and data integrity
  consistency_policy {
    consistency_level = "Session"
  }

  # Single region deployment (East US)
  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  # Automatic failover disabled (single region)
  automatic_failover_enabled = false

  tags = var.tags
}

# Cosmos DB MongoDB Database
resource "azurerm_cosmosdb_mongo_database" "audit_logs" {
  name                = "audit_logs"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
}

# Cosmos DB MongoDB Collection for Audit Events
resource "azurerm_cosmosdb_mongo_collection" "events" {
  name                = "events"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_mongo_database.audit_logs.name

  # Partition key for horizontal scaling
  shard_key = "target_id"

  # Indexes for efficient queries
  index {
    keys   = ["target_id"]
    unique = false
  }

  index {
    keys   = ["timestamp"]
    unique = false
  }

  index {
    keys   = ["actor_id"]
    unique = false
  }
}
