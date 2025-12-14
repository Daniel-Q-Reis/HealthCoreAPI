# Grafana Dashboards Guide

## Overview

Grafana is a visualization and analytics platform that displays metrics from Prometheus in beautiful, interactive dashboards. It provides real-time monitoring of HealthCoreAPI performance and health.

---

## Accessing Grafana

**URL**: http://localhost:3000

**Default Credentials**:
- **Username**: `admin`
- **Password**: `admin`

> **Note**: On first login, Grafana will prompt you to change the password. You can skip this in development.

---

## Pre-configured Dashboards

### Django HealthCore Metrics
**Location**: Dashboards → Django HealthCore Metrics

**Panels**:
1. **Request Rate** - Requests per second by HTTP method
2. **Average Response Time** - Latency gauge with color thresholds
3. **Error Rates** - 4xx and 5xx errors over time
4. **Database Queries** - Query count trends

**Auto-refresh**: Every 5 seconds
**Time Range**: Last 15 minutes

---

## Creating Custom Dashboards

### Step 1: Create New Dashboard
1. Click **+** (Create) → **Dashboard**
2. Click **Add visualization**
3. Select **Prometheus** as datasource

### Step 2: Add Panel
1. Enter PromQL query in query editor
2. Choose visualization type (Time series, Gauge, Stat, etc.)
3. Configure panel options (title, legend, thresholds)
4. Click **Apply**

### Step 3: Save Dashboard
1. Click **Save dashboard** (disk icon)
2. Enter dashboard name and folder
3. Click **Save**

---

## Common Visualizations

### Time Series Graph
**Best for**: Request rates, error rates, trends

**Example Query**:
```promql
rate(django_http_requests_total_by_method_total[5m])
```

**Configuration**:
- Visualization: Time series
- Legend: `{{method}}`
- Unit: `reqps` (requests per second)

---

### Gauge
**Best for**: Current values with thresholds

**Example Query**:
```promql
django_http_requests_latency_seconds_by_view_method_sum /
django_http_requests_latency_seconds_by_view_method_count * 1000
```

**Configuration**:
- Visualization: Gauge
- Unit: `ms` (milliseconds)
- Thresholds:
  - Green: 0-100ms
  - Yellow: 100-500ms
  - Red: 500ms+

---

### Stat Panel
**Best for**: Single value metrics

**Example Query**:
```promql
sum(django_http_requests_total_by_method_total)
```

**Configuration**:
- Visualization: Stat
- Calculation: Last (not null)
- Unit: `short`

---

### Table
**Best for**: Multiple metrics comparison

**Example Queries**:
```promql
# Query A
sum by (view) (rate(django_http_requests_total_by_view_transport_method_total[5m]))

# Query B
avg by (view) (django_http_requests_latency_seconds_by_view_method_sum /
               django_http_requests_latency_seconds_by_view_method_count)
```

**Configuration**:
- Visualization: Table
- Transform: Merge queries
- Columns: View, Request Rate, Avg Latency

---

## Dashboard Features

### Variables
Create dynamic dashboards with template variables:

1. **Dashboard settings** → **Variables** → **Add variable**
2. **Type**: Query
3. **Data source**: Prometheus
4. **Query**: `label_values(django_http_requests_total_by_view_transport_method_total, view)`
5. **Use in queries**: `$view`

**Example**:
```promql
rate(django_http_requests_total_by_view_transport_method_total{view="$view"}[5m])
```

---

### Annotations
Mark events on graphs:

1. **Dashboard settings** → **Annotations** → **Add annotation query**
2. **Data source**: Prometheus
3. **Query**: Deployment events, incidents, etc.

---

### Alerts
Set up alerts for critical metrics:

1. **Edit panel** → **Alert** tab
2. **Create alert rule**
3. **Condition**: e.g., `avg() > 500` (latency > 500ms)
4. **Notification**: Email, Slack, PagerDuty, etc.

---

## Useful Dashboard Patterns

### RED Metrics (Recommended)
**R**ate, **E**rrors, **D**uration

```promql
# Rate
sum(rate(django_http_requests_total_by_method_total[5m]))

# Errors
sum(rate(django_http_responses_total_by_status_total{status=~"[45].."}[5m]))

# Duration (p95)
histogram_quantile(0.95, django_http_requests_latency_seconds_by_view_method_bucket)
```

