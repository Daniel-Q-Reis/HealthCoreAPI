variable "resource_group_name" {
  type        = string
  description = "The name of the Azure Resource Group."
  default     = "healthcore-rg-prod"
}

variable "location" {
  type        = string
  description = "The Azure region where resources will be deployed."
  default     = "East US"
}

variable "cluster_name" {
  type        = string
  description = "The name of the AKS cluster."
  default     = "healthcore-aks-prod"
}

variable "kubernetes_version" {
  type        = string
  description = "The version of Kubernetes to use for the AKS cluster."
  # UPDATE: Using a more recent, stable Kubernetes version for 2025 context.
  default     = "1.29.4"
}

variable "system_node_count" {
  type        = number
  description = "The number of nodes in the system node pool."
  default     = 2
}
