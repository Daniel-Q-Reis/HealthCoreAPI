# Terraform and Azure Provider Configuration
# ===========================================
# This file configures Terraform to use Azure Resource Manager (azurerm) provider
# and sets up remote state storage in Azure Storage Account

terraform {
  required_version = ">= 1.14"  # Latest stable: 1.14.3 (Dec 2025)

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.57"  # Latest stable: 4.57.0 (Dec 2025)
    }
  }

  # Remote state configuration - Stores terraform.tfstate in Azure Storage
  # Benefits: State versioning, team collaboration, disaster recovery
  # To restore a previous state: Download from Azure Portal > Storage Account > Containers > tfstate
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "healthcoretfstate"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}

provider "azurerm" {
  # Subscription ID from tfvars or TF_VAR_subscription_id env var
  subscription_id = var.subscription_id

  features {
    # Enable soft-delete for Key Vault (recommended for production)
    key_vault {
      purge_soft_delete_on_destroy = false
      recover_soft_deleted_key_vaults = true
    }

    # Resource group cleanup on destroy
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}
