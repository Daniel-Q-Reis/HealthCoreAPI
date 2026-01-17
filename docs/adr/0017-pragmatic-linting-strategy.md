# ADR 0017: Pragmatic Linting and CI/CD Strategy

## Status
Accepted

## Date
2026-01-17

## Context
HealthCoreAPI is a portfolio/educational project demonstrating backend architecture (DDD, CQRS, microservices).
The project has grown to include:
- **Backend:** 200+ Python files (Django monolith)
- **Frontend:** 50+ TypeScript/React files
- **Microservice:** Go audit-service

Running full linting (mypy, ruff, eslint, golangci-lint) + CI/CD on EVERY commit would:
1. Slow development significantly (~3-5min per commit)
2. Divert focus from architecture to formatting
3. Add complexity for a solo developer project

## Decision

### ✅ What We Lint
- **Python (Backend):** FULL strict linting
  - `mypy --strict` (type checking)
  - `ruff` (linting + formatting)
  - `pre-commit` hooks (REQUIRED)

### ❌ What We DON'T Lint (Yet)
- **TypeScript (Frontend):** No ESLint, no type checking
- **Go (Microservice):** No golangci-lint
- **CI/CD:** No GitHub Actions, no automated tests on push

### Justification
1. **Focus:** Backend architecture is the portfolio's core value proposition
2. **Pragmatism:** Solo developer, not a team of 10
3. **ROI:** Strict Python linting catches 95% of bugs; frontend is presentational
4. **Speed:** No waiting for CI/CD allows rapid iteration

## Consequences

### Positive
- ✅ Fast development cycle
- ✅ Focus on architecture, not bikeshedding formatting
- ✅ Python code quality remains high (mypy strict)

### Negative
- ⚠️ TypeScript errors may slip through (mitigated: simple React components)
- ⚠️ Go code not linted (mitigated: small codebase, Go's built-in formatter)
- ❌ Not "enterprise best practice" (acceptable for portfolio)

## Future Work

When/if moving to production:
1. Add `golangci-lint` for Go microservices
2. Add ESLint + TypeScript strict if frontend becomes complex
3. Implement GitHub Actions CI/CD

## References
- Python linting: [pyproject.toml](file:///d:/DevOps/healthcoreapi/pyproject.toml)
- MyPy config: [mypy.ini](file:///d:/DevOps/healthcoreapi/mypy.ini)
- Pre-commit config: [.pre-commit-config.yaml](file:///d:/DevOps/healthcoreapi/.pre-commit-config.yaml)
