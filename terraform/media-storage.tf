# Persistent media for uploaded professional documents.
resource "azurerm_storage_account" "media" {
  name                            = "hcbrunamedia2026"
  resource_group_name             = azurerm_resource_group.main.name
  location                        = azurerm_resource_group.main.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  account_kind                    = "StorageV2"
  https_traffic_only_enabled      = true
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  tags                            = var.tags
}

resource "azurerm_storage_share" "media" {
  name               = "django-media"
  storage_account_id = azurerm_storage_account.media.id
  quota              = 5
}

resource "azurerm_container_app_environment_storage" "media" {
  name                         = "django-media"
  container_app_environment_id = azurerm_container_app_environment.main.id
  account_name                 = azurerm_storage_account.media.name
  share_name                   = azurerm_storage_share.media.name
  access_key                   = azurerm_storage_account.media.primary_access_key
  access_mode                  = "ReadWrite"
}
