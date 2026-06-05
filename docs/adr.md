# adr.md

# Architecture Decision Record

This document captures the key architectural decisions made during the development of the Live Poll Application, along with the rationale and trade-offs considered.

---

# ADR-001: Use a Monorepo Structure

## Status

Accepted

## Context

The application consists of:

- React frontend
- Express backend
- Shared documentation

The project is intentionally small and expected to be completed within a few hours.

## Decision

Use a monorepo structure containing separate client and server applications.

text live-poll-app/ ├── client/ ├── server/ └── docs/

## Rationale

Benefits:

- Clear separation between frontend and backend concerns.
- Easier navigation during code reviews.
- Simple local development setup.
- Professional project structure.

## Alternatives Considered

### Separate Repositories

Pros:

- Independent deployments.

Cons:

- Additional setup overhead.
- Unnecessary complexity for an MVP.

### Single Express Application Serving Frontend

Pros:

- Simpler deployment.

Cons:

- Less separation of concerns.
- Harder to discuss architecture during interviews.

---

# ADR-002: Use React with Vite

## Status

Accepted

## Context

The frontend requires:

- Form handling
- Routing
- API integration
- Results visualization

No server-side rendering is required.

## Decision

Use React with Vite.

## Rationale

Benefits:

- Fast startup and build times.
- Familiar developer experience.
- Minimal configuration.
- Excellent TypeScript support.

## Alternatives Considered

### Next.js

Pros:

- Full-stack capabilities.
- Built-in routing.

Cons:

- Additional concepts not required for this assignment.
- Increased architectural complexity.

### Plain HTML/JavaScript

Pros:

- Minimal dependencies.

Cons:

- Reduced maintainability.
- Poor scalability.

---

# ADR-003: Use Express for the Backend API

## Status

Accepted

## Context

The backend requires a small REST API with CRUD-style operations.

## Decision

Use Express with TypeScript.

## Rationale

Benefits:

- Lightweight.
- Familiar ecosystem.
- Fast implementation.
- Suitable for MVP scope.

## Alternatives Considered

### Fastify

Pros:

- Better performance.

Cons:

- Performance benefits irrelevant for expected scale.

### NestJS

Pros:

- Strong architectural patterns.

Cons:

- Significant setup overhead.
- Excessive for a small assignment.

---

# ADR-004: Use Prisma with SQLite

## Status

Accepted

## Context

The application requires persistent storage for:

- Polls
- Options
- Votes

## Decision

Use Prisma ORM with SQLite.

## Rationale

Benefits:

- Type-safe database access.
- Simple schema management.
- Automatic migrations.
- Minimal setup.

SQLite provides sufficient performance and simplicity for the expected workload.

## Alternatives Considered

### PostgreSQL

Pros:

- Production-ready scalability.

Cons:

- Additional infrastructure requirements.

### Raw SQL

Pros:

- Full control.

Cons:

- Increased development effort.
- Less type safety.

---

# ADR-005: Use Dynamic Vote Aggregation

## Status

Accepted

## Context

Poll results must display vote counts and percentages.

## Decision

Store individual votes and calculate totals dynamically.

text Poll └── Option └── Vote

## Rationale

Benefits:

- Simpler implementation.
- Easier verification of correctness.
- Preserves complete voting history.

## Trade-offs

Result retrieval requires aggregation queries.

This is acceptable for MVP-scale traffic.

## Alternative Considered

### Materialized Vote Counters

Example:

text Option └── voteCount

Pros:

- Faster reads.

Cons:

- Additional synchronization logic.
- Increased implementation complexity.

---

# ADR-006: Use Polling for Live Updates

## Status

Accepted

## Context

The challenge lists live-updating results as a nice-to-have feature.

## Decision

Use client-side polling every 2 seconds.

text GET /api/polls/:pollId/results

## Rationale

Benefits:

- Extremely simple implementation.
- Easy debugging.
- No persistent connections.
- Suitable for expected traffic.

## Trade-offs

Additional requests are generated even when data has not changed.

This is acceptable for MVP scale.

## Alternatives Considered

### WebSockets

Pros:

- True real-time updates.

Cons:

- Additional infrastructure and complexity.

### Server-Sent Events (SSE)

Pros:

- Simpler than WebSockets.

Cons:

- Still more complex than polling.

---

# ADR-007: Use Plain React Hooks

## Status

Accepted

## Context

The frontend requires:

- Data fetching
- Loading states
- Polling

## Decision

Use custom React hooks.

Examples:

text usePoll() useResults() usePolling()

## Rationale

Benefits:

- Minimal dependencies.
- Easy to understand.
- Sufficient for application complexity.

## Alternatives Considered

### TanStack Query

Pros:

- Caching.
- Automatic refetching.
- Advanced state management.

Cons:

- Additional abstraction.
- Benefits not justified by project size.

---

# ADR-008: Use Zod for Validation

## Status

Accepted

## Context

Input validation is required on both client and server.

## Decision

Use Zod schemas as the source of truth for validation.

## Rationale

Benefits:

- Runtime validation.
- Type inference.
- Reduced duplication.
- Consistent validation rules.

Example:

typescript const createPollSchema = z.object({ question: z.string().min(1).max(255), options: z.array(z.string()).min(2).max(5) });

## Alternatives Considered

### Manual Validation

Pros:

- No dependency.

Cons:

- Repetitive.
- Error-prone.

---

# ADR-009: Use shadcn/ui for UI Components

## Status

Accepted

## Context

The challenge values functionality and architecture over visual design, but a polished UI improves usability.

## Decision

Use shadcn/ui components.

## Rationale

Benefits:

- Modern appearance.
- Accessibility defaults.
- Easy customization.
- No complex design work required.

## Alternatives Considered

### Custom Components

Pros:

- Full control.

Cons:

- Additional development time.

### Material UI

Pros:

- Comprehensive component library.

Cons:

- Larger dependency footprint.
- Visual style may feel generic.

---

# ADR-010: No Authentication

## Status

Accepted

## Context

The challenge explicitly excludes authentication requirements.

## Decision

Do not implement:

- Login
- Registration
- User accounts

## Rationale

Benefits:

- Reduced scope.
- Faster delivery.
- Focus on core requirements.

## Consequences

The application does not prevent:

- Duplicate voting
- Anonymous voting
- Poll ownership verification

These concerns are intentionally deferred and documented as future enhancements.
