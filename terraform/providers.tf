terraform {
  # UPDATE: Pinning to a more recent, stable version.
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      # UPDATE: Using the latest major version for Azure provider.
      version = "~> 3.85" # A recent stable version in the 3.x line for broad compatibility.
    }
  }
}

provider "azurerm" {
  features {}
}
