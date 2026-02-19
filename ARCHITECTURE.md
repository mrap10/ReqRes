# ReqRes — Architecture Deep Dive

> A comprehensive technical document covering ReqRes's architecture from inception to current state, the design decisions behind every layer, the challenges faced, and the lessons learned building a production-grade backend challenge platform.

---

## Table of Contents

- [1. What is ReqRes?](#1-what-is-reqres)
- [2. High-Level Architecture](#2-high-level-architecture)
- [3. Monorepo Structure & Tooling](#3-monorepo-structure--tooling)
- [4. The API ~ Central Nervous System](#4-the-api--central-nervous-system)
  - [Express 5 on Bun](#express-5-on-bun)
- [5. Authentication & Authorization](#5-authentication--authorization)
- [6. The Queue System ~ Taming Concurrency](#6-the-queue-system--taming-concurrency)
  - [Why Queues?](#why-queues)
  - [Worker Implementation](#worker-implementation)
  - [Dual Worker Mode](#dual-worker-mode)
- [7. The Runner ~ Secure Code Execution](#7-the-runner--secure-code-execution)
  - [Execution Pipeline](#execution-pipeline)
  - [Docker Sandbox](#docker-sandbox)
  - [Test Architecture](#test-architecture)
- [8. Real-Time Updates ~ SSE Streaming](#8-real-time-updates--sse-streaming)
- [9. Rate Limiting ~ The Redis Way](#9-rate-limiting--the-redis-way)
- [10. Database Design](#10-database-design)
- [11. Gamification ~ XP, Streaks & Leaderboards](#11-gamification--xp-streaks--leaderboards)
- [12. Observability Stack](#12-observability-stack)
- [13. The Frontend ~ Next.js App Router](#13-the-frontend--nextjs-app-router)
- [14. Shared Packages](#14-shared-packages)
- [15. Docker Infrastructure](#15-docker-infrastructure)
- [16. Security Model](#16-security-model)
- [17. Design Principles & Patterns](#17-design-principles--patterns)
- [18. Challenges & How They Were Overcome](#18-challenges--how-they-were-overcome)
- [19. What I'd Do Differently](#19-what-id-do-differently)

---

## 1. What is ReqRes?

ReqRes is a **LeetCode-style platform, but for backend development**. Instead of solving algorithm puzzles, users write real Express.js APIs - implementing routes, middleware, authentication, file uploads, rate limiters, and more. Their code is executed inside sandboxed Docker containers, tested with Jest + Supertest, and scored in real-time.

**Key capabilities:**

- Monaco-based code editor in the browser
- XP/streak-based gamification with leaderboards
- GitHub OAuth + email/password authentication
- Sandboxed Docker execution with resource limits
- Real-time test results via Server-Sent Events
- Admin dashboard with metrics, rate limit management, and problem CRUD

---

## 2. High-Level Architecture

```tree
┌─────────────────┐     ┌────────────────┐     ┌─────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    API         │────▶│   Redis     │────▶│    Worker       │
│    (Next.js)    │◀────│    (Express 5) │◀────│   (BullMQ)  │◀────│    (BullMQ)     │
│    Port 3000    │ SSE │    Port 4000   │     └─────────────┘     │    Embedded/    │
└─────────────────┘     └────────────────┘                         │    Standalone   │
                               │                                   └────────┬────────┘
                               │                                              │
                         ┌─────┴─────┐                                        │ HTTP
                         │  Postgres │                                ┌───────▼────────┐
                         │  (Neon)   │                                │    Runner      │
                         └───────────┘                                │    (Express 5) │
                                                                      │    Port 5000   │
                                                                      └───────┬────────┘
                                                                              │
                                                                      ┌───────▼────────┐
                                                                      │    Docker      │
                                                                      │    Sandbox     │
                                                                      │    (ephemeral) │
                                                                      └────────────────┘
```

**Data flow for a submission:**

1. **User writes code** in the Monaco editor and clicks "Run" or "Submit"
2. **Frontend** POSTs to `API /submissions` with the code bundle
3. **API** validates, creates a `PENDING` submission in Postgres, enqueues a BullMQ job
4. **Frontend** opens an SSE connection to `API /submissions/:id/stream`
5. **Worker** picks the job from Redis, updates status to `RUNNING`
6. **Worker** POSTs to `Runner /internal/execute` with code + test config
7. **Runner** creates a temp workspace, writes code + test files, spawns a Docker container
8. **Docker** copies code to tmpfs, runs Jest, writes results to a mounted file
9. **Runner** reads results, sanitizes errors, POSTs back to `API /internal/runner/result`
10. **API** updates the submission in Postgres, writes execution results
11. **SSE** pushes the final status to the browser
12. **Frontend** displays pass/fail results with test details in the terminal panel

**Inter-service authentication:** The Runner and API communicate via a shared secret (`RUNNER_SHARED_SECRET`) sent in the `x-runner-secret` header. This is validated on both sides: the Worker sends it when calling the Runner, and the Runner sends it when calling back to the API.

---

## 3. Monorepo Structure & Tooling

ReqRes is a **Turborepo monorepo** with Bun as the package manager.

```tree
reqres/
├── apps/
│   ├── api/          # Express 5 API + embedded worker
│   ├── runner/       # Code execution service
│   └── web/          # Next.js 16 frontend
├── packages/
│   ├── database/     # Prisma schema + client + seeds
│   ├── types/        # Shared TypeScript DTOs
│   ├── utils/        # Shared utility functions
│   ├── eslint-config/# Shared ESLint presets
│   └── typescript-config/ # Shared tsconfig presets
├── docker/           # Dockerfiles for sandbox, worker, runner
├── turbo.json        # Turborepo pipeline config
└── docker-compose.yml # Redis + optional worker
```

**Why Turborepo?** Three apps sharing types, utilities, and database access. Turbo gives us:

- **Dependency-aware builds** — `build` depends on `^build` (packages build first) and `db:generate` (Prisma client ready before app builds)
- **Parallel dev** — `turbo run dev` starts all three apps simultaneously with hot-reload
- **Shared caching** — Unchanged packages aren't rebuilt

**Why Bun?** Speed. Bun's package manager is significantly faster than npm/pnpm for monorepo installs, and its runtime performance for the API and Runner is excellent. The TypeScript support without a separate build step (for dev) is a nice bonus.

**TypeScript configuration** is layered:

- `base.json` — Strict mode, ESNext modules, bundler resolution (shared foundation)
- `node.json` — NodeNext module resolution for backend apps
- `nextjs.json` — Next.js preset with JSX preserve and bundler resolution
- `react-library.json` — For shared React component packages

---

## 4. The API ~ Central Nervous System

### Express 5 on Bun

The API uses **Express 5.2** running on the **Bun runtime**. Express 5 was chosen for its async error handling improvements (async middleware that properly catches promise rejections) and the general modernization of the framework.

The API is the central hub as it handles authentication, serves the REST API for the frontend, manages the job queue, and receives callbacks from the Runner.

> The detailed architecture of the API, including middleware, routes, and service layer design, is covered in the [API README](./apps/api/README.md).

---

## 5. Authentication & Authorization

Authentication uses **better-auth** with a **Prisma adapter** connecting to PostgreSQL.

### Auth Methods

1. **Email/Password**
2. **GitHub OAuth**

Every authentication event is logged with structured metadata:

```text
Events: USER_SIGNUP, USER_SIGNIN, USER_SIGNOUT, PASSWORD_RESET_REQUESTED,
        PASSWORD_RESET_COMPLETED, EMAIL_VERIFIED, OAUTH_SIGNIN, SESSION_CREATED
```

Each audit log includes: timestamp, user ID/email, event type, IP address (from `x-forwarded-for`, `x-real-ip`, or socket), user-agent, and provider metadata.

---

## 6. The Queue System ~ Taming Concurrency

### Why Queues?

The original architecture (API calls Runner synchronously) had a fatal flaw: **code execution is slow and unpredictable.** A Docker container takes 2-10 seconds to execute, and user code could run for the full timeout duration. With synchronous calls:

- 10 concurrent submissions = 10 blocked API threads
- One infinite loop = one thread stuck for the full timeout
- No retry on transient Docker failures
- No backpressure — the system falls over under load

Queues solve all of this by **decoupling submission creation from execution:**

1. The API responds instantly with "queued" (fast UX)
2. Workers process at a controlled rate (backpressure)
3. Failed jobs retry automatically (resilience)
4. Multiple workers can run in parallel (horizontal scaling)

**Deduplication:** Jobs are created with `jobId: submissionId`, preventing duplicate processing if the same submission is somehow enqueued twice.

**Graceful degradation:** If `REDIS_HOST` isn't set, the queue system initializes with `null` connections. The API can still create submissions in the DB but can't enqueue them — this allows the system to partially function without Redis (useful for development/testing).

### Worker Implementation

The Worker is a BullMQ processor that:

1. Picks a job from the `submissionQueue`
2. Updates the submission status to `RUNNING` in Postgres
3. POSTs to the Runner's `/internal/execute` endpoint with the code bundle
4. Receives the result (or handles timeout/error)
5. Maps the Runner's status to a Prisma enum and updates the DB
6. Upserts the `ExecutionResult` record with raw test JSON

**Timeout handling:** The Worker sets an HTTP timeout of `testConfig.timeoutMs + 30000ms` — giving the Runner 30 seconds of buffer beyond the test timeout to account for Docker startup, file operations, and result parsing.

**Error handling with exponential backoff:** If the Worker fails (network error, Runner down, Docker crash), BullMQ automatically retries with exponential backoff (2s → 4s → 8s, up to 3 attempts). Only after all retries are exhausted is the submission marked as `RUNTIME_ERROR`.

**Metrics tracking:** The Worker emits metrics at every state transition:

- `SUBMISSION_PROCESSING` — Job picked up
- `SUBMISSION_COMPLETED` — Success
- `SUBMISSION_FAILED` — Test failures (valid result, tests didn't pass)
- `SUBMISSION_ERROR` — Infrastructure failures (Docker crash, timeout)
- `EXECUTION_TIME` — Duration histogram for percentile analysis
- `QUEUE_DEPTH` — Updated after enqueue and on job completion

### Dual Worker Mode

The Worker can run in two configurations:

**Embedded mode (development):** The Worker runs inside the API process. One terminal, one process, simpler debugging. Enabled by default when `WORKER_ENABLED !== 'false'`.

**Standalone mode (production):** The Worker runs as a separate process (or Docker container). This allows:

- Independent scaling (more workers = more throughput)
- Process isolation (Worker crash doesn't take down the API)
- Resource-specific tuning (Worker needs more CPU/memory for Docker operations)

```bash
# Development (embedded)
turbo run dev  # API includes worker

# Production (standalone)
docker compose --profile worker up -d  # Separate worker container
```

---

## 7. The Runner ~ Secure Code Execution

The Runner is the most security-critical component. It receives untrusted user code and executes it.

### Execution Pipeline

```tree
POST /internal/execute
  │
  ├─ 1. Validate runner secret (x-runner-secret header)
  ├─ 2. Validate request body (Zod schema: CUID formats, slug whitelist, bounds)
  ├─ 3. Create temp workspace (/tmp/reqres-{uuid})
  ├─ 4. Write user code files (JS only — TypeScript rejected)
  ├─ 5. Generate package.json (express, jest, supertest, jsonwebtoken)
  ├─ 6. Copy problem-specific test files from tests/{slug}/
  ├─ 7. Generate jest.config.js (with optional setup files)
  ├─ 8. Spawn Docker container with security constraints
  ├─ 9. Docker: copy code to /tmp, install deps, run Jest
  ├─ 10. Read jest-results.json from mounted file
  ├─ 11. Parse results, sanitize errors (strip stack traces)
  ├─ 12. POST result to API callback (/internal/runner/result)
  ├─ 13. POST execution logs to API (/internal/runner/log)
  └─ 14. Clean up temp workspace (always, even on failure)
```

### Docker Sandbox

Each submission runs in an ephemeral Docker container with aggressive security constraints.

**The base image (`reqres-runner:latest`)** is pre-built with Node 20 Alpine and all test dependencies (`express`, `jest`, `supertest`, `jsonwebtoken`, `zod`, `multer`). This avoids `npm install` inside every container — the `node_modules` are already there, mounted from the image. The container only needs to copy user code to `/tmp/workspace` and run Jest.

**Why ephemeral containers?** Each submission gets a completely clean environment. No leftover files, no modified `node_modules`, no state leakage between users. The `--rm` flag ensures automatic cleanup even if the Runner process crashes.

> The detailed Runner architecture, including the Docker command and security constraints, is covered in the [Runner README](./apps/runner/README.md).

### Test Architecture

Each problem has a directory under `apps/runner/tests/{slug}/` containing:

```tree
tests/
└── jwt-authentication-middleware/
    ├── problem.test.js    # Jest test file using supertest
    └── setup.js           # Optional: Jest setupFilesAfterEnv
```

Tests follow a consistent pattern:

```javascript
const app = require("../../index"); // User's Express app
const request = require("supertest");

describe("JWT Authentication Middleware", () => {
  test("should return 401 without token", async () => {
    const res = await request(app).get("/protected");
    expect(res.status).toBe(401);
  });
  // ...
});
```

The test files `require('../../index')` which resolves to the user's `index.js` in the workspace root. Supertest wraps the Express app and makes HTTP assertions against it. No actual server is started — Supertest handles that internally.

---

## 8. Real-Time Updates ~ SSE Streaming

Server-Sent Events (SSE) deliver real-time submission progress to the browser:

```tree
Browser ──── GET /submissions/:id/stream ────> API
             <──── event: status ──────────────
             <──── event: status ──────────────
             <──── event: complete ─────────────
             (connection closes)
```

**Why SSE over WebSockets?**

- SSE is simpler — unidirectional (server → client), no handshake protocol, works over HTTP/1.1
- For this use case (submission status updates), we only need server-to-client communication
- Automatic reconnection built into the browser's `EventSource` API
- Works through HTTP proxies without special configuration

**Implementation details:**

- The API keeps the SSE connection alive with periodic keepalive events
- When the Worker updates submission status in the DB, the SSE endpoint detects the change and pushes it
- The connection closes after the terminal state (PASSED, FAILED, ERROR, etc.) is sent
- Frontend uses `EventSource` with the auth cookie for the SSE connection

---

## 9. Rate Limiting ~ The Redis Way

Rate limiting was one of the most complex middleware implementations, and the one that caused the most debugging headaches.

### Algorithm

The rate limiter uses a **fixed-window algorithm** backed by Redis:

```text
Key: ratelimit:{client}:{method}:{path}:{windowStart}
```

1. Calculate `windowStart = Math.floor(Date.now() / windowMs) * windowMs`
2. Redis MULTI pipeline: `INCR` the key + `PEXPIRE` with window duration
3. If count > limit → 429 with `Retry-After` header
4. Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Client Identification

- **Authenticated users:** `user:{userId}` — rate limits follow the user, not the IP
- **Anonymous users:** `ip:{ipAddress}` — fall back to IP-based limiting

### The Fail-Open Design Decision

**Critical design choice:** If Redis is unavailable, the rate limiter allows ALL traffic through.

Why? The alternative — blocking all requests when Redis is down ~ would make a Redis outage equivalent to a complete service outage. The rate limiter is a defense mechanism, not a core feature. If Redis goes down for 30 seconds, it's better to serve unrated requests than to return 503 to every user.

The fail-open behavior is logged at `warn` level so it triggers alerts but doesn't cause a flood of errors.

### Admin Features

The rate limit system includes a full admin API:

- **Per-user overrides** — Admin can set custom limits for specific users (stored in a Redis hash)
- **IP blocking** — Block specific IPs with optional TTL (auto-expires)
- **Statistics** — Total requests, blocked requests, active overrides, blocked IP count
- **Redis health check** — Ping + latency measurement

### The Connection Pool Bug

During Phase 3, I encountered a particularly nasty bug: under rate limit pressure, random 500 errors appeared with Neon connection pool exhaustion messages. The root cause? The better-auth Prisma schema and the application schema were out of sync — better-auth was trying to query columns that didn't exist, causing connection retries that exhausted the pool. The rate limiter was a red herring ~ it just happened to create enough concurrent requests to surface the underlying schema sync issue.

**Lesson learned:** When debugging distributed systems, the symptom (rate limiting) often isn't the cause (schema mismatch). Follow the error traces, not the symptoms.

---

## 10. Database Design

PostgreSQL (Neon serverless) with Prisma ORM. The schema is intentionally simple ~ 8 models covering auth, problems, and submissions.

### Entity Relationship

```tree
User ──1:N──> Session      (auth sessions)
User ──1:N──> Account      (OAuth providers)
User ──1:N──> Submission   (code submissions)

Problem ──1:1──> TestConfig       (execution limits)
Problem ──1:N──> Submission       (user attempts)

Submission ──1:1──> ExecutionResult  (raw test JSON)
Submission ──1:N──> ExecutionLog     (real-time logs)

Verification  (standalone — email verification tokens)
```

### Key Models

**User:**

```text
id, email (unique), username (unique), role (USER|ADMIN),
xp, currentStreak, longestStreak, lastActiveAt,
createdAt, updatedAt, image
```

Gamification fields (`xp`, `currentStreak`, `longestStreak`, `lastActiveAt`) live directly on the User model rather than in a separate table. This simplifies leaderboard queries (single table scan) at the cost of schema purity.

**Problem:**

```text
id, slug (unique), title, description, instructions,
difficulty (EASY|MEDIUM|HARD), track (ROUTING|MIDDLEWARE|SECURITY|DATABASE),
submissionType (EXPRESS_API), starterCode, examples (JSON),
tags[], constraints[], isPublished
```

The `slug` is the primary identifier used in URLs and maps directly to the test directory in the Runner. `tags` and `constraints` are PostgreSQL arrays. `examples` is a JSON field for flexible structured data.

**Submission:**

```text
id, userId, problemId, codeBundle, status, output,
duration, score, isFirstTryBonus, mode (run|submit),
createdAt
```

Status progresses through: `PENDING → RUNNING → PASSED | WRONG_ANSWER | TIME_LIMIT | MEMORY_LIMIT | RUNTIME_ERROR | COMPILE_ERROR`

**Indexes:** `submissions(userId)` and `submissions(problemId)` <- the two most common query patterns.

### Neon Serverless Adapter

The database uses `@prisma/adapter-neon` with WebSocket connection pooling:

```typescript
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
```

This allows Prisma to connect to Neon's serverless PostgreSQL over WebSockets, which handles connection pooling at the proxy level. The Prisma client is instantiated as a global singleton to prevent connection leaks in development (where hot-reload would otherwise create new clients on every file change).

---

## 11. Gamification — XP, Streaks & Leaderboards

### XP System

| Difficulty | Base XP | First-Try Bonus | Max Per Problem |
| :--------- | :------ | :-------------- | :-------------- |
| EASY       | 50      | +25             | 75              |
| MEDIUM     | 100     | +25             | 125             |
| HARD       | 150     | +25             | 175             |

> Xp Awarding logic will be refined to account for partial passes (e.g., passing some test cases but not all) and to implement a more granular scoring system. Bonuses on login, daily streaks, and special events will be added in future iterations.

**Rules:**

- XP is only awarded on the **first PASS** of a problem (in Submit mode)
- First-try bonus applies if the user's very first submission for a problem passes
- Subsequent passes of the same problem don't award additional XP
- **Submission pruning** ~ On a new pass, old failed submissions for that user/problem are deleted. Only the latest passed submission is kept. This keeps the DB lean and prevents gaming.

### Streak System

**Timezone-aware** — The most technically interesting aspect. Server time is UTC, but streaks should count based on the user's local day:

```typescript
const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: timezone, // User's IANA timezone (e.g., 'America/New_York')
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const localDateStr = formatter.format(date);
```

**Logic:**

- If `lastActiveAt` is today (local time) → no-op (already counted)
- If `lastActiveAt` is yesterday → increment streak
- Otherwise → reset to 1

**Edge case:** `getUserStreakData` returns `0` if the user's `lastActiveAt` is older than yesterday ~ the streak is broken even if the DB still shows a number.

**Concurrency:** Streak updates run inside Prisma transactions to prevent race conditions when multiple submissions complete simultaneously.

### Activity Grid

A GitHub-style contribution heatmap showing the last 365 days of submissions:

- Queries submissions, groups by date, counts per day
- Cached in Redis (`user:{id}:activity-grid`) with 24-hour TTL
- Cache invalidated when a new submission is created (`invalidateActivityGrid()`)
- Returns a flat array of `{ date, count }` objects

### Leaderboard

Simple query: `User ORDER BY xp DESC, createdAt ASC` with pagination. The `createdAt` tiebreaker ensures consistent ordering when users have equal XP.

---

## 12. Observability Stack

### Structured Logging (Pino)

All services use Pino with consistent configuration:

- **Development:** `debug` level + `pino-pretty` (human-readable, colorized)
- **Production:** `info` level + JSON (machine-parseable, compatible with log aggregators)

**Child loggers** namespace logs by component:

```text
apiLogger, queueLogger, workerLogger, runnerLogger, executorLogger, dockerLogger, auditLogger
```

Every log entry includes the correlation ID, making distributed tracing straightforward.

### Error Tracking

Sentry is integrated into the API and Runner with custom error handling. Errors are captured with rich context.

### Audit Logging

Authentication events get their own structured audit trail:

```text
Events: USER_SIGNUP, USER_SIGNIN, USER_SIGNOUT,
        PASSWORD_RESET_REQUESTED, PASSWORD_RESET_COMPLETED,
        EMAIL_VERIFIED, OAUTH_SIGNIN, SESSION_CREATED
```

Each event captures IP address (from `x-forwarded-for`, `x-real-ip`, or direct socket), user-agent, and provider-specific metadata (e.g., GitHub OAuth provider info).

### Application Metrics

The MetricsService provides a custom Redis-backed metrics system with:

- **Counters** ~ Lifetime + hourly bucketed (7-day TTL for time series)
- **Gauges** ~ Current values (queue depth)
- **Timings** ~ Sorted sets with custom percentile calculation (p50, p95, p99)

  ```text
  Percentile algorithm: Linear interpolation between floor/ceil indices
  Max 100,000 entries per timing metric (auto-pruning via ZREMRANGEBYRANK)
  ```

- **Unique users** ~ HyperLogLog for memory-efficient cardinality estimation
  - Daily unique users: 30-day TTL
  - Hourly unique users: 7-day TTL

---

## 13. The Frontend ~ Next.js App Router

> Detailed frontend docs available at [Frontend README](./apps/web/README.md). This section covers the high-level architecture and tech stack.

### Tech Stack

| Technology                  | Version                    | Purpose                          |
| :-------------------------- | :------------------------- | :------------------------------- |
| Next.js                     | 16.1                       | React framework (App Router)     |
| React                       | 19.2                       | UI library                       |
| Tailwind CSS                | 4.1                        | Utility-first styling            |
| Monaco Editor               | via `@monaco-editor/react` | Code editor                      |
| Motion (Framer)             | 12.34                      | Animations                       |
| Recharts                    | 2.15                       | Admin dashboard charts           |
| react-markdown + remark-gfm | —                          | Problem description rendering    |
| Sonner                      | —                          | Toast notifications              |
| next-themes                 | —                          | Dark/light theme (default: dark) |
| Lucide React                | —                          | Icons                            |

### The Problem Workspace

The core experience is the split-pane problem workspace at `/problems/[slug]`:

**Left panel:** Problem description rendered from Markdown (instructions, examples, constraints, difficulty badge)

**Right panel:**

- Monaco editor with file tabs
- Terminal panel showing execution output
- "Run" button (quick feedback, 2 tests) and "Submit" button (full suite)

**Real-time results:** When the user clicks Run/Submit, the terminal shows live progress via SSE:

```text
 Queued...
 Running...
 Test 1: should return 200 for GET / — PASSED
 Test 2: should return 404 for unknown routes — FAILED
```

---

## 14. Shared Packages

### `@reqres/database`

The database package encapsulates all Prisma/PostgreSQL concerns:

- Prisma schema definition
- Neon serverless adapter with WebSocket pooling
- Global singleton Prisma client (prevents connection leaks in dev hot-reload)
- Seed scripts for problems and test users
- Migration management

### `@reqres/types`

Shared TypeScript DTOs and enums used across apps:

- `ProblemListDTO`, `ProblemDetailDTO`, `CreateProblemDTO`
- `LeaderboardDTO`, `SubmissionListDTO`
- `ProblemDifficulty`, `ProblemTrack`, `SubmissionStatus`

### `@reqres/utils`

Shared pure functions:

- **String:** `slugify`, `truncate`, `capitalize`, `normalizeWhitespace`
- **Validation:** `isValidEmail`, `isValidUsername`, `isStrongPassword`, `isValidCodeLength`
- **Date:** `formatDate`, `toISODateString`, `getRelativeTime`, `formatExecutionTime`, `formatMemory`

### `@reqres/eslint-config`

Layered ESLint configurations:

- `base` — JavaScript + TypeScript + Prettier + Turbo (shared foundation)
- `next` — Next.js-specific rules
- `node` — Node.js backend rules
- `react-internal` — Internal React package rules

Uses `eslint-plugin-only-warn` to convert all errors to warnings — prevents ESLint from blocking builds while still surfacing issues.

### `@reqres/typescript-config`

Shared `tsconfig.json` presets that apps extend:

- `base.json` — Strict mode, ESNext, bundler module resolution
- `node.json` — NodeNext module resolution, declaration maps
- `nextjs.json` — Next.js preset, JSX preserve
- `react-library.json` — For shared React component packages

---

## 15. Docker Infrastructure

### Three Dockerfiles, Three Purposes

**1. `runner-base.Dockerfile`**

Pre-builds a Node 20 Alpine image with all test dependencies installed:

```dockerfile
FROM node:20-alpine
WORKDIR /runner
# Install express, jest, supertest, jsonwebtoken, zod, multer
# These node_modules are reused by every submission
```

This is built once (`docker build -f docker/runner-base.Dockerfile -t reqres-runner:latest .`) and reused for every submission. The key insight: `npm install` is slow (2-5 seconds), but if `node_modules` already exist in the image, the container only needs to copy user code and run tests. This cuts execution time from ~8 seconds to ~3 seconds.

**2. `worker.Dockerfile`**

Multi-stage Bun Alpine build for the production worker:

```dockerfile
FROM oven/bun:alpine AS builder
# Install dependencies, generate Prisma client, build
FROM oven/bun:alpine AS runner
# Copy built artifacts, run as non-root user (worker:nodejs)
```

Runs as a non-root user for security. Includes Prisma client generation in the build stage.

**3. `runner.Dockerfile`**

Multi-stage build for containerizing the Runner service itself. Includes `docker-cli` so the containerized Runner can spawn sandbox containers (Docker-in-Docker pattern via socket mounting).

### Docker Compose

```yaml
services:
  redis: # Redis 7 Alpine — queues, rate limiting, metrics, caching
    # appendonly, 256MB max memory, noeviction policy

  redis-commander: # Redis GUI (debug profile only)

  worker: # Standalone worker (worker profile)
```

**Profiles:**

- Default: Just Redis
- `--profile debug`: Redis + Redis Commander GUI
- `--profile worker`: Redis + standalone worker

---

## 16. Security Model

Security is layered throughout the stack:

### Code Execution Isolation

| Layer        | Mechanism                                                        |
| :----------- | :--------------------------------------------------------------- |
| Network      | `--network=none` — no internet access from user code             |
| Filesystem   | `--read-only` root + read-only code mount                        |
| Memory       | `--memory=512m` hard limit                                       |
| CPU          | `--cpus=1.5` hard limit                                          |
| Time         | External `SIGKILL` timeout (not in-container, can't be bypassed) |
| File output  | Only `jest-results.json` is writable                             |
| Dependencies | Pre-installed in base image, no user-controlled `npm install`    |
| Cleanup      | Ephemeral containers (`--rm`) + temp workspace deletion          |

### API Security

| Layer            | Mechanism                                                     |
| :--------------- | :------------------------------------------------------------ |
| Authentication   | better-auth with session cookies, email verification required |
| Authorization    | Role-based (USER, ADMIN) + resource ownership checks          |
| Rate limiting    | Redis-backed, tiered, with IP blocking                        |
| Internal APIs    | Shared secret authentication (`x-runner-secret`)              |
| Input validation | Zod schemas on all endpoints                                  |
| CORS             | Strict origin (only `WEB_BASE_URL`) with credentials          |
| Error tracking   | PII scrubbed before Sentry (passwords, tokens, user code)     |

### Frontend Security

| Layer            | Mechanism                                                            |
| :--------------- | :------------------------------------------------------------------- |
| CSP              | Content-Security-Policy header limiting script/style/connect sources |
| HSTS             | Strict-Transport-Security enforcing HTTPS                            |
| Frame protection | X-Frame-Options: DENY                                                |
| MIME sniffing    | X-Content-Type-Options: nosniff                                      |
| Route protection | Edge middleware redirecting unauthenticated users                    |
| Secure cookies   | `Secure` flag in production, `HttpOnly`, `SameSite`                  |

### Data Protection

- User code is **never sent to Sentry** ~ the Runner's `beforeSend` hook strips `codeBundle`, `files`, `stdout`, `stderr`
- The API's `beforeSend` hook strips cookies and redacts `password`, `token`, `code` fields
- Audit logs capture auth events but never log credentials
- Error messages shown to users are sanitized (stack traces stripped, internal paths removed)

---

## 17. Design Principles & Patterns

### Fail-Open Over Fail-Closed

When infrastructure dependencies (Redis, Sentry, Resend email) are unavailable, the system degrades gracefully with warn logs rather than refusing to serve requests.

### Correlation-Based Distributed Tracing

Every request gets a CUID2 correlation ID that flows through the entire pipeline:

```text
Browser → API (generate ID) → Queue job → Worker → Runner HTTP call → Runner callback → API update
```

This makes it possible to trace a submission end-to-end across services and identify bottlenecks or failure points.

### Defensive Input Validation

Every entry point validates input with Zod:

- API routes: Request body, query params, path params
- Runner: Submission data (CUID format, slug whitelist, timeout/memory bounds)
- Internal APIs: Runner secret validation

Invalid input is rejected early with clear error messages before any processing begins.

### Graceful Shutdown

The Worker registers `SIGTERM` and `SIGINT` handlers to drain running jobs before exiting. This prevents orphaned submissions that are stuck in `RUNNING` state.

---

## 18. Challenges & How They Were Overcome

### 1. Docker Execution Performance

**Problem:** Initial Docker execution was slow (~8s per submission) because each container ran `npm install`.

**Solution:** Pre-built base image with all dependencies installed. Container startup dropped from ~8s to ~3s by eliminating the install step. The base image (`reqres-runner:latest`) includes `express`, `jest`, `supertest`, `jsonwebtoken`, `zod`, and `multer`.

### 2. The Neon Connection Pool Bug

**Problem:** Under load (especially during rate limiting testing), random 500 errors appeared with Neon connection pool exhaustion.

**Root cause:** better-auth's Prisma schema and the application schema were out of sync. better-auth tried to query non-existent columns, causing retries that exhausted the connection pool. The rate limiter created enough concurrent requests to trigger the issue.

**Solution:** Sync the schemas. Yeah lol, and also I did some dumb mistakes that took me to `drift` state with the database.

### 3. Monaco Editor CSP Conflicts

**Problem:** After adding strict Content-Security-Policy headers in `next.config.js`, the Monaco editor stopped loading ~ its CDN resources were blocked.

**Solution:** Added Monaco's CDN domain to the CSP `script-src` and `style-src` directives. The tricky part was identifying exactly which domains Monaco loads from (it lazy-loads language workers from a CDN).

### 4. SSE Through Proxies

**Problem:** SSE connections were being buffered/terminated by intermediate proxies and load balancers.

**Solution:** Set appropriate headers (`Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`) and implement keepalive events to prevent proxy timeout disconnects.

### 5. Timezone-Aware Streaks

**Problem:** Users in different timezones expected streaks to reset at their local midnight, not UTC midnight.

**Solution:** Used `Intl.DateTimeFormat` with the user's IANA timezone to determine their local date. Streak calculations compare local dates rather than UTC timestamps. Required careful handling of the "is this yesterday?" check across timezone boundaries.

### 6. Race Conditions in XP/Streak Updates

**Problem:** Rapid concurrent submissions could cause double XP awards or incorrect streak counts.

**Solution:** Wrapped XP award and streak update logic in Prisma transactions. The streak service checks "already counted today" within the transaction to prevent double-counting.

And some more smaller dumber mistakes that I won't admit to here 🙃

---

## 19. What I'd Do Differently

Looking back, a few things I'd approach differently on a second build:

1. **WebSockets instead of SSE** ~ For real-time updates, SSE works but WebSockets would enable bidirectional communication (useful for features like collaborative editing or live debugging). The SSE implementation is simpler but limits future extensibility.

2. **TypeScript execution support from day one** ~ Currently only JS is supported (TypeScript is rejected by the Runner). Adding TypeScript compilation in the container would be straightforward but was deferred. Starting with TS support would have avoided the "JS only" limitation feeling like technical debt.

3. **Sliding window rate limiting** ~ The current fixed-window algorithm has a known edge case: a burst at the end of one window + a burst at the start of the next effectively doubles the rate. A sliding window or token bucket algorithm would be more accurate.

4. **Caching layer sooner** ~ Many API responses (problem lists, leaderboard) are cacheable. Adding Redis caching for read-heavy endpoints earlier would have simplified performance optimization later.

5. **Test infrastructure from Phase 1** ~ API tests were added retroactively. Writing them alongside the API would have caught the schema sync bug earlier and provided confidence during the major Phase 3 refactor.

---

## Environment Variables Reference

<details of all environment variables used across services, their required status, and purpose. This table serves as a quick reference for developers setting up the project or deploying to production.>

| Variable                   | Service             | Required                  | Purpose                                            |
| :------------------------- | :------------------ | :------------------------ | :------------------------------------------------- |
| `PORT`                     | API, Runner         | No (defaults: 4000, 5000) | Server port                                        |
| `DATABASE_URL`             | API, Worker         | Yes                       | Neon PostgreSQL connection string                  |
| `REDIS_HOST`               | API, Worker         | Yes                       | Redis hostname                                     |
| `REDIS_PORT`               | API, Worker         | No (default: 6379)        | Redis port                                         |
| `REDIS_PASSWORD`           | API, Worker         | No                        | Redis password                                     |
| `RUNNER_BASE_URL`          | Worker              | Yes                       | Runner service URL (e.g., `http://localhost:5000`) |
| `RUNNER_SHARED_SECRET`     | API, Runner, Worker | Yes                       | Inter-service authentication                       |
| `API_CALLBACK_URL`         | Runner              | Yes                       | API callback endpoint for results                  |
| `API_BASE_URL`             | Web                 | Yes                       | API URL for server-side requests                   |
| `NEXT_PUBLIC_API_BASE_URL` | Web                 | Yes                       | API URL for client-side requests                   |
| `WEB_BASE_URL`             | API                 | Yes                       | Frontend URL (CORS origin)                         |
| `BETTER_AUTH_URL`          | API                 | Yes                       | Auth base URL                                      |
| `GITHUB_CLIENT_ID`         | API                 | No                        | GitHub OAuth (optional)                            |
| `GITHUB_CLIENT_SECRET`     | API                 | No                        | GitHub OAuth (optional)                            |
| `RESEND_API_KEY`           | API                 | No                        | Email sending (optional, degrades gracefully)      |
| `SENTRY_DSN`               | API, Runner         | No                        | Sentry error tracking (optional)                   |
| `SENTRY_ENABLED`           | API, Runner         | No                        | Force-enable Sentry in dev                         |
| `WORKER_ENABLED`           | API                 | No (default: true)        | Enable/disable embedded worker                     |
| `WORKER_CONCURRENCY`       | API, Worker         | No (default: 5)           | BullMQ worker concurrency                          |
| `LOG_LEVEL`                | API                 | No (default: info)        | Pino log level                                     |
| `NODE_ENV`                 | All                 | No                        | Environment (development/production)               |
| `JWT_SECRET`               | Runner tests        | No                        | Used by JWT test problems                          |

</details>

---

_This document reflects the architecture as of Beta version. It will evolve as new features are added and the system scales._

## Links

- [API README](./apps/api/README.md)
- [Runner README](./apps/runner/README.md)
- [Frontend README](./apps/web/README.md)
