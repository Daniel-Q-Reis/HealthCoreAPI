# ADR-0005: Pybreaker for Circuit Breaker Pattern

**Status:** Accepted
**Date:** 2025-10-22

## Context

Our system will integrate with various internal and external services. These dependencies can fail or experience high latency, and these failures can cascade, degrading the stability of our entire application. We need a mechanism to isolate failures and allow downstream services time to recover without overwhelming them with repeated requests.

## Decision

We will implement the **Circuit Breaker** pattern to improve the resilience of our service-to-service communication.

The chosen library for this implementation is **`pybreaker`**. It is a well-maintained, lightweight, and thread-safe library that provides a simple and effective implementation of the pattern.

**Strategy:**
1.  A circuit breaker will be instantiated per critical external call or internal service interaction.
2.  Breakers will be configured with sensible defaults for `fail_max` (number of failures before opening) and `reset_timeout` (cooldown period before transitioning to half-open).
3.  When a breaker is "open," calls to the protected service will fail immediately without attempting a network request, returning a cached or default error response. This prevents cascading failures and allows the downstream service to recover.

## Consequences

**Positive:**
- **Improved Fault Tolerance:** Prevents a single failing component from taking down the entire system.
- **Fast Failures:** When a dependency is known to be unhealthy, the system fails fast instead of waiting for timeouts, improving user experience and freeing up resources.
- **Automatic Recovery:** The pattern includes a "half-open" state that allows the system to automatically detect when a downstream service has recovered.

**Negative:**
- **Added Complexity:** Introduces state management (the state of the circuit breaker) into the application logic.
- **Configuration Overhead:** Each circuit breaker needs to be configured and tuned appropriately for the service it protects.
