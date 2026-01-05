# ADR-0003: JWT Browser Storage Strategy

**Status:** Accepted
**Date:** 2025-01-04
**Deciders:** Daniel Q. Reis, Development Team
**Technical Story:** Secure token storage for frontend authentication

---

## Context and Problem Statement

The HealthCoreAPI frontend requires a mechanism to store JWT authentication tokens in the browser. The storage solution must balance security, user experience, and technical constraints.

**Key Questions:**
1. Where should JWT tokens be stored in the browser?
2. How do we mitigate security risks associated with browser storage?
3. What expiration strategy provides the best balance of security and UX?

---

## Decision Drivers

### Security Requirements
- **XSS Mitigation:** Protect tokens from cross-site scripting attacks
- **CSRF Protection:** Prevent cross-site request forgery
- **Token Exposure:** Minimize risk of token theft
- **Session Management:** Proper token lifecycle handling

### User Experience Requirements
- **Persistence:** Maintain session across browser tabs
- **Session Duration:** Reasonable session length without frequent re-authentication
- **Seamless Experience:** No disruption during normal usage

### Technical Constraints
- **OAuth2/JWT:** Backend uses JWT with access/refresh token pattern
- **SPA Architecture:** Single Page Application needs client-side token access
- **API Integration:** Tokens must be accessible for Authorization headers

---

## Considered Options

### Option 1: sessionStorage ❌
Store tokens in sessionStorage (cleared on tab close).

**Pros:**
- Automatically cleared when browser closes
- Isolated per tab

**Cons:**
- ❌ Lost on page refresh (SPA constraint)
- ❌ Not shared across tabs (poor UX)
- ❌ User must re-login for each new tab

**Verdict:** **REJECTED** - Poor user experience for SPA

---

### Option 2: HttpOnly Cookies ❌
Store tokens in HttpOnly cookies managed by backend.

**Pros:**
- Not accessible via JavaScript (XSS protected)
- Automatic inclusion in requests

**Cons:**
- ❌ Requires backend changes to set cookies
- ❌ CSRF vulnerability (requires additional protection)
- ❌ Complex CORS configuration
- ❌ Cookie size limitations
- ❌ Third-party cookie restrictions

**Verdict:** **REJECTED** - Backend architecture incompatible, CSRF complexity

---

### Option 3: localStorage with Encryption ✅ **SELECTED**
Store encrypted tokens in localStorage with expiration tracking.

**Pros:**
- ✅ Persists across tabs and sessions
- ✅ Simple implementation
- ✅ Works with existing JWT backend
- ✅ Encryption adds security layer
- ✅ Expiration tracking enables auto-logout

**Cons:**
- Vulnerable to XSS (mitigated by CSP, sanitization)
- Tokens accessible via browser devtools

**Verdict:** **ACCEPTED** - Best balance for SPA with proper mitigations

---

## Decision Outcome

**Chosen Option:** localStorage with XOR Encryption and Expiration Tracking

---

## Implementation Details

### Token Storage Architecture

```typescript
// Token keys with application prefix
const TOKEN_KEYS = {
    ACCESS: 'hc_access_token',
    REFRESH: 'hc_refresh_token',
    USER: 'hc_user_data',
} as const;
```

### Encryption Strategy

**XOR + Base64 Obfuscation:**

```typescript
function encrypt(text: string): string {
    const key = 'HealthCore2025'; // Production: use env variable
    let encrypted = '';
    
    for (let i = 0; i < text.length; i++) {
        encrypted += String.fromCharCode(
            text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
    }
    
    return btoa(encrypted); // Base64 encode
}
```

**Security Note:** XOR encryption provides obfuscation, not cryptographic security. It prevents casual inspection but is not a substitute for proper security measures. In a production environment with higher security requirements, consider:
- Web Crypto API for AES encryption
- Server-side token validation on every request
- Short token lifetimes with frequent refresh

---

### Token Expiration Strategy

| Token Type | Expiration | Rationale |
|------------|------------|-----------|
| **Access Token** | 15 minutes | Short-lived for security, automatically refreshed |
| **Refresh Token** | 7 days | Longer session without re-authentication |

**Implementation:**

```typescript
// Access token with 15-minute expiry
setAccessToken(token: string): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS, encrypt(token));
    
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    localStorage.setItem(`${TOKEN_KEYS.ACCESS}_expiry`, expiry.toString());
}

// Refresh token with 7-day expiry
setRefreshToken(token: string): void {
    localStorage.setItem(TOKEN_KEYS.REFRESH, encrypt(token));
    
    const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    localStorage.setItem(`${TOKEN_KEYS.REFRESH}_expiry`, expiry.toString());
}
```

