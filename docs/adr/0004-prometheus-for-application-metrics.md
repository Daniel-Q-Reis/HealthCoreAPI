# ADR-0004: Prometheus for Application Metrics

**Status:** Accepted
**Date:** 2025-10-22

## Context

To build an enterprise-grade, observable system, we must export key performance and operational metrics from the application. This data is essential for monitoring, alerting, and performance analysis, forming the basis of our Service Level Objectives (SLOs). The chosen solution should be a widely adopted industry standard.

## Decision

We will adopt the **Prometheus** monitoring system as our standard for metrics. The application will expose a `/metrics` endpoint in the Prometheus exposition format.

This is implemented using the `django-prometheus` library, which provides a rich set of default metrics out-of-the-box, including:
- Request latency and counts.
- Database connection and query performance.
- Cache performance.
- Model-level metrics (e.g., inserts, updates, deletes per model).

Custom business-level metrics (e.g., patient admissions per hour) will be added as the application evolves.

## Consequences

**Positive:**
- **Industry Standard:** Prometheus is the de facto standard for cloud-native monitoring.
- **Rich Ecosystem:** Integrates seamlessly with tools like Grafana for visualization and Alertmanager for alerting.
- **Out-of-the-Box Value:** `django-prometheus` provides immediate, valuable insights into application performance with minimal configuration.
- **Extensibility:** The framework for adding custom business metrics is straightforward.

**Negative:**
- **Pull-Based Model:** Prometheus operates on a pull model, meaning it needs network access to the application's `/metrics` endpoint. This must be considered in network policies and security configurations.
