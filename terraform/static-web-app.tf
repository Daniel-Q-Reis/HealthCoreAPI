# Azure Static Web Apps - Frontend Hosting
# ==========================================
# Free tier hosting for React SPA frontend
# Automatically deploys from GitHub on push

# ============================================================
# Static Web App Resource
# ============================================================
# Free tier: 100GB bandwidth, 2 custom domains, HTTPS included

resource "azurerm_static_web_app" "frontend" {
  name                = "swa-healthcoreapi-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = "centralus"  # Static Web Apps has limited regions
  sku_tier            = "Free"
  sku_size            = "Free"

  tags = var.tags
}

# ============================================================
# Outputs
# ============================================================

output "frontend_url" {
  description = "Frontend Static Web App URL"
  value       = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

output "frontend_api_token" {
  description = "API token for GitHub Actions deployment (add to GitHub Secrets)"
  value       = azurerm_static_web_app.frontend.api_key
  sensitive   = true
}

output "frontend_deployment_instructions" {
  description = "Instructions for GitHub Actions setup"
  value       = <<-EOT

    ================================================
    Frontend Deployment Setup (Azure Static Web Apps)
    ================================================

    1. Get the API token:
       terraform output -raw frontend_api_token

    2. Add to GitHub Secrets:
       - Go to: https://github.com/daniel-q-reis/HealthCoreAPI/settings/secrets/actions
       - Add secret: AZURE_STATIC_WEB_APPS_API_TOKEN
       - Paste the token value

    3. Add GitHub variable:
       - Go to: https://github.com/daniel-q-reis/HealthCoreAPI/settings/variables/actions
       - Add variable: VITE_API_URL
       - Value: https://ca-django-api.politebush-1e329a2d.centralus.azurecontainerapps.io

    4. Push to main branch to trigger deployment

    Frontend URL: https://${azurerm_static_web_app.frontend.default_host_name}

    ================================================
  EOT
}
