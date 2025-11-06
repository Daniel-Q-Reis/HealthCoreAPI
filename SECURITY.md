# Security Policy

## 🛡️ Our Commitment

HealthCoreAPI is designed as an enterprise-grade healthcare management system with **patient safety** and **data security** as top priorities. We take security vulnerabilities seriously and appreciate the security community's efforts in responsible disclosure.

---

## 📋 Supported Versions

Security updates are provided for the following versions:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 0.1.x   | :white_check_mark: | Active Development |

**Note**: This is currently a demonstration/portfolio project. For production deployment, conduct a comprehensive security audit and penetration testing.

---

## 🚨 Reporting a Vulnerability

### Responsible Disclosure

If you discover a security vulnerability, please help us by **responsibly disclosing** it.

**DO NOT**:
- ❌ Open a public GitHub issue for security vulnerabilities
- ❌ Discuss the vulnerability in public forums or social media
- ❌ Exploit the vulnerability beyond minimal verification

**DO**:
- ✅ Email security concerns privately to: **danielqreis@gmail.com**
- ✅ Provide detailed information to help us understand and reproduce
- ✅ Allow reasonable time for us to address the issue before public disclosure

### What to Include

Please provide the following information:

```
Subject: [SECURITY] Brief description of vulnerability

1. **Vulnerability Type**: (e.g., SQL Injection, XSS, Authentication Bypass)

2. **Affected Component**: (e.g., Authentication system, Patient data API)

3. **Impact Assessment**:
   - Confidentiality impact (none/low/medium/high)
   - Integrity impact (none/low/medium/high)
   - Availability impact (none/low/medium/high)

4. **Steps to Reproduce**:
   Step 1: ...
   Step 2: ...
   Expected result: ...
   Actual result: ...

5. **Proof of Concept** (if applicable):
   Code snippet, curl command, or screenshots

6. **Suggested Fix** (if you have one):
   Description or code snippet

7. **Your Details** (optional):
   Name:
   Affiliation:
   Would you like to be credited in acknowledgments? (Yes/No)
```

---

## ⏱️ Response Timeline

We are committed to responding promptly to security reports:

| Timeline | Action |
|----------|--------|
| **24 hours** | Initial acknowledgment of your report |
| **7 days** | Preliminary assessment and severity classification |
| **30 days** | Fix developed, tested, and ready for deployment |
| **45 days** | Public disclosure coordination (if applicable) |

**Note**: Complex vulnerabilities may require additional time. We will keep you informed of progress.

---

## 🔐 Security Measures in Place

HealthCoreAPI implements multiple layers of security controls:

### Authentication & Authorization

- **JWT-based authentication** with 60-minute access token lifetime
- **Token rotation** with refresh token blacklisting after rotation
- **Role-Based Access Control (RBAC)** on all API endpoints
- **Rate limiting**: 100 requests/hour for anonymous users, 1000 requests/hour for authenticated users
- **Password security**: Django's built-in password validators and hashing (PBKDF2)

