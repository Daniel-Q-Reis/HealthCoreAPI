# ADR-0003: Celery and Redis for Asynchronous Tasks and Caching

**Status:** Accepted
**Date:** 2025-10-22

## Context

The application will have operations that are too long to run within a synchronous web request (e.g., generating large reports, sending bulk notifications). Additionally, we need a robust caching mechanism to improve performance and reduce database load.

## Decision

1.  **Asynchronous Tasks:** We will use **Celery** as the distributed task queue. It is a mature, feature-rich, and widely-used standard in the Django ecosystem.
2.  **Message Broker & Cache Backend:** We will use **Redis** to serve as both the Celery message broker and the Django cache backend (`django-redis`). Using a single, powerful in-memory data store for both purposes simplifies the infrastructure stack in the early stages of the project.
3.  **Scheduled Tasks:** We will use `django-celery-beat` to manage periodic tasks directly from the Django admin, allowing for dynamic and database-backed scheduling.

## Consequences

**Positive:**
- **Improved Responsiveness:** Long-running tasks are offloaded to background workers, keeping the API responsive.
- **Scalability:** Celery workers can be scaled independently of the web application.
- **Unified Infrastructure:** Using Redis for both caching and message brokering reduces operational complexity and resource footprint initially.
- **Powerful Scheduling:** `django-celery-beat` provides a flexible and user-friendly way to manage cron-like jobs.

**Negative:**
- **Increased Complexity:** Adds two major components (Celery, Redis) to the stack that require monitoring and management.
- **Potential for Bottleneck:** While efficient, using a single Redis instance for multiple critical functions could become a bottleneck at very high scale. This can be mitigated later by splitting into separate Redis instances.
