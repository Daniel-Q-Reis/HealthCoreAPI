# ADR-0019: MongoDB for Audit Service (Azure Deployment)

**Status:** Accepted
**Date:** 2026-01-21
**Deciders:** Daniel de Queiroz Reis (Lead Developer)
**Related ADRs:** [ADR-0016](0016-audit-microservice-go.md), [ADR-0018](0018-azure-container-apps-deployment.md)

## Context

The Go Audit Service was initially implemented with AWS DynamoDB for local development (ADR-0016). With the strategic decision to deploy on Azure (ADR-0018), we need to select an appropriate database for production that aligns with:

1. **Career Development ROI** - Technologies valued in the international job market
2. **Azure Integration** - Seamless integration with Azure managed services
3. **Production Readiness** - Reliable, scalable, and production-grade
4. **Cost Efficiency** - Manageable costs within Azure credit budget

### Job Market Analysis

Research of international job postings (LinkedIn, Indeed, Stack Overflow Jobs) revealed:
- **MongoDB:** 15-20x more job openings than DynamoDB
- **Azure Cosmos DB:** Native Azure service with MongoDB API compatibility
- **Managed NoSQL:** Strong demand for cloud-native NoSQL experience

### Current Implementation

**DynamoDB Local (Development):**
```go
type AuditLog struct {
    TargetID  string `dynamodbav:"target_id"` // Partition Key
    Timestamp string `dynamodbav:"timestamp"` // Sort Key (ISO8601)
    // ... other fields
}
```

**Limitations for Azure:**
- No native Azure DynamoDB equivalent
- Would require running DynamoDB on VMs (anti-pattern for managed services)
- Miss opportunity to learn Azure Cosmos DB
- Limited career value compared to MongoDB

## Decision

**We will migrate the Audit Service from DynamoDB to MongoDB (Azure Cosmos DB with MongoDB API).**

### Implementation Strategy

1. **Local Development:** MongoDB 7.0 container
2. **Azure Production:** Cosmos DB for MongoDB (RU-based autoscale)
3. **Connection String:** Single `MONGODB_URI` environment variable
4. **Data Model:** Native MongoDB with BSON serialization

### Code Changes

**New MongoDB Repository:**
```go
type AuditLog struct {
    EventID      string    `bson:"event_id"`
    TargetID     string    `bson:"target_id"`     // Indexed
    Timestamp    time.Time `bson:"timestamp"`     // Native time.Time
    ActorID      string    `bson:"actor_id"`
    Action       string    `bson:"action"`
    ResourceType string    `bson:"resource_type"`
    IPAddress    string    `bson:"ip_address"`
    Details      string    `bson:"details"`
}
```

**Key Improvements:**
- ✅ Native `time.Time` instead of ISO8601 strings
- ✅ Compound indexes: `(target_id, timestamp)` for sorted queries
- ✅ BSON serialization (more efficient than JSON)
- ✅ MongoDB aggregation pipeline ready (future analytics)

## Consequences

### Positive

1. **Career Development ⭐⭐⭐⭐⭐**
   - MongoDB on resume (15-20x more job opportunities)
   - Azure Cosmos DB experience (cloud-native NoSQL)
   - Managed services expertise (DevOps/SRE value)

2. **Azure Integration 🔧**
   - Native Azure service (Cosmos DB for MongoDB)
   - Seamless authentication with Managed Identity
   - Built-in monitoring via Azure Monitor
   - Auto-scaling with Request Units (RUs)

3. **Production Features 🚀**
   - Global distribution (multi-region replication)
   - 99.999% SLA availability
   - Point-in-time restore (backup/recovery)
   - Automatic indexing and tuning

4. **Development Experience 💻**
   - Better local development (MongoDB Compass GUI)
   - Rich query language (aggregation pipelines)
   - Native driver support (official `mongo-driver`)
   - Excellent documentation and community

### Negative

1. **Learning Curve** (Mitigated)
   - Team needs to learn MongoDB query syntax
   - **Mitigation:** Well-documented, similar to DynamoDB concepts

2. **Migration Effort** (Completed)
   - Rewrite repository layer
   - **Status:** ✅ DONE - 156 lines of clean MongoDB code

3. **Cost Considerations**
   - Cosmos DB RU pricing can be higher than DynamoDB
   - **Mitigation:** Start with 400 RU/s autoscale (~$24/month)
   - Can optimize with TTL, indexing policies, and query patterns

### Neutral

- **Data Model:** Very similar to DynamoDB (key-value with secondary indexes)
- **Performance:** Comparable for audit log use case (write-heavy, simple queries)
- **Operational:** Both are managed services (no server maintenance)

## Azure Cosmos DB Configuration

### Development (docker-compose)
```yaml
mongodb:
  image: mongo:7.0
  ports:
    - "27017:27017"
  volumes:
    - mongodb-data:/data/db
  environment:
    - MONGO_INITDB_DATABASE=audit_logs
```

### Production (Azure - Planned)
- **Service:** Azure Cosmos DB for MongoDB (vCore or RU-based)
- **Initial Tier:** Serverless or 400 RU/s autoscale
- **Region:** Same as Container Apps (latency optimization)
- **Backup:** Automatic (7-day retention)
- **Monitoring:** Azure Monitor + Application Insights

## Alternatives Considered

### 1. Keep DynamoDB on VMs ❌
- **Pros:** No code changes
- **Cons:**
  - Anti-pattern (managing database on VMs defeats managed services)
  - Operational overhead (backups, scaling, patching)
  - Zero career value
  - **Rejected:** Defeats purpose of Azure deployment

### 2. Azure Table Storage ❌
- **Pros:** Cheapest option (~$0.05/GB/month)
- **Cons:**
  - Limited query capabilities (only key-based)
  - No secondary indexes
  - Poor career value (legacy service)
  - **Rejected:** Insufficient features for audit queries

### 3. PostgreSQL JSON columns ❌
- **Pros:** Already using PostgreSQL
- **Cons:**
  - Mixing relational and document data (complexity)
  - Less efficient for document workloads
  - Misses NoSQL learning opportunity
  - **Rejected:** Not optimal for document-heavy audit logs

### 4. Azure Cosmos DB (SQL API) ❌
- **Pros:** Azure-native, powerful querying
- **Cons:**
  - Proprietary query language (low job market demand)
  - MongoDB API is more portable
  - **Rejected:** MongoDB API offers better career ROI

## Migration Verification

✅ **End-to-End Testing Complete:**
```
Django → Kafka → Go Audit Service → MongoDB
✅ 4 test events successfully saved
✅ log_audit_event() verified working
✅ Kafka consumer processing correctly
✅ MongoDB indexes created automatically
```

## References

- [MongoDB Go Driver Documentation](https://www.mongodb.com/docs/drivers/go/current/)
- [Azure Cosmos DB for MongoDB](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/introduction)
- [ADR-0016: Audit Microservice (Go)](0016-audit-microservice-go.md)
- [ADR-0018: Azure Container Apps Deployment](0018-azure-container-apps-deployment.md)

## Notes

This decision prioritizes **career development value** over pure technical optimization, aligning with the strategic goal of maximizing resume impact for international job opportunities. MongoDB experience is significantly more valuable in the job market than DynamoDB, while still providing equivalent (or superior) technical capabilities for our audit log use case.

The migration from DynamoDB to MongoDB represents a strategic investment in marketable skills while maintaining production-grade infrastructure on Azure.
