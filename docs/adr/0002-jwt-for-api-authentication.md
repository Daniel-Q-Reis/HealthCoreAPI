# ADR-0002: JWT for API Authentication

**Status:** Accepted
**Date:** 2025-10-22

## Context

The API needs a secure, stateless, and scalable authentication mechanism suitable for a variety of clients, including single-page applications (SPAs), mobile apps, and server-to-server integrations. Traditional session-based authentication can introduce statefulness and complexity in a distributed or horizontally-scaled environment.

## Decision

We will use **JSON Web Tokens (JWT)** for API authentication, implemented via the `djangorestframework-simplejwt` library.

The flow is as follows:
1. A client sends credentials (username/password) to a dedicated token endpoint (`/api/v1/token/`).
2. The server validates the credentials and returns a short-lived `access_token` and a long-lived `refresh_token`.
3. The client sends the `access_token` in the `Authorization` header for all subsequent requests to protected endpoints.
4. When the `access_token` expires, the client uses the `refresh_token` to obtain a new pair of tokens without requiring the user to log in again.

## Consequences

**Positive:**
- **Statelessness:** The server does not need to store token information, making it easy to scale horizontally.
- **Broad Client Support:** JWT is a widely adopted standard supported by virtually all modern clients and platforms.
- **Decoupling:** Authentication is decoupled from the application's session management.

**Negative:**
- **Token Storage:** The client is responsible for securely storing the JWTs (e.g., in `localStorage` or `HttpOnly` cookies).
- **Invalidation:** JWTs are inherently difficult to invalidate before their expiration. While `simplejwt` provides a blacklist mechanism, this reintroduces a degree of statefulness.
