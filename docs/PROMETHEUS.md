# Prometheus Monitoring Guide

## Overview

Prometheus is a time-series database and monitoring system that collects metrics from HealthCoreAPI. It scrapes the `/metrics` endpoint exposed by `django-prometheus` and stores the data for querying and visualization.

---

## Accessing Prometheus

**URL**: http://localhost:9090

No authentication required in development.

---

## Key Features

### 1. Metrics Explorer
- Navigate to **Graph** tab
- Enter PromQL queries
- Visualize metrics over time

### 2. Targets
- Navigate to **Status → Targets**
- Verify Django target is **UP**
- Check last scrape time and status

### 3. Service Discovery
- Navigate to **Status → Service Discovery**
- View discovered services

---

## Available Metrics

### HTTP Requests
```promql
# Total requests by method
django_http_requests_total_by_method_total

# Request rate (requests per second)
rate(django_http_requests_total_by_method_total[5m])

# Requests by view
django_http_requests_total_by_view_transport_method_total
```

### Response Times
```promql
# Average latency in milliseconds
django_http_requests_latency_seconds_by_view_method_sum /
django_http_requests_latency_seconds_by_view_method_count * 1000

# 95th percentile latency
histogram_quantile(0.95, django_http_requests_latency_seconds_by_view_method_bucket)
```

### HTTP Status Codes
```promql
# 2xx responses
django_http_responses_total_by_status_total{status=~"2.."}

# 4xx errors
django_http_responses_total_by_status_total{status=~"4.."}

# 5xx errors
django_http_responses_total_by_status_total{status=~"5.."}

# Error rate
rate(django_http_responses_total_by_status_total{status=~"[45].."}[5m])
```

### Database
```promql
# Query count
django_db_query_count

# Query duration
django_db_query_duration_seconds
```

### Cache
```promql
# Cache hits
django_cache_get_hits_total

# Cache misses
django_cache_get_misses_total

# Cache hit ratio
django_cache_get_hits_total /
(django_cache_get_hits_total + django_cache_get_misses_total)
```

### Celery (if configured)
```promql
# Task count
django_celery_task_total

# Task duration
django_celery_task_duration_seconds
```

---

## Common Queries

### Request Rate by Endpoint
```promql
sum by (view) (rate(django_http_requests_total_by_view_transport_method_total[5m]))
```

### Top 5 Slowest Endpoints
```promql
topk(5,
  django_http_requests_latency_seconds_by_view_method_sum /
  django_http_requests_latency_seconds_by_view_method_count
)
```

### Error Rate Percentage
```promql
sum(rate(django_http_responses_total_by_status_total{status=~"[45].."}[5m])) /
sum(rate(django_http_responses_total_by_status_total[5m])) * 100
```

### Database Queries per Request
```promql
rate(django_db_query_count[5m]) /
rate(django_http_requests_total_by_method_total[5m])
```

---

## Configuration

### Scrape Configuration
Located in `prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'django'
    metrics_path: '/metrics'
    scrape_interval: 15s
    static_configs:
      - targets: ['web:8000']
        labels:
          service: 'healthcore-api'
```

### Data Retention
Default: 15 days

To change, modify `docker-compose.yml`:
```yaml
command:
  - '--storage.tsdb.retention.time=30d'
```

---

## Troubleshooting

### Target is DOWN
1. Check Django is running: `docker-compose ps web`
2. Verify `/metrics` endpoint: `curl http://localhost:8000/metrics`
3. Check Prometheus logs: `docker-compose logs prometheus`

### No Data Showing
1. Verify scrape interval hasn't passed yet (wait 15s)
2. Check target status in Prometheus UI
3. Verify PromQL query syntax

### High Memory Usage
1. Reduce retention period
2. Decrease scrape frequency
3. Add volume limits in docker-compose

---

## Best Practices

### 1. Use Rate Functions
Always use `rate()` or `irate()` for counters:
```promql
# Good
rate(django_http_requests_total_by_method_total[5m])

# Bad (raw counter)
django_http_requests_total_by_method_total
```

### 2. Aggregate with Labels
Use `sum by` to group metrics:
```promql
sum by (method) (rate(django_http_requests_total_by_method_total[5m]))
```

### 3. Set Appropriate Time Ranges
- Real-time monitoring: `[1m]` to `[5m]`
- Trend analysis: `[1h]` to `[24h]`

---

## Integration with Grafana

Prometheus is automatically configured as a datasource in Grafana. See [GRAFANA.md](GRAFANA.md) for dashboard creation.

---

## Production Considerations

### Security
- Enable authentication
- Use TLS for scraping
- Restrict network access

### Scalability
- Use remote storage (Thanos, Cortex)
- Implement federation for multiple instances
- Configure alerting rules

### Monitoring
- Set up alerts for Prometheus itself
- Monitor scrape duration
- Track storage usage

---

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [django-prometheus](https://github.com/korfuri/django-prometheus)
- [Best Practices](https://prometheus.io/docs/practices/naming/)

---

## Quick Reference

| Task | Command/URL |
|------|-------------|
| Access UI | http://localhost:9090 |
| Check targets | Status → Targets |
| Query metrics | Graph tab |
| View config | Status → Configuration |
| Check health | http://localhost:9090/-/healthy |
| Reload config | `docker-compose restart prometheus` |

---

**Last Updated**: 2025-12-14
**Version**: 1.0
