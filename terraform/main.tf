# Main Azure Infrastructure Configuration
# ========================================
# Creates core resources: Resource Group, Container Apps Environment, Log Analytics

# Resource Group - Container for all Azure resources
resource "azurerm_resource_group" "main" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location
  tags     = var.tags
}

# Log Analytics Workspace - Required for Container Apps monitoring
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-${var.project_name}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30  # Keep logs for 30 days (free tier: 31 days max)
  tags                = var.tags
}

# Container Apps Environment - Serverless container hosting platform
resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${var.project_name}-${var.environment}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = var.tags
}

# Application Insights - Optional: Advanced monitoring and tracing
resource "azurerm_application_insights" "main" {
  name                = "appi-${var.project_name}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  workspace_id        = azurerm_log_analytics_workspace.main.id
  tags                = var.tags
}
