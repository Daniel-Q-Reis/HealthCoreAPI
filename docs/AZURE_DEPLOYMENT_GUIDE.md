# Azure Container Apps Deployment Guide

> **⚠️ This is a sanitized copy for project documentation**
> **Full walkthrough with step-by-step details:** See `azure_deployment_walkthrough.md` in conversation artifacts

---

## Quick Start

### 1. Prerequisites
- Azure CLI 2.80+
- Terraform 1.14+
- Docker Desktop
- GitHub account with PAT (packages permission)

### 2. Build Docker Images

```bash
# Login to GHCR
$env:GITHUB_TOKEN = "YOUR_PAT_HERE"
echo $env:GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Build Django
docker build -t ghcr.io/YOUR_USERNAME/healthcoreapi/django-api:latest --target production .
docker push ghcr.io/YOUR_USERNAME/healthcoreapi/django-api:latest

# Build Go Audit Service
docker build -t ghcr.io/YOUR_USERNAME/healthcoreapi/audit-service:latest -f services/audit-service/Dockerfile services/audit-service
docker push ghcr.io/YOUR_USERNAME/healthcoreapi/audit-service:latest
```

### 3. Deploy with Terraform

```bash
cd terraform

# Login to Azure
az login

# Initialize Terraform
terraform init
terraform validate
terraform plan -out=tfplan

# Deploy (creates 20 Azure resources)
terraform apply tfplan
```

### 4. Post-Deployment

```bash
# Run migrations
az containerapp exec --resource-group rg-healthcoreapi-prod --name ca-django-api --command "/bin/bash"
python manage.py migrate
python manage.py createsuperuser
```

---

## Architecture

**Services:**
- Django API (Container App, external)
- Go Audit Service (Container App, internal)
- Celery Worker + Beat (Container Apps)
- Grafana + Prometheus (Container Apps)

**Managed Services:**
- PostgreSQL B1ms (2GB)
- Redis C1 (1GB)
- Event Hubs (Kafka-compatible)
- Cosmos DB MongoDB (Serverless)

**Region:** East US
**Monthly Cost:** $110-150

---

## Resources Created

| Resource | Name | Purpose |
|----------|------|---------|
| Resource Group | `rg-healthcoreapi-prod` | Container for all resources |
| PostgreSQL | `psql-healthcoreapi-prod` | Main database |
| Redis | `redis-healthcoreapi-prod` | Cache & Celery broker |
| Event Hubs | `evhns-healthcoreapi-prod` | Kafka-compatible streaming |
| Cosmos DB | `cosmos-healthcoreapi-prod` | MongoDB for audit logs |
| Container Apps Env | `cae-healthcoreapi-prod` | Serverless container platform |

---

## Outputs

After deployment, get URLs:
```bash
terraform output django_api_url
terraform output grafana_url
```

---

## Troubleshooting

**Container won't start:**
- Check logs: `az containerapp logs show --name ca-django-api --follow`
- Verify images are public in GHCR

**Database connection failed:**
- Verify firewall allows Azure services
- Check connection string format

**Cost too high:**
- Scale down max replicas
- Remove Grafana/Prometheus (use Azure Monitor instead)

---

## Next Steps

- [ ] Configure custom domain
- [ ] Deploy frontend (Azure Static Web Apps)
- [ ] Setup CI/CD with GitHub Actions
- [ ] Configure Azure Key Vault for secrets
- [ ] Setup monitoring dashboards

---

**See full deployment walkthrough:** `azure_deployment_walkthrough.md` (conversation artifacts)
