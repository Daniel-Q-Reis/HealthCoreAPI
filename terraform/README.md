# Terraform Azure Deployment - HealthCoreAPI

**Status:** Ready for deployment
**Region:** East US
**Estimated Cost:** $110-150/month
**Terraform Version:** 1.14+
**Azure Provider:** 4.57+

---

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `providers.tf` | Terraform + Azure provider configuration |
| `variables.tf` | Input variables with validation |
| `main.tf` | Resource group + Container Apps environment |
| `managed-services.tf` | PostgreSQL, Redis, Event Hubs, Cosmos DB |
| `container-apps.tf` | Django, Go, Celery, Grafana, Prometheus |
| `outputs.tf` | URLs, connection strings, deployment summary |
| `terraform.tfvars.example` | Template for variable values |
| `terraform-aks-old/` | Backup of previous AKS configuration |

---

## 🚀 Deployment Steps

### 1. Prerequisites

```bash
# Install Azure CLI
winget install Microsoft.AzureCLI

# Login to Azure
az login

# Verify subscription (use correct one if multiple)
az account list --output table
az account set --subscription "SUBSCRIPTION_ID"
```

### 2. Configure Variables

```bash
# Copy example file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
# CRITICAL: Change db_admin_password!
```

### 3. Initialize Terraform

```bash
cd terraform
terraform init
```

### 4. Plan Deployment

```bash
# Review what will be created
terraform plan -out=tfplan

# Check estimated costs
terraform show -json tfplan | jq '.configuration.root_module.resources[] | {name: .address, type: .type}'
```

### 5. Deploy Infrastructure

```bash
# Apply the plan (will take 10-15 minutes)
terraform apply tfplan

# Save outputs to file
terraform output > ../azure_deployment_outputs.txt
```

---

## 🐳 Container Image Requirements

Before deploying, you MUST build and push Docker images to GitHub Container Registry:

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build Django image
docker build -t ghcr.io/daniel-q-reis/healthcoreapi/django-api:latest \
  --target production .
docker push ghcr.io/daniel-q-reis/healthcoreapi/django-api:latest

# Build Go Audit Service
cd services/audit-service
docker build -t ghcr.io/daniel-q-reis/healthcoreapi/audit-service:latest .
docker push ghcr.io/daniel-q-reis/healthcoreapi/audit-service:latest
```

**Note:** Container Apps will fail to start if images don't exist!

---

## 🔧 Post-Deployment Configuration

### Run Database Migrations

```bash
# Get Django container name
az containerapp list --resource-group rg-healthcoreapi-prod --output table

# SSH into Django container
az containerapp exec \
  --resource-group rg-healthcoreapi-prod \
  --name ca-django-api \
  --command "/bin/bash"

# Inside container:
python manage.py migrate
python manage.py loaddata src/apps/core/fixtures/roles.json
python manage.py createsuperuser
```

### Test Deployment

```bash
# Get Django API URL from outputs
terraform output django_api_url

# Test health check
curl https://<DJANGO_URL>/api/v1/health/
```

---

## 💰 Cost Management

### Set up Billing Alerts

```bash
# Create budget alert ($150/month threshold)
az consumption budget create \
  --resource-group rg-healthcoreapi-prod \
  --budget-name healthcoreapi-budget \
  --amount 150 \
  --time-grain Monthly \
  --start-date 2026-01-01 \
  --notification-enabled true \
  --notification-threshold 80
```

### Monitor Daily Costs

```bash
# View current month costs
az consumption usage list \
  --start-date 2026-01-01 \
  --end-date 2026-01-31 \
  --output table
```

---

## 🧹 Cleanup / Destroy

```bash
# Remove all resources (stops billing)
terraform destroy

# Verify deletion
az group list --output table
```

---

## 📊 Resource Mapping

| Docker Compose Service | Azure Service | Monthly Cost |
|------------------------|---------------|--------------|
| PostgreSQL | Azure Database for PostgreSQL B1ms | $30 |
| Redis | Azure Cache for Redis C1 | $16 |
| Kafka | Azure Event Hubs Standard | $11 |
| MongoDB (DynamoDB local) | Cosmos DB Serverless | $24 |
| Django API | Container App | $10-20 |
| Go Audit Service | Container App | $5-10 |
| Celery Worker | Container App | $5-10 |
| Celery Beat | Container App | $5-10 |
| Grafana | Container App | $5-10 |
| Prometheus | Container App | $5-10 |
| **TOTAL** | | **$110-150** |

---

## 🔐 Security Best Practices

1. **Never commit `terraform.tfvars`** - Contains passwords!
2. **Use Azure Key Vault** for production secrets
3. **Enable Private Endpoints** for databases (future enhancement)
4. **Rotate passwords** every 90 days
5. **Review firewall rules** - PostgreSQL allows all Azure IPs

---

## 🐛 Troubleshooting

### Container App won't start

```bash
# Check logs
az containerapp logs show \
  --resource-group rg-healthcoreapi-prod \
  --name ca-django-api \
  --follow

# Check revision status
az containerapp revision list \
  --resource-group rg-healthcoreapi-prod \
  --name ca-django-api \
  --output table
```

### Database connection issues

```bash
# Test PostgreSQL connectivity
az postgres flexible-server connect \
  --name psql-healthcoreapi-prod \
  --admin-user healthcoreapi_admin \
  --admin-password "PASSWORD"
```

### Kafka/Event Hubs issues

```bash
# Verify Event Hub exists
az eventhubs eventhub show \
  --resource-group rg-healthcoreapi-prod \
  --namespace-name evhns-healthcoreapi-prod \
  --name healthcore.events
```

---

## 📚 Additional Resources

- [Azure Container Apps Docs](https://learn.microsoft.com/azure/container-apps/)
- [Terraform azurerm Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [ADR-0018: Container Apps Strategy](../docs/adr/0018-azure-container-apps-deployment.md)
- [ADR-0019: MongoDB Migration](../docs/adr/0019-mongodb-audit-service.md)

---

**Last Updated:** 2026-01-21
**Terraform Version:** 1.14.3
**Azure Provider:** 4.57.0
