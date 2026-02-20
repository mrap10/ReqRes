# @reqres/api

The central API server for ReqRes: handles authentication, submission management, job queuing, real-time streaming, and admin operations.

**Runtime:** Express 5.2 on Bun | **Port:** 4000 (configurable)

## Architecture

```tree
Incoming Request
  │
  ├─ CORS → JSON Parser → Correlation ID → Request Logging → Rate Limiting
  │
  ├─ /api/auth/*            → better-auth (signin, signup, OAuth, verification)
  ├─ /submissions           → Submission CRUD + SSE streaming
  ├─ /problems              → Problem listing + admin CRUD
  ├─ /user/*                → Profile, streak, activity grid
  ├─ /internal/runner/*     → Runner callbacks (result + logs)
  ├─ /metrics/*             → Application metrics (admin)
  ├─ /admin/rate-limits/*   → Rate limit management (admin)
  └─ /health                → Health check + Prometheus metrics
```

## Key Dependencies

| Library            | Purpose                                                |
| :----------------- | :----------------------------------------------------- |
| `express` 5.2      | HTTP framework                                         |
| `better-auth`      | Auth (email/password + GitHub OAuth)                   |
| `bullmq`           | Job queue for submission processing                    |
| `ioredis`          | Redis client (queues, rate limiting, metrics, caching) |
| `@sentry/node`     | Error tracking & performance monitoring                |
| `pino`             | Structured JSON logging                                |
| `resend`           | Transactional email (verification, password reset)     |
| `zod`              | Request validation                                     |
| `@reqres/database` | Prisma client + schema                                 |
| `@reqres/types`    | Shared DTOs and enums                                  |

## Middleware Stack

Applied in order to every request:

1. **CORS** — Allows `WEB_BASE_URL` with credentials
2. **JSON body parser** — `express.json()`
3. **Correlation ID** — Generates CUID2, sets `X-Correlation-ID` header, flows through entire pipeline
4. **Request logging** — Pino structured logs with duration, tiered levels (error for 5xx, warn for 4xx, info for 2xx)
5. **Rate limiting** — Redis-backed fixed-window, tiered (default: 100/min, admin: unlimited), fail-open design
6. **Sentry error handler** — Captures errors with PII scrubbing

Auth middleware (`requireAuth`, `requireAdmin`, `requireOwnership`) is applied per-route, not globally.

## Services

### MetricsService

Redis-backed application metrics:

- **Counters:** Lifetime + hourly buckets (7-day TTL)
- **Gauges:** Current values (e.g., queue depth)
- **Timings:** Sorted sets with p50/p95/p99 percentile calculation
- **Unique users:** HyperLogLog (`PFADD`/`PFCOUNT`) for memory-efficient cardinality

### StreakService

Timezone-aware daily streak tracking:

- Uses `Intl.DateTimeFormat` with IANA timezone for local date calculation
- Runs in Prisma transactions to prevent race conditions
- Activity grid cached in Redis (24h TTL, invalidated on new submissions)

## Authentication

Uses **better-auth** with Prisma adapter:

- Email/password with required email verification
- GitHub OAuth (optional)
- 7-day sessions with 24h rolling renewal, 5-min cookie cache
- Audit trail for all auth events

## Environment Variables

| Variable               | Required | Default | Purpose                      |
| :--------------------- | :------- | :------ | :--------------------------- |
| `PORT`                 | No       | 4000    | Server port                  |
| `DATABASE_URL`         | Yes      | —       | PostgreSQL connection string |
| `REDIS_HOST`           | Yes      | —       | Redis hostname               |
| `REDIS_PORT`           | No       | 6379    | Redis port                   |
| `REDIS_PASSWORD`       | No       | —       | Redis password               |
| `RUNNER_BASE_URL`      | Yes      | —       | Runner service URL           |
| `RUNNER_SHARED_SECRET` | Yes      | —       | Inter-service auth           |
| `WEB_BASE_URL`         | Yes      | —       | Frontend URL (CORS)          |
| `BETTER_AUTH_URL`      | Yes      | —       | Auth base URL                |
| `GITHUB_CLIENT_ID`     | No       | —       | GitHub OAuth                 |
| `GITHUB_CLIENT_SECRET` | No       | —       | GitHub OAuth                 |
| `RESEND_API_KEY`       | No       | —       | Email sending                |
| `SENTRY_DSN`           | No       | —       | Error tracking               |
| `WORKER_ENABLED`       | No       | true    | Embedded worker              |
| `WORKER_CONCURRENCY`   | No       | 5       | Parallel job processing      |
| `LOG_LEVEL`            | No       | info    | Pino log level               |

## Development

```bash
# From project root
turbo run dev          # Starts API + Runner + Web

# API only
cd apps/api
bun run dev

# Run worker standalone
bun run worker:dev
```

## Links

- [Architecture](../../ARCHITECTURE.md)
- [Main Documentation](../../README.md)
- [/web](../web/README.md)
- [/runner](../runner/README.md)
