# ADR-0013: Full Stack Architecture with React Frontend

**Status:** Accepted
**Date:** 2025-12-14

## Context

HealthCoreAPI was initially designed as a **backend-only API** to demonstrate enterprise-grade Django REST Framework capabilities, clean architecture, and cloud-native patterns. However, to maximize portfolio impact and demonstrate full-stack proficiency, we need to provide a **complete user experience** with a modern frontend.

### Business Drivers

- **Portfolio Differentiation**: Stand out in competitive job market by showcasing both backend and frontend expertise
- **User Experience**: Provide visual demonstration of API capabilities beyond Swagger documentation
- **Technical Breadth**: Demonstrate proficiency across the entire technology stack
- **Real-World Simulation**: Mirror production environments where APIs serve frontend applications

### Technical Requirements

- Modern, responsive UI showcasing project features and technical capabilities
- Bilingual support (PT/EN) for international audience
- Fast load times and optimal performance
- SEO optimization for portfolio visibility
- Clean separation from backend API

## Decision

We will implement a **Full Stack Architecture** by adding a **React + TypeScript** frontend as a separate service, maintaining clear separation of concerns while providing a cohesive user experience.

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    User Browser                           │
└───────────────┬──────────────────────┬───────────────────┘
                │                      │
                ▼                      ▼
┌───────────────────────────┐  ┌──────────────────────────┐
│   Landing Page (React)    │  │   Django REST API        │
│   - Port 5173 (dev)       │  │   - Port 8000            │
│   - Vite + TypeScript     │  │   - DRF + PostgreSQL     │
│   - Tailwind CSS          │  │   - Celery + Redis       │
│   - i18n (PT/EN)          │  │   - Prometheus + Kafka   │
│   - Health Check API      │  │   - Swagger/OpenAPI      │
└───────────────────────────┘  └──────────────────────────┘
        │                              │
        └──────────────────────────────┘
              HTTP API Calls
```

### Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Framework** | React 18 | Industry standard, component-based architecture |
| **Language** | TypeScript | Type safety, better developer experience |
| **Build Tool** | Vite | Fast HMR, modern build optimizations |
| **Styling** | Tailwind CSS | Utility-first, rapid development, consistent design |
| **Internationalization** | i18next | Professional i18n with PT/EN support |
| **API Client** | Fetch API | Native browser API, no additional dependencies |
| **Containerization** | Docker | Consistent with backend infrastructure |

### Implementation Approach

1. **Separate Service**: Frontend runs as independent Docker service
2. **API Integration**: Consumes backend API via HTTP (health checks, future features)
3. **Bilingual Support**: Complete PT/EN translations for global audience
4. **Responsive Design**: Mobile-first approach with modern UI patterns
5. **SEO Optimization**: Meta tags, semantic HTML, performance optimization

## Consequences

### Folder Structure Decision

> **Note (2025-01-04):** We evaluated moving the backend code to a `backend/` folder to create symmetry with `frontend/`. This was **rejected** due to significant refactoring impact:
> - Dockerfile and docker-compose.yml path changes
> - CI/CD workflow modifications
> - Python import path adjustments
> - DevContainer and scripts updates
>
> The current structure (backend at root, frontend in `/frontend`) is maintainable and well-documented. This decision prioritizes stability over cosmetic organization.

### Positive

✅ **Portfolio Impact**
- Demonstrates full-stack capabilities to potential employers
- Shows proficiency in modern frontend technologies
- Provides visual showcase of technical skills

✅ **User Experience**
- Professional landing page with project information
- Interactive demonstration of API capabilities
- Bilingual support for international audience

✅ **Technical Benefits**
- Clean separation of concerns (frontend/backend)
- Independent deployment and scaling
- Modern development experience with Vite HMR
- Type safety with TypeScript

✅ **Career Development**
- Full-stack developer positioning
- React/TypeScript experience
- Modern frontend tooling proficiency

### Negative

❌ **Increased Complexity**
- More code to maintain (frontend + backend)
- Additional build pipeline and dependencies
- Two separate deployment targets

❌ **Development Overhead**
- Need to maintain consistency across frontend/backend
- Additional testing requirements
- More documentation needed

❌ **Infrastructure Costs**
- Additional container resources
- More complex deployment process
- Increased build times in CI/CD

### Mitigation Strategies

1. **Complexity Management**
   - Keep frontend focused on landing page (no complex state management)
   - Use TypeScript for type safety and better maintainability
   - Leverage Vite for fast development experience

2. **Development Efficiency**
   - Docker Compose for local development consistency
   - Shared environment configuration
   - Automated builds in CI/CD pipeline

3. **Deployment Simplification**
   - Single docker-compose.yml for all services
   - Nginx reverse proxy for production routing
   - Helm charts for Kubernetes deployment

## Implementation Details

### Project Structure

```
landing-page/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks (useHealthCheck)
│   ├── i18n/              # Translations (PT/EN)
│   ├── pages/             # Page components
│   ├── types/             # TypeScript definitions
│   ├── App.tsx            # Main component
│   └── main.tsx           # Entry point
├── Dockerfile             # Production build
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite configuration
└── tailwind.config.js     # Tailwind CSS config
```

### Docker Integration

```yaml
# docker-compose.yml
services:
  landing-page:
    build: ./landing-page
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://web:8000
    depends_on:
      - web
```

### API Integration Example

```typescript
// Health check integration
const useHealthCheck = () => {
  const [status, setStatus] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/health/')
      .then(res => res.json())
      .then(data => setStatus(data));
  }, []);

  return status;
};
```

## Alternatives Considered

### 1. API-Only with Enhanced Swagger

**Pros**: Simpler, focused on backend expertise
**Cons**: Less visual impact, limited portfolio differentiation
**Decision**: Rejected - insufficient portfolio impact

### 2. Server-Side Rendering (Next.js)

**Pros**: Better SEO, unified JavaScript stack
**Cons**: More complex, overkill for landing page
**Decision**: Rejected - unnecessary complexity for static content

### 3. Static Site Generator (Gatsby)

**Pros**: Excellent performance, great SEO
**Cons**: Less flexibility, steeper learning curve
**Decision**: Rejected - Vite + React provides better DX

## Success Metrics

- ✅ Landing page loads in <2 seconds
- ✅ Mobile-responsive design (tested on multiple devices)
- ✅ Bilingual support (PT/EN) fully functional
- ✅ Health check API integration working
- ✅ Professional design showcasing technical capabilities
- ✅ SEO optimized (meta tags, semantic HTML)

## References

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [i18next Documentation](https://www.i18next.com/)

## Related ADRs

- ADR-0001: Modular Monolith (Backend architecture)
- ADR-0002: JWT Authentication (API security)
- ADR-0006: Helm Charts (Deployment strategy)
