# Terraform Variables for Azure Deployment
# ==========================================
# These variables configure the Azure infrastructure for HealthCoreAPI

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "location" {
  description = "Azure region for resource deployment"
  type        = string
  default     = "centralus"  # Changed from eastus due to PostgreSQL restrictions
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "healthcoreapi"
}

# Database Configuration
variable "db_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  sensitive   = true
}

variable "db_admin_password" {
  description = "PostgreSQL administrator password (min 8 chars, complex)"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_admin_password) >= 8
    error_message = "Database password must be at least 8 characters long."
  }
}

# GitHub Container Registry Credentials
variable "ghcr_username" {
  description = "GitHub username for GHCR authentication"
  type        = string
}

variable "ghcr_token" {
  description = "GitHub Personal Access Token with read:packages permission"
  type        = string
  sensitive   = true
}

variable "postgres_sku" {
  description = "PostgreSQL SKU (B1ms for 15 users, B2s for AI-heavy workloads)"
  type        = string
  default     = "B_Standard_B1ms"  # 2GB RAM, $30/month

  validation {
    condition     = contains(["B_Standard_B1ms", "B_Standard_B2s"], var.postgres_sku)
    error_message = "PostgreSQL SKU must be B1ms (2GB) or B2s (4GB)."
  }
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage in MB"
  type        = number
  default     = 32768  # 32GB
}

# Redis Configuration
variable "redis_capacity" {
  description = "Redis cache capacity (0=250MB, 1=1GB)"
  type        = number
  default     = 1  # C1 (1GB) for Celery worker stability

  validation {
    condition     = contains([0, 1, 2, 3, 4, 5, 6], var.redis_capacity)
    error_message = "Redis capacity must be between 0 and 6."
  }
}

# Container Apps Configuration
variable "django_cpu" {
  description = "Django API CPU allocation (0.25, 0.5, 1.0)"
  type        = number
  default     = 0.25
}

variable "django_memory" {
  description = "Django API memory allocation (0.5Gi, 1.0Gi, 2.0Gi)"
  type        = string
  default     = "0.5Gi"
}

variable "django_min_replicas" {
  description = "Minimum Django API replicas (2 for high availability, prevents coldstart)"
  type        = number
  default     = 2  # Changed from 0 to prevent session issues with concurrent users
}

variable "django_max_replicas" {
  description = "Maximum Django API replicas"
  type        = number
  default     = 3
}

# Tags for resource organization and cost tracking
variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "HealthCoreAPI"
    Environment = "Production"
    ManagedBy   = "Terraform"
    Owner       = "Daniel de Queiroz Reis"
  }
}
