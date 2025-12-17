# ADR-0001: Feature-Sliced Design (FSD) Architecture for Frontend

**Status:** Accepted
**Date:** 2025-12-16
**Deciders:** Daniel Q. Reis, Development Team
**Technical Story:** Frontend architecture for DQR Health module

---

## Context and Problem Statement

The HealthCoreAPI frontend requires a scalable, maintainable architecture that can grow from a single module (DQR Health) to a comprehensive healthcare management system. The architecture must support:

- Multiple feature modules (Patient Management, Appointments, Pharmacy, etc.)
- Shared UI components and utilities
- Clear separation of concerns
- Easy onboarding for new developers
- Scalability for future microservices migration

**Key Question:** What frontend architecture pattern should we adopt to ensure long-term maintainability and scalability?

---

## Decision Drivers

- **Scalability:** Must support growth from 1 to 10+ feature modules
- **Maintainability:** Clear structure for 50,000+ lines of code
- **Developer Experience:** Easy to understand and navigate
- **Code Reusability:** Shared components across modules
- **Testability:** Clear boundaries for unit and integration tests
- **Monorepo Support:** Multiple frontend modules in single repository
- **Industry Standards:** Proven patterns in large-scale applications

---

## Considered Options

### Option 1: Traditional Folder-by-Type Structure
```
src/
├── components/
├── pages/
├── services/
├── utils/
└── hooks/
```

**Pros:**
- Simple and familiar
- Easy to start with
- Low learning curve

**Cons:**
- ❌ Doesn't scale beyond 10,000 lines
- ❌ No clear module boundaries
- ❌ Difficult to extract features
- ❌ High coupling between features
- ❌ Hard to maintain in large teams

---

### Option 2: Domain-Driven Design (DDD) Structure
```
src/
├── patient-management/
├── appointments/
├── pharmacy/
└── shared/
```

**Pros:**
- Clear domain boundaries
- Aligns with backend DDD
- Good for large applications

**Cons:**
- ❌ No standardized layer structure
- ❌ Inconsistent organization across domains
- ❌ Difficult to share code between domains
- ❌ Lacks UI-specific patterns

---

### Option 3: Feature-Sliced Design (FSD) ✅ **SELECTED**
```
src/
├── app/           # Application initialization
├── pages/         # Route components
├── widgets/       # Composite UI blocks
├── features/      # Business logic features
├── entities/      # Business entities
└── shared/        # Shared utilities
```

**Pros:**
- ✅ **Standardized layers** with clear responsibilities
- ✅ **Scalable** from small to enterprise applications
- ✅ **Low coupling** between features
- ✅ **High cohesion** within features
- ✅ **Easy code sharing** through shared layer
- ✅ **Clear import rules** prevent circular dependencies
- ✅ **Industry proven** (used by Yandex, Aviasales, etc.)
- ✅ **Excellent documentation** and community support

**Cons:**
- Learning curve for developers new to FSD
- Requires discipline to follow layer rules

---

## Decision Outcome

**Chosen Option:** Feature-Sliced Design (FSD)

**Rationale:**
1. **Scalability:** Proven to scale from small projects to 100,000+ lines of code
2. **Maintainability:** Clear layer boundaries prevent spaghetti code
3. **Team Collaboration:** Multiple developers can work on different features without conflicts
4. **Future-Proof:** Easy to extract features into separate packages or microservices
5. **Industry Standard:** Widely adopted in modern React applications

---

## Implementation Details

### Layer Structure

#### **1. app/** - Application Initialization
- Entry point (`main.tsx`, `App.tsx`)
- Global providers (Router, Auth, Theme)
- Global styles
- Environment configuration

**Example:**
```typescript
// app/App.tsx
import { AuthProvider } from '@/features/auth';
import { Router } from '@/pages';

export function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
```

---

#### **2. pages/** - Route Components
- One folder per route
- Composes widgets and features
- Handles routing logic
- Minimal business logic

**Example:**
```typescript
// pages/dqr-health/dashboard/
├── index.tsx          # Route component
└── ui/
    └── Dashboard.tsx  # UI implementation
```

---

#### **3. widgets/** - Composite UI Blocks
- Large UI sections (Header, Sidebar, Dashboard Cards)
- Composes multiple features and entities
- Reusable across pages
- No business logic

