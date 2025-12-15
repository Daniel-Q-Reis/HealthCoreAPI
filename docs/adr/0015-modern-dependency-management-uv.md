# ADR-0015: Modern Dependency Management with UV

**Status:** Proposed
**Date:** 2025-12-14

## Context

HealthCoreAPI currently uses `pip-tools` for dependency management, which provides reliable dependency resolution but suffers from performance issues. As the project grows and CI/CD pipelines become more complex, dependency installation time becomes a significant bottleneck.

### Current Pain Points

- **Slow Installation**: `pip install` takes 2-3 minutes in CI/CD
- **Lock File Generation**: `pip-compile` is slow for large dependency trees
- **CI/CD Bottleneck**: Dependency installation is 40-50% of total CI/CD time
- **Developer Experience**: Slow local environment setup

### Business Drivers

- **Faster CI/CD**: Reduce pipeline execution time for faster feedback
- **Better Developer Experience**: Quicker local environment setup
- **Modern Tooling**: Adopt industry-leading dependency management
- **Cost Optimization**: Reduce CI/CD compute costs

## Decision

We will migrate from `pip-tools` to **UV** (Astral's ultra-fast Python package installer) for dependency management, while maintaining compatibility with existing `requirements.txt` workflow.

### What is UV?

UV is a **Rust-based Python package installer** created by Astral (makers of Ruff), designed to be a drop-in replacement for pip and pip-tools with **10-100x faster** performance.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Development Workflow                   │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  requirements.in  →  UV  →  requirements.txt (lock)     │
│  requirements-dev.in → UV → requirements-dev.txt (lock) │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│           UV Install (10-100x faster than pip)          │
│  - Parallel downloads                                   │
│  - Rust-based resolver                                  │
│  - Cached builds                                        │
│  - Compatible with pip                                  │
└─────────────────────────────────────────────────────────┘
```

### Technology Comparison

| Feature | pip-tools | UV | Improvement |
|---------|-----------|----|-----------|
| **Install Speed** | 2-3 min | 10-20 sec | **10-15x faster** |
| **Lock Generation** | 30-60 sec | 2-5 sec | **10-15x faster** |
| **Parallel Downloads** | No | Yes | ✅ |
| **Rust Performance** | No | Yes | ✅ |
| **pip Compatible** | Yes | Yes | ✅ |
| **Lock Files** | requirements.txt | requirements.txt | ✅ Same format |

## Implementation

### Installation

```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or via pip
pip install uv
```

### Workflow Changes

**Before (pip-tools)**:
```bash
# Compile dependencies
pip-compile requirements.in
pip-compile requirements-dev.in

# Install dependencies
pip install -r requirements.txt
```

**After (UV)**:
```bash
# Compile dependencies (10x faster)
uv pip compile requirements.in -o requirements.txt
uv pip compile requirements-dev.in -o requirements-dev.txt

# Install dependencies (10x faster)
uv pip install -r requirements.txt
```

### Docker Integration

```dockerfile
# Dockerfile
FROM python:3.12-slim

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Install dependencies (much faster)
COPY requirements.txt .
RUN uv pip install --system -r requirements.txt
```

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
- name: Install UV
  run: curl -LsSf https://astral.sh/uv/install.sh | sh

- name: Install Dependencies
  run: uv pip install -r requirements-dev.txt
```

### Makefile Updates

```makefile
# Makefile
compile:
	uv pip compile requirements.in -o requirements.txt
	uv pip compile requirements-dev.in -o requirements-dev.txt

install:
	uv pip install -r requirements-dev.txt
```

## Consequences

### Positive

✅ **Performance**
- **10-100x faster** dependency installation
- **10-15x faster** lock file generation
- Parallel downloads and caching
- Rust-based performance

✅ **CI/CD Improvements**
- Reduce pipeline time by 40-50%
- Lower CI/CD compute costs
- Faster feedback loops
- Better developer productivity

✅ **Developer Experience**
- Faster local environment setup
- Quicker dependency updates
- Modern tooling
- Same workflow (drop-in replacement)

✅ **Compatibility**
- Compatible with pip and pip-tools
- Same `requirements.txt` format
- No breaking changes
- Gradual migration possible

### Negative

❌ **New Dependency**
- Additional tool to install
- Team needs to learn UV commands
- Potential edge cases with complex dependencies

❌ **Maturity**
- Relatively new tool (2023)
- Smaller community than pip
- Potential bugs in edge cases

❌ **Installation Overhead**
- Need to install UV in Docker images
- Need to install UV in CI/CD
- Additional setup step

### Mitigation Strategies

1. **Compatibility**
   - Keep `requirements.txt` format unchanged
   - Fallback to pip if UV unavailable
   - Gradual migration (UV optional initially)

2. **Team Adoption**
   - Update documentation
   - Provide Makefile commands
   - Keep pip-tools as fallback

3. **CI/CD Reliability**
   - Cache UV binary
   - Fallback to pip on failure
   - Monitor installation times

## Migration Plan

### Phase 1: Local Development (Week 1)
- Install UV locally
- Test dependency compilation
- Verify compatibility
- Update documentation

### Phase 2: Docker Integration (Week 2)
- Update Dockerfile to use UV
- Test container builds
- Verify all dependencies install correctly
- Update docker-compose

### Phase 3: CI/CD Integration (Week 3)
- Update GitHub Actions workflow
- Add UV installation step
- Monitor pipeline performance
- Compare before/after metrics

### Phase 4: Team Rollout (Week 4)
- Update CONTRIBUTING.md
- Team training session
- Collect feedback
- Optimize workflow

## Performance Benchmarks

### Expected Improvements

| Metric | Before (pip-tools) | After (UV) | Improvement |
|--------|-------------------|------------|-------------|
| **CI/CD Total Time** | 5-6 min | 3-4 min | **-40%** |
| **Dependency Install** | 2-3 min | 10-20 sec | **-85%** |
| **Lock Generation** | 30-60 sec | 2-5 sec | **-90%** |
| **Local Setup** | 3-4 min | 20-30 sec | **-85%** |

### Cost Savings

- **CI/CD Compute**: ~40% reduction in GitHub Actions minutes
- **Developer Time**: ~2-3 minutes saved per environment setup
- **Iteration Speed**: Faster dependency updates and testing

## Alternatives Considered

### 1. Poetry

**Pros**: Modern, popular, good UX
**Cons**: Different workflow, not pip-compatible, slower than UV
**Decision**: Rejected - too disruptive, not as fast as UV

### 2. PDM

**Pros**: PEP 582 support, modern
**Cons**: Less mature, smaller community
**Decision**: Rejected - UV has better performance

### 3. Keep pip-tools

**Pros**: Stable, well-known
**Cons**: Slow, no performance improvements
**Decision**: Rejected - performance is critical

## Success Metrics

- ✅ CI/CD pipeline time reduced by 40%+
- ✅ Dependency installation <30 seconds
- ✅ Lock file generation <5 seconds
- ✅ Zero compatibility issues
- ✅ Team adoption >90%
- ✅ All tests passing

## References

- [UV Documentation](https://github.com/astral-sh/uv)
- [UV Performance Benchmarks](https://astral.sh/blog/uv)
- [Astral (Ruff creators)](https://astral.sh/)
- [Python Packaging Guide](https://packaging.python.org/)

## Related ADRs

- ADR-0001: Modular Monolith (Dependency management importance)
- None (First ADR for dependency tooling)

## Future Enhancements

- **pytest-xdist**: Parallel test execution (separate ADR)
- **UV Workspaces**: Monorepo support (if needed)
- **UV Lock**: Native lock file format (when stable)
