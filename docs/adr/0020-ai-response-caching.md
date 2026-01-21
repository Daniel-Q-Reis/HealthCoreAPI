# ADR-0020: AI Response Caching for Lifestyle Recommendations

**Status:** TODO / Proposal
**Date:** 2026-01-21
**Deciders:** Daniel de Queiroz Reis (Lead Developer), Client Requirement
**Related ADRs:** [ADR-0012 (AI Integration)](0012-ai-integration-openai.md)

## Context

The HealthCore platform features an AI-powered lifestyle advisor that provides personalized health recommendations based on patient conditions. Currently, **each user query triggers a new OpenAI API call**, resulting in:

1. **High API Costs:** ~$0.02-0.05 per GPT-4o request
2. **Slow Response Times:** 2-5 seconds per API call
3. **Duplicate Processing:** Identical/similar questions get recomputed
4. **No Analytics:** Cannot identify trending health topics

### Current Implementation

```python
# results/views.py - Lifestyle Advisor Endpoint
def lifestyle_advice_view(request):
    user_query = request.data['query']
    disease = request.data['disease']

    # Direct API call every time (expensive!)
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": user_query}]
    )

    return Response({"advice": response.choices[0].message.content})
```

**Problems:**
- **No caching** - Same question = Same API cost
- **No reuse** - 100 users asking "diabetes diet tips" = 100 API calls
- **No insights** - Cannot track popular health topics

## Decision

**Implement semantic caching with vector similarity search to reduce AI API costs by 80-90% while improving response times and enabling analytics.**

### Proposed Architecture

**1. Semantic Cache Table (PostgreSQL + pgvector):**

```python
from pgvector.django import VectorField

class AILifestyleCache(models.Model):
    """Cache AI responses with semantic search capabilities"""

    # Vector embedding for semantic similarity
    query_embedding = VectorField(dimensions=1536)  # OpenAI text-embedding-3-small

    # Original query data
    original_query = models.TextField(db_index=True)
    disease_context = models.CharField(max_length=200, db_index=True)
    language = models.CharField(max_length=5, default='en')  # 'en' or 'pt'

    # Cached AI response
    ai_response = models.TextField()
    ai_model = models.CharField(max_length=50)  # "gpt-4o-mini"

    # Metadata and metrics
    hit_count = models.IntegerField(default=0)  # Reuse count
    tokens_saved = models.IntegerField(default=0)  # Cost savings tracking
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(auto_now=True)

    # Quality control
    user_rating = models.FloatField(null=True)  # Optional feedback
    is_active = models.BooleanField(default=True)  # Allow invalidation

    class Meta:
        indexes = [
            models.Index(fields=['disease_context', '-hit_count']),  # Trending topics
            models.Index(fields=['created_at']),  # TTL cleanup
        ]
```

**2. Smart Caching Service with Similarity Search:**

```python
from pgvector.django import CosineDistance
import openai

class LifestyleCacheService:
    SIMILARITY_THRESHOLD = 0.85  # 85% similarity = cache hit
    EMBEDDING_MODEL = "text-embedding-3-small"  # $0.0001 per request

    def get_or_create_advice(self, query: str, disease: str, language: str = 'en') -> dict:
        """
        Get cached advice or generate new with OpenAI.
        Returns: {'response': str, 'cached': bool, 'tokens_saved': int}
        """
        # Step 1: Generate query embedding (cheap: $0.0001)
        query_embedding = self._get_embedding(query)

        # Step 2: Search for similar cached responses
        cached = AILifestyleCache.objects.annotate(
            similarity=CosineDistance('query_embedding', query_embedding)
        ).filter(
            similarity__lt=(1 - self.SIMILARITY_THRESHOLD),  # >85% similar
            disease_context=disease,
            language=language,
            is_active=True
        ).order_by('similarity').first()

        if cached:
            # Cache HIT - update metrics
            cached.hit_count += 1
            cached.tokens_saved += self._estimate_tokens(cached.ai_response)
            cached.last_used = timezone.now()
            cached.save(update_fields=['hit_count', 'tokens_saved', 'last_used'])

            return {
                'response': cached.ai_response,
                'cached': True,
                'tokens_saved': cached.tokens_saved,
                'similarity': 1 - cached.similarity  # Convert to percentage
            }

        # Cache MISS - call OpenAI API
        ai_response = self._call_openai(query, disease, language)

        # Save to cache for future reuse
        AILifestyleCache.objects.create(
            query_embedding=query_embedding,
            original_query=query,
            disease_context=disease,
            language=language,
            ai_response=ai_response,
            ai_model="gpt-4o-mini"
        )

        return {
            'response': ai_response,
            'cached': False,
            'tokens_saved': 0
        }

    def _get_embedding(self, text: str) -> list:
        """Generate embedding vector for semantic search"""
        response = openai.embeddings.create(
            model=self.EMBEDDING_MODEL,
            input=text
        )
        return response.data[0].embedding

    def _call_openai(self, query: str, disease: str, language: str) -> str:
        """Call OpenAI API for new advice"""
        prompt = self._build_prompt(query, disease, language)
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
```

**3. Trending Topics Analytics:**

```python
class LifestyleTrendsService:
    """Analyze popular health topics and questions"""

    def get_trending_topics(self, days: int = 30, limit: int = 20) -> list:
        """Get most searched health topics in last N days"""
        cutoff = timezone.now() - timedelta(days=days)

        return AILifestyleCache.objects.filter(
            created_at__gte=cutoff
        ).values('disease_context').annotate(
            total_searches=Count('id'),
            total_hits=Sum('hit_count'),
            cache_efficiency=Avg(F('hit_count') / (F('hit_count') + 1))
        ).order_by('-total_searches')[:limit]

    def get_popular_questions(self, disease: str = None, limit: int = 10) -> QuerySet:
        """Get most reused questions (high hit_count)"""
        qs = AILifestyleCache.objects.all()
        if disease:
            qs = qs.filter(disease_context=disease)

        return qs.filter(hit_count__gte=5).order_by('-hit_count')[:limit]
```