**Example:**
```typescript
// widgets/dqr-health/PatientCard/
├── index.ts
├── ui/
│   └── PatientCard.tsx
└── model/
    └── types.ts
```

---

#### **4. features/** - Business Logic Features
- User interactions (Login, CreatePatient, BookAppointment)
- Business logic and state management
- API integration
- Form validation

**Example:**
```typescript
// features/auth/
├── context/
│   ├── AuthContext.tsx
│   └── AuthProvider.tsx
├── pages/
│   └── LoginPage.tsx
├── components/
│   └── ProtectedRoute.tsx
└── index.ts
```

---

#### **5. entities/** - Business Entities
- Domain models (Patient, Appointment, Medication)
- Entity-specific UI components
- CRUD operations
- Type definitions

**Example:**
```typescript
// entities/patient/
├── model/
│   └── types.ts
├── ui/
│   └── PatientAvatar.tsx
└── api/
    └── patientApi.ts
```

---

#### **6. shared/** - Shared Utilities
- UI components (Button, Input, Card)
- API clients (Axios configuration)
- Utilities (date formatting, validation)
- Constants and types

**Example:**
```typescript
// shared/
├── ui/           # UI component library
├── api/          # API service layer
├── lib/          # Utilities
└── config/       # Configuration
```

---

### Import Rules (Dependency Flow)

```
app → pages → widgets → features → entities → shared
```

**Rules:**
1. **Lower layers cannot import from higher layers**
   - ✅ `features/` can import from `shared/`
   - ❌ `shared/` cannot import from `features/`

2. **Same-layer imports are allowed**
   - ✅ `features/auth` can import from `features/patients`

3. **Shared layer has no dependencies**
   - ✅ `shared/` is completely independent

---

### Monorepo Structure

```
frontend/
├── src/
│   ├── app/              # Global app
│   ├── pages/
│   │   ├── landing/      # Landing page module
│   │   └── dqr-health/   # DQR Health module
│   ├── modules/          # Future: Separate modules
│   │   └── dqr-health/   # Can be extracted later
│   ├── widgets/
│   │   ├── landing/
│   │   └── dqr-health/
│   ├── features/
│   │   ├── auth/         # Shared auth
│   │   └── dqr-health/   # DQR-specific features
│   ├── entities/
│   │   └── patient/
│   └── shared/           # Shared across all modules
│       ├── ui/
│       └── api/
```

---

## Consequences

### Positive

- ✅ **Clear Structure:** New developers can navigate codebase easily
- ✅ **Scalable:** Can grow to 100,000+ lines without refactoring
- ✅ **Testable:** Clear boundaries for unit/integration tests
- ✅ **Reusable:** Shared layer promotes code reuse
- ✅ **Maintainable:** Easy to locate and modify features
- ✅ **Future-Proof:** Easy to extract modules or migrate to micro-frontends

### Negative

- ⚠️ **Learning Curve:** Team needs to learn FSD principles
- ⚠️ **Initial Overhead:** More folders/files than simple structure
- ⚠️ **Discipline Required:** Must follow import rules strictly

### Mitigation

- **Documentation:** Comprehensive FSD guide in `docs/README_FRONTEND.md`
- **Linting:** ESLint rules to enforce import boundaries
- **Code Reviews:** Ensure FSD principles are followed
- **Templates:** Provide feature/widget templates for consistency

---

## Compliance and Standards

### Aligns With:
- **Clean Architecture:** Dependency inversion principle
- **Domain-Driven Design:** Clear domain boundaries
- **SOLID Principles:** Single responsibility, dependency inversion
- **React Best Practices:** Component composition, hooks

### References:
- [Feature-Sliced Design Official](https://feature-sliced.design/)
- [FSD Examples](https://github.com/feature-sliced/examples)
- [React Architecture Best Practices](https://react.dev/learn/thinking-in-react)

---

## Related Decisions

- **ADR-0002:** Frontend Security Model (credential verification)
- **Backend ADR-0001:** Django REST Framework (API alignment)
- **Backend ADR-0008:** RBAC Implementation (permission integration)

---

## Notes

This architecture decision was made after analyzing:
- 5+ architecture patterns
- 10+ large-scale React applications
- Industry best practices from Yandex, Aviasales, and others
- Team experience with monolithic and microservices architectures

The FSD pattern was chosen for its proven scalability and alignment with our backend DDD architecture.
