# ADR-0001: Modular Monolith with Service-Repository Pattern

**Status:** Accepted
**Date:** 2025-10-22

## Context

The project requires a robust, scalable, and maintainable architecture that can evolve over time. We need to support clear domain boundaries from the start, while avoiding the operational overhead of a full microservices architecture in the initial phases. The architecture must facilitate a future, gradual transition to microservices if and when required.

## Decision

We will adopt a **Modular Monolith** architecture. Each bounded context (e.g., Patients, Scheduling, Admissions) will be implemented as a separate Django app within a single project.

To enforce separation of concerns within each module, we will strictly adhere to a **Layered Architecture** using the **Service-Repository Pattern**:
- **Views/API Layer:** Responsible for handling HTTP requests, serialization, and authentication. It delegates all business logic to the Service Layer.
- **Service Layer:** Contains all business logic, orchestrating operations and transactions. It is completely decoupled from the web layer and interacts with the data layer only through Repository interfaces.
- **Repository Layer:** Abstract the data access mechanism. It contains all logic for querying and persisting data, isolating the services from the Django ORM or any other database technology.

## Consequences

**Positive:**
- **Strong Encapsulation:** Clear boundaries between domains from day one.
- **Maintainability:** Code is organized, testable, and easier to navigate.
- **Microservices-Ready:** The clear separation of concerns and data access patterns makes it significantly easier to extract a module into a standalone microservice in the future.
- **Reduced Initial Complexity:** Avoids the challenges of distributed systems (e.g., network latency, service discovery, distributed transactions) at the beginning of the project.

**Negative:**
- **Discipline Required:** The team must be disciplined to not bypass layers (e.g., calling the ORM directly from a view).
- **Slightly More Boilerplate:** Requires creating separate files for services and repositories, which can feel like more upfront work for simple CRUD operations.
