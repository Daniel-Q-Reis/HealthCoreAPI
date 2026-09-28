# Provisioned monitoring configuration is stored in Azure Files so revisions restart consistently.
resource "azurerm_storage_share" "grafana_config" {
  name               = "grafana-config"
  storage_account_id = azurerm_storage_account.media.id
  quota              = 1
}

resource "azurerm_container_app_environment_storage" "grafana_config" {
  name                         = "grafana-config"
  container_app_environment_id = azurerm_container_app_environment.main.id
  account_name                 = azurerm_storage_account.media.name
  share_name                   = azurerm_storage_share.grafana_config.name
  access_key                   = azurerm_storage_account.media.primary_access_key
  access_mode                  = "ReadOnly"
}

resource "azurerm_storage_share" "prometheus_config" {
  name               = "prometheus-config"
  storage_account_id = azurerm_storage_account.media.id
  quota              = 1
}

resource "azurerm_container_app_environment_storage" "prometheus_config" {
  name                         = "prometheus-config"
  container_app_environment_id = azurerm_container_app_environment.main.id
  account_name                 = azurerm_storage_account.media.name
  share_name                   = azurerm_storage_share.prometheus_config.name
  access_key                   = azurerm_storage_account.media.primary_access_key
  access_mode                  = "ReadOnly"
}