---

### USE Metrics (Resources)
**U**tilization, **S**aturation, **E**rrors

```promql
# Utilization (CPU, Memory - requires node_exporter)
# Saturation (Queue depth, connection pool)
# Errors (Database errors, cache misses)
```

---

## Configuration

### Datasource
Located in `grafana/provisioning/datasources/prometheus.yml`:

```yaml
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
```

### Dashboard Provisioning
Located in `grafana/provisioning/dashboards/`:

- `dashboard.yml` - Provider configuration
- `django-metrics.json` - Dashboard definition

**Auto-reload**: Dashboards update automatically when JSON changes.

---

## Exporting and Sharing

### Export Dashboard
1. **Dashboard settings** → **JSON Model**
2. Copy JSON or **Save to file**
3. Share JSON with team

### Import Dashboard
1. **+** (Create) → **Import**
2. **Upload JSON file** or **Paste JSON**
3. Select datasource
4. Click **Import**

### Share Snapshot
1. **Share dashboard** (icon) → **Snapshot**
2. Set expiration time
3. **Publish to snapshots.raintank.io** or **Local snapshot**
4. Share URL

---

## Troubleshooting

### No Data in Panels
1. Check Prometheus datasource: **Configuration → Data sources → Prometheus → Test**
2. Verify query syntax in **Explore** tab
3. Check time range (top-right)
4. Verify Prometheus has data: http://localhost:9090

### Dashboard Not Loading
1. Check Grafana logs: `docker-compose logs grafana`
2. Verify provisioning files are valid YAML/JSON
3. Restart Grafana: `docker-compose restart grafana`

### Slow Performance
1. Reduce time range
2. Increase refresh interval
3. Simplify queries (use recording rules in Prometheus)
4. Limit number of panels per dashboard

---

## Best Practices

### 1. Organize Dashboards
- Create folders for different services
- Use consistent naming conventions
- Tag dashboards appropriately

### 2. Design for Clarity
- Limit panels to 6-8 per dashboard
- Use meaningful titles and descriptions
- Choose appropriate visualization types
- Set sensible thresholds

### 3. Optimize Queries
- Use recording rules for complex queries
- Avoid `*` wildcards
- Use label filters to reduce cardinality

### 4. Document Dashboards
- Add text panels with explanations
- Include links to runbooks
- Document alert thresholds

---

## Advanced Features

### Templating
Create dynamic dashboards with variables:
- **Query variables**: From Prometheus labels
- **Custom variables**: Hardcoded values
- **Interval variables**: Auto-adjust based on time range

### Transformations
Modify query results:
- **Merge**: Combine multiple queries
- **Filter by value**: Show only specific values
- **Organize fields**: Rename, hide, reorder columns

### Plugins
Extend Grafana functionality:
```bash
# Install plugin
docker-compose exec grafana grafana-cli plugins install <plugin-name>
docker-compose restart grafana
```

---

## Production Considerations

### Security
- Change default admin password
- Enable HTTPS
- Configure authentication (OAuth, LDAP, SAML)
- Set up role-based access control (RBAC)

### High Availability
- Use external database (PostgreSQL, MySQL)
- Configure session storage (Redis)
- Set up load balancing

### Backup
```bash
# Backup Grafana data
docker-compose exec grafana grafana-cli admin export-dashboard

# Backup volume
docker run --rm -v healthcoreapi_grafana-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/grafana-backup.tar.gz /data
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save dashboard |
| `Ctrl+H` | Toggle dashboard settings |
| `Ctrl+F` | Search dashboards |
| `d+k` | Toggle kiosk mode |
| `d+e` | Expand/collapse row |
| `d+s` | Dashboard settings |

---

## Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)
- [Prometheus Datasource](https://grafana.com/docs/grafana/latest/datasources/prometheus/)
- [Community Dashboards](https://grafana.com/grafana/dashboards/)

---

## Quick Reference

| Task | Location |
|------|----------|
| Access UI | http://localhost:3000 |
| Login | admin / admin |
| View dashboards | Dashboards menu |
| Create dashboard | + → Dashboard |
| Explore metrics | Explore (compass icon) |
| Data sources | Configuration → Data sources |
| Alerts | Alerting menu |
| Plugins | Configuration → Plugins |

---

**Last Updated**: 2025-12-14
**Version**: 1.0