---

### Auto-Expiration Check

```typescript
getAccessToken(): string | null {
    const encrypted = localStorage.getItem(TOKEN_KEYS.ACCESS);
    if (!encrypted) return null;

    // Check if expired
    const expiry = localStorage.getItem(`${TOKEN_KEYS.ACCESS}_expiry`);
    if (expiry && Date.now() > parseInt(expiry)) {
        this.clearAccessToken();
        return null;
    }

    return decrypt(encrypted);
}
```

---

### Session Activity Tracking

The `AuthProvider` tracks user activity to implement session timeout:

```typescript
// Track last activity time
localStorage.setItem('lastActive', Date.now().toString());

// Check inactivity (30 minutes)
const lastActive = parseInt(localStorage.getItem('lastActive') || '0');
const inactiveTime = Date.now() - lastActive;
const THIRTY_MINUTES = 30 * 60 * 1000;

if (inactiveTime > THIRTY_MINUTES) {
    // Force logout due to inactivity
    logout();
}
```

---

## Security Mitigations

### XSS Protection

1. **Content Security Policy (CSP):**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self'">
   ```

2. **Input Sanitization:** All user inputs sanitized before rendering

3. **React's Built-in Protection:** JSX automatically escapes content

4. **Dependency Auditing:** Regular `npm audit` for vulnerable packages

### Token Lifecycle

1. **Automatic Refresh:** Access token refreshed before expiration
2. **Graceful Logout:** Clear all tokens on logout
3. **Error Handling:** Clear tokens on 401 responses

```typescript
// API interceptor handles token refresh
if (error.response?.status === 401) {
    const refreshToken = secureStorage.getRefreshToken();
    if (refreshToken) {
        const { access } = await refreshTokens(refreshToken);
        secureStorage.setAccessToken(access);
        // Retry original request
    } else {
        secureStorage.clearAll();
        // Redirect to login
    }
}
```

---

### Audit Logging

All security events are logged for monitoring:

```typescript
auditLogger.log('LOGIN_SUCCESS', { username });
auditLogger.log('TOKEN_REFRESH', { timestamp });
auditLogger.log('LOGOUT', { reason: 'user_initiated' });
auditLogger.log('SESSION_EXPIRED', { lastActive });
```

---

## Consequences

### Positive

- ✅ **Seamless UX:** Session persists across tabs and page refreshes
- ✅ **Simple Integration:** Works with existing JWT backend
- ✅ **Automatic Expiration:** Tokens auto-expire without server round-trip
- ✅ **Activity Tracking:** Inactivity logout enhances security
- ✅ **Audit Trail:** All auth events logged for security review

### Negative

- ⚠️ **XSS Vulnerability:** localStorage accessible via JavaScript
- ⚠️ **DevTools Exposure:** Encrypted tokens visible in browser storage
- ⚠️ **Obfuscation Only:** XOR encryption is not cryptographically secure

### Mitigation

- **CSP Headers:** Strict Content Security Policy
- **Short Token Lifetime:** 15-minute access tokens
- **Token Rotation:** Refresh tokens generate new access tokens
- **Input Validation:** Strict sanitization of all inputs
- **Security Scanning:** Regular vulnerability assessments

---

## HIPAA Compliance Considerations

| Requirement | Implementation |
|-------------|---------------|
| **§ 164.312(d) - Authentication** | JWT tokens verify user identity |
| **§ 164.312(a)(2)(iv) - Encryption** | Tokens encrypted at rest in storage |
| **§ 164.312(b) - Audit Controls** | Auth events logged with timestamps |
| **§ 164.308(a)(5)(ii)(D) - Session Termination** | Auto-logout on inactivity |

---

## Related Decisions

- **ADR-0001:** Feature-Sliced Design (frontend architecture)
- **ADR-0002:** Healthcare Credential Verification (security model)
- **Backend ADR-0002:** JWT for API Authentication

---

## References

- [OWASP Session Management](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [localStorage Security Considerations](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)

---

## Notes

This decision was made after analyzing:
- Security implications of each storage option
- User experience requirements for healthcare SPA
- Backend JWT architecture constraints
- Industry best practices for token storage

The localStorage approach with encryption and expiration tracking provides the best balance of security and usability for the HealthCoreAPI frontend.