## Consequences

### Positive

1. **💰 Massive Cost Reduction (80-95%)**
   - First query: ~$0.02 (GPT-4o-mini)
   - Cached queries: ~$0.0001 (embedding only)
   - **With 90% cache hit rate: $0.002 avg cost per query** (10x cheaper!)
   - **1000 queries/month:** $20 → $2 (90% savings)

2. **⚡ 10-100x Faster Response**
   - OpenAI API: 2-5 seconds
   - Cache hit: ~50ms (database lookup)
   - **Better UX:** Instant advice for popular questions

3. **📊 Built-in Analytics**
   - Trending health topics automatically tracked
   - Popular questions identified
   - Cache efficiency metrics
   - User feedback integration

4. **🎯 Client Value Proposition**
   - **ROI:** Clear cost savings (trackable via `tokens_saved`)
   - **Performance:** Measurable response time improvement
   - **Insights:** Free healthcare trends analytics
   - **Scalability:** System gets cheaper and faster over time

### Negative

1. **Complexity** (Mitigated)
   - Adds cache layer and vector search
   - **Mitigation:** Encapsulated in service class, transparent to API

2. **Storage Growth** (Manageable)
   - Each cached response: ~1-2KB
   - **Mitigation:** TTL cleanup (delete entries older than 6 months)
   - **Cost:** $0.023/GB/month (PostgreSQL) - negligible

3. **Cache Invalidation** (Controlled)
   - Medical advice may become outdated
   - **Mitigation:** `is_active` flag + manual review dashboard
   - **Mitigation:** 6-month TTL for automatic cleanup

### Neutral

- **Accuracy:** Semantic search at 85% threshold maintains high relevance
- **Privacy:** No PII stored (only anonymized queries and diseases)

## Implementation Plan

### Phase 1: Database Setup
- [ ] Install `pgvector` extension in PostgreSQL
- [ ] Create `AILifestyleCache` model with migrations
- [ ] Add database indexes for performance

### Phase 2: Core Caching Service
- [ ] Implement `LifestyleCacheService` with semantic search
- [ ] Integrate OpenAI embeddings API
- [ ] Add cache metrics tracking (hit rate, tokens saved)

### Phase 3: API Integration
- [ ] Update lifestyle advice endpoint to use caching service
- [ ] Add response metadata (cached: true/false, similarity score)
- [ ] Implement cache warming for common queries

### Phase 4: Analytics Dashboard
- [ ] Create `LifestyleTrendsService` for analytics
- [ ] Add admin dashboard for trending topics
- [ ] Implement manual cache invalidation UI

### Phase 5: Monitoring & Optimization
- [ ] Track cache hit rate in Prometheus
- [ ] Set up alerts for low cache efficiency
- [ ] Tune similarity threshold based on metrics

## Alternatives Considered

### 1. Simple Key-Value Cache (Redis) ❌
- **Pros:** Simpler implementation
- **Cons:**
  - No semantic search (exact match only)
  - "diabetes diet tips" ≠ "what should I eat with diabetes?"
  - Lower cache hit rate (~30% vs 90%)
  - **Rejected:** Poor ROI for AI use case

### 2. External Vector DB (Pinecone, Weaviate) ❌
- **Pros:** Purpose-built for vector search
- **Cons:**
  - Additional service to manage ($0.10/month minimum)
  - Network latency for external API
  - Over-engineering for our scale
  - **Rejected:** PostgreSQL + pgvector sufficient

### 3. Pre-generate All Answers ❌
- **Pros:** Zero runtime AI cost
- **Cons:**
  - Cannot cover all possible questions
  - Loses personalization
  - High upfront cost
  - **Rejected:** Defeats purpose of dynamic AI

## Cost-Benefit Analysis

**Scenario:** 1000 users, 5 queries/user/month = 5000 queries/month

| Metric | Without Cache | With Cache (90% hit) | Savings |
|--------|---------------|---------------------|---------|
| **OpenAI API Cost** | $100/month | $10/month | **$90/month** |
| **Embedding Cost** | $0 | $0.50/month | -$0.50 |
| **Database Storage** | $0 | $0.23/month | -$0.23 |
| **Avg Response Time** | 3s | ~500ms | **6x faster** |
| **Total Monthly Cost** | $100 | $10.73 | **89% reduction** |
| **Annual Savings** | - | - | **$1,072** |

**Break-even:** 100 cached responses (reached in ~1 week)

## Success Metrics

1. **Cache Hit Rate:** Target >85% after 1 month
2. **Cost per Query:** Target <$0.005 (current: $0.02)
3. **P95 Response Time:** Target <1s (current: 4-5s)
4. **User Satisfaction:** Track via `user_rating` field

## References

- [OpenAI Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Semantic Caching Best Practices](https://blog.langchain.dev/semantic-caching/)
- [ADR-0012: AI Integration with OpenAI](0012-ai-integration-openai.md)

##Notes

This proposal is driven by **client requirements** for cost optimization and analytics. The semantic caching approach is **industry-standard** (used by ChatGPT, Notion AI, etc.) and provides **measurable ROI** within weeks.

**Next Steps:**
1. Client approval for Phase 1-2 implementation
2. Estimate development effort (2-3 weeks)
3. Set up PostgreSQL pgvector extension
4. Implement MVP with basic caching
5. Monitor metrics and iterate

**Status:** Awaiting client approval and prioritization.