**Reference**: [CCP-1: Authentication & Authorization](docs/CRITICAL_CONTROL_POINTS.md#ccp-1-authentication--authorization-system)

### Data Protection

- **Database-level integrity**: PostgreSQL ACID compliance with atomic transactions
- **Soft-delete pattern**: Complete audit trail preservation, no hard deletes
- **Foreign key constraints**: Prevent orphaned records and maintain referential integrity
- **Input validation**: Django ORM and Django REST Framework serializer validation
- **Timestamp tracking**: Automatic created_at/updated_at for all records

**Reference**: [CCP-2: Patient Data Integrity](docs/CRITICAL_CONTROL_POINTS.md#ccp-2-patient-data-integrity-layer)

### Application Security

- **SQL Injection prevention**: Django ORM with parameterized queries
- **XSS prevention**: Django template auto-escaping and Content Security Policy headers
- **CSRF protection**: Django CSRF middleware enabled
- **Clickjacking protection**: X-Frame-Options: DENY header
- **MIME-type sniffing prevention**: X-Content-Type-Options: nosniff header

**Reference**: `src/healthcoreapi/settings/base.py` security configuration

### Operational Security

- **Error monitoring**: Sentry integration for real-time error tracking
- **Security logging**: Comprehensive audit trail with JSON-formatted logs
- **Dependency scanning**: Automated with Safety in CI/CD pipeline
- **Code security scanning**: Automated with Bandit in CI/CD pipeline
- **Container security**: Non-root containers with minimal attack surface

**Reference**: `.github/workflows/ci.yml` security scanning

---

## 🎯 Critical Control Points (CCPs)

The following areas have been identified as **Critical Control Points** where security failures could have severe consequences:

### CCP-1: Authentication & Authorization
**Risk**: Unauthorized access to Protected Health Information (PHI/ePHI)
**Controls**: JWT authentication, RBAC, rate limiting, Sentry monitoring
**Protection Level**: 95% ✅

### CCP-2: Patient Data Integrity
**Risk**: Data corruption, loss, or unauthorized modification
**Controls**: ACID transactions, FK constraints, soft-delete, timestamps
**Protection Level**: 90% ✅

### CCP-3: Admissions & Bed Management
**Risk**: Double-booking leading to patient safety incidents
**Controls**: OneToOne constraints, circuit breakers, atomic operations
**Protection Level**: 85% ✅

### CCP-4: Scheduling System
**Risk**: Appointment conflicts and revenue leakage
**Controls**: Idempotency middleware, DB constraints, service validation
**Protection Level**: 100% 🏆

**Full Analysis**: [docs/CRITICAL_CONTROL_POINTS.md](docs/CRITICAL_CONTROL_POINTS.md)

---

## 🔍 Known Security Considerations

### Development Environment

⚠️ **Default credentials**: Development uses default admin credentials (`admin/admin123`)
**Mitigation**: Change immediately in production via `make superuser`

⚠️ **DEBUG mode**: Enabled in development, exposes stack traces
**Mitigation**: Always deploy with `DEBUG=False` in production

⚠️ **ALLOWED_HOSTS**: Set to `*` in development
**Mitigation**: Configure specific domains in production settings

### Production Deployment

When deploying to production, ensure:

```
# src/healthcoreapi/settings/production.py
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'api.yourdomain.com']
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### Healthcare Compliance

⚠️ **HIPAA Compliance**: This project demonstrates HIPAA-ready patterns but is **not certified**
**Action Required**: Conduct formal HIPAA security risk assessment before production use with real patient data

⚠️ **PHI Protection**: Development uses mock data only
**Action Required**: Implement additional PHI safeguards per organizational BAA requirements

---

## 🛠️ Security Best Practices

### For Contributors

1. **Never commit secrets**:
   - No API keys, passwords, or tokens in code
   - Use `.env` files (gitignored) for local secrets
   - Use environment variables for production secrets

2. **Input validation**:
   - Always validate user input at API boundaries
   - Use Django REST Framework serializers
   - Never construct SQL queries manually

3. **Authentication required**:
   - All endpoints must require authentication by default
   - Use `permission_classes = [IsAuthenticated]`
   - Only explicitly mark public endpoints as such

4. **Sensitive data logging**:
   - Never log passwords, tokens, or PHI
   - Scrub sensitive data before logging
   - Use structured logging with appropriate levels

### For Deployers

1. **Environment variables**:
   ```
   # Required production variables
   SECRET_KEY=<generate-strong-key>
   DEBUG=False
   ALLOWED_HOSTS=yourdomain.com
   DATABASE_URL=postgres://...
   SENTRY_DSN=https://...
   ```

2. **HTTPS enforcement**:
   - Use SSL/TLS certificates (Let's Encrypt, etc.)
   - Configure `SECURE_SSL_REDIRECT=True`
   - Enable HSTS with `SECURE_HSTS_SECONDS=31536000`

3. **Database security**:
   - Use strong database passwords
   - Restrict database access to application only
   - Enable database connection encryption
   - Regular backups with encryption at rest

4. **Container security**:
   - Run containers as non-root user
   - Use minimal base images
   - Keep dependencies updated
   - Scan images for vulnerabilities

---

## 🔒 Dependency Management

### Automated Security Scanning

We use automated tools to detect vulnerabilities:

- **Safety**: Checks Python dependencies against CVE database
- **Bandit**: Static analysis security testing for Python code
- **GitHub Dependabot**: Automated dependency updates

### Manual Security Audits

Recommended frequency for production deployments:

| Audit Type | Frequency | Scope |
|------------|-----------|-------|
| **Dependency scan** | Weekly | All Python packages |
| **Code security review** | Per major release | New/changed code |
| **Penetration testing** | Quarterly | Full application |
| **HIPAA assessment** | Annually | Complete security posture |

---

## 📞 Contact Information

### Security Team

**Primary Contact**: Daniel de Queiroz Reis
**Email**: danielqreis@gmail.com
**Response Time**: Within 24 hours for security issues

### Emergency Contacts

For critical security incidents affecting production systems:
- **Email**: danielqreis@gmail.com (Subject: [URGENT SECURITY])
- **Expected Response**: Within 4 hours during business hours

---

## 📚 Additional Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **HIPAA Security Rule**: https://www.hhs.gov/hipaa/for-professionals/security/
- **Django Security**: https://docs.djangoproject.com/en/stable/topics/security/
- **Python Security**: https://python.org/dev/security/

---

## 🏆 Security Hall of Fame

We recognize security researchers who responsibly disclose vulnerabilities:

*No vulnerabilities reported yet*

If you report a security vulnerability, you may be acknowledged here (with your permission).

---

## ⚖️ Disclosure Policy

### Public Disclosure

After a security issue is resolved, we will:

1. **Coordinate with reporter**: Agree on disclosure timeline
2. **Publish security advisory**: GitHub Security Advisory
3. **Credit researcher**: In advisory and this document (with permission)
4. **Document fix**: In changelog and release notes

### Timeline

- **Private disclosure**: Immediate upon discovery
- **Fix development**: Up to 30 days
- **Public disclosure**: 45 days after initial report (or after fix deployment)

---

**Last Updated**: November 6, 2025
**Version**: 1.0
**Document Owner**: Daniel de Queiroz Reis

---

**Thank you for helping keep HealthCoreAPI secure!** 🔒🏥
```
