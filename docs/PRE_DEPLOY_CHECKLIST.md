# Pre-Deploy Checklist

A comprehensive checklist for production deployments. Complete this before deploying to avoid common issues.

---

## 1. Environment Variables by Service

### Django API (Backend)

| Variable | Development | Production | Configure In |
|----------|-------------|------------|--------------|
| `DJANGO_SETTINGS_MODULE` | `healthcoreapi.settings.development` | `healthcoreapi.settings.production` | Terraform / Docker |
| `SECRET_KEY` | `dev-secret-key` | Generate securely | Terraform (secret) |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/healthcoreapi` | `postgresql://user:pass@host:5432/db` | Terraform |
| `REDIS_URL` | `redis://localhost:6379/0` | `rediss://:key@host:6380/0` (SSL) | Terraform |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | `.azurecontainerapps.io,.yourdomain.com` | Terraform |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | `https://app.yourdomain.com` | Terraform |
| `CSRF_TRUSTED_ORIGINS` | `http://localhost:5173` | `https://app.yourdomain.com` | Terraform |
| `FRONTEND_URL` | `http://localhost:5173` | `https://app.yourdomain.com` | Terraform |
| `DEBUG` | `True` | `False` | settings.py |

### Frontend (React/Vite)

| Variable | Development | Production | Configure In |
|----------|-------------|------------|--------------|
| `VITE_API_URL` | `http://localhost:8000/api` | `https://api.yourdomain.com/api` | GitHub Repository Variables |

### Google OAuth

| Item | Development | Production |
|------|-------------|------------|
| Authorized JavaScript Origins | `http://localhost:5173`, `http://localhost:8000` | `https://app.yourdomain.com`, `https://api.yourdomain.com` |
| Authorized Redirect URIs | `http://localhost:8000/api/auth/complete/google-oauth2/` | `https://api.yourdomain.com/api/auth/complete/google-oauth2/` |

---

## 2. DNS Configuration

### Required Records

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| CNAME | `app` | `<static-web-app>.azurestaticapps.net` | Frontend |
| CNAME | `api` | `<container-app>.azurecontainerapps.io` | Backend API |
| TXT | `asuid.api` | Azure validation value | SSL Certificate Validation |

### Propagation Timeline
- **CNAME**: 5-30 minutes
- **TXT**: 5-60 minutes
- **SSL Certificate**: 5-15 minutes after validation

---

## 3. Content Security Policy (CSP)

### Required Directives

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https:;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://api.yourdomain.com;
frame-src https://www.google.com https://www.youtube.com https://maps.google.com;
```

### CSP Checklist
- [ ] Backend API allowed in `connect-src`
- [ ] Google Fonts allowed in `style-src` and `font-src`
- [ ] Google Maps and YouTube allowed in `frame-src` (if using iframes)

---

## 4. External Services

### Google Cloud Console (OAuth)
- **URL**: https://console.cloud.google.com/apis/credentials
- **Actions**: Add production URIs BEFORE deploying
- **IMPORTANT**: Click SAVE!

### Azure Portal
- **Static Web Apps**: Custom domains configuration
- **Container Apps**: Environment variables, custom domains
- **DNS Validation**: TXT records for SSL certificates

### GitHub
- **Repository Variables**: `VITE_API_URL` for frontend builds
- **Repository Secrets**: `AZURE_STATIC_WEB_APPS_API_TOKEN`

---

## 5. Staging Environment (Recommended)

### Suggested Structure

```
Production:
  - app.yourdomain.com (frontend)
  - api.yourdomain.com (backend)

Staging:
  - staging.yourdomain.com (frontend)
  - api-staging.yourdomain.com (backend)
```

### Benefits
1. Test complete OAuth flow before production
2. Verify CSP without affecting users
3. Test migrations on separate database
4. Cost: ~$20-30/month extra (worth it!)

---

## 6. Final Pre-Deploy Checklist

### Terraform/Infrastructure
- [ ] All environment variables documented
- [ ] Secrets generated (SECRET_KEY, passwords)
- [ ] Region defined (East US, Central US, etc.)

### Google Console
- [ ] Production JavaScript Origins added
- [ ] Production Redirect URIs added
- [ ] **SAVE button clicked!**

### DNS
- [ ] CNAME for frontend configured
- [ ] CNAME for backend configured
- [ ] TXT for SSL validation (if required)

### GitHub
- [ ] `VITE_API_URL` configured in Repository Variables
- [ ] Azure secrets configured

### Code
- [ ] CSP updated with production domains
- [ ] Hardcoded URLs replaced with environment variables
- [ ] Production dependencies included

### Docker
- [ ] Image built with `:latest` tag
- [ ] Image pushed to registry

---

## 7. Deploy Commands (Quick Reference)

```bash
# 1. Build and Push Docker
docker build -t ghcr.io/<username>/<repo>/django-api:latest .
docker push ghcr.io/<username>/<repo>/django-api:latest

# 2. Apply Terraform
cd terraform
terraform plan
terraform apply

# 3. Database Migration/Seed
az containerapp exec --name <app-name> --resource-group <rg-name> --command "python manage.py migrate"
az containerapp exec --name <app-name> --resource-group <rg-name> --command "python manage.py seed_database --no-input"

# 4. View Logs
az containerapp logs show --name <app-name> --resource-group <rg-name> --follow
```

---

## 8. Lessons Learned

| Issue | Root Cause | Solution |
|-------|------------|----------|
| OAuth redirects to localhost | `FRONTEND_URL` not configured | Add to Terraform env vars |
| Maps/videos blocked | CSP missing `frame-src` | Add frame-src directive |
| 500 on registration | Missing throttle rate | Add `dj_rest_auth` rate in settings |
| Deploy size > 250MB | node_modules included | Use `.staticwebappignore` |
| API 404 errors | Wrong `VITE_API_URL` | Configure GitHub Variable |

---

**Estimated time for next deploy following this checklist: 2-3 hours** ⚡
