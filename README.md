# ReqRes

🔗 [reqres.online](https://reqres.online)

Solve real-world **Express.js challenges** ~ build APIs, write middleware, implement auth flows ~ and get instant feedback in a sandboxed environment.

Instead of reversing linked lists, you'll build JWT authentication middleware, implement CRUD APIs with error handling, configure CORS, and more. Your code runs in isolated Docker containers, tested with Jest + Supertest, scored in real-time.

## Features

- **Curated challenges** across 4 tracks: Routing, Middleware, Security, Database with difficulty levels from Easy to Hard
- **XP & streaks** ~ Gamification with difficulty-based XP, first-try bonuses, and daily streaks
- **Leaderboard** ~ Global ranking by XP
- **Activity grid** ~ GitHub-style contribution heatmap on your profile
- **Run mode** (quick 2-test feedback) and **Submit mode** (full test suite + scoring)
- **Auth** ~ Email/password + GitHub OAuth with email verification
- **Monaco code editor** in the browser with file tabs and syntax highlighting
- **Sandboxed execution** ~ Docker containers with no network, read-only filesystem, memory/CPU limits
- **Real-time results** via Server-Sent Events ~ watch tests pass/fail as they run

## Tech Stack

| Layer          | Technology                                          |
| :------------- | :-------------------------------------------------- |
| Frontend       | Next.js 16, React 19, Tailwind CSS 4, Monaco Editor |
| API            | Express 5, Bun runtime, Zod validation              |
| Auth           | better-auth (sessions, OAuth, email verification)   |
| Database       | PostgreSQL (Neon serverless), Prisma 7              |
| Queue          | BullMQ, Redis 7                                     |
| Code Execution | Docker (ephemeral containers), Jest, Supertest      |
| Observability  | Sentry, Pino structured logging                     |
| Email          | Resend                                              |
| Monorepo       | Turborepo, Bun workspaces                           |

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- [Bun](https://bun.sh/) installed
- PostgreSQL instance ([Neon](https://neon.tech/) free tier works great)

### 1. Clone & install

```bash
git clone git@github.com:mrap10/ReqRes.git
cd ReqRes
bun install
```

### 2. Start Redis

```bash
docker compose up -d
docker compose ps   # Verify it's running
```

### 3. Build the sandbox image (one-time)

```bash
docker build -f docker/runner-base.Dockerfile -t reqres-runner:latest .
```

Verify: `docker run --rm reqres-runner:latest node --version`

### 4. Configure environment

```bash
# API
cd apps/api
cp .env.example .env
# Set: DATABASE_URL, REDIS_HOST=localhost, RUNNER_SHARED_SECRET, WEB_BASE_URL, BETTER_AUTH_URL

# Runner
cd ../runner
cp .env.example .env
# Set: RUNNER_SHARED_SECRET (must match API), API_CALLBACK_URL
```

<details>
<summary><strong>Full Environment Variable Reference</strong></summary>

<br />

| Variable                   | Service     | Required | Purpose                                               |
| -------------------------- | ----------- | -------- | ----------------------------------------------------- |
| `DATABASE_URL`             | API         | Yes      | PostgreSQL connection string                          |
| `REDIS_HOST`               | API         | Yes      | Redis hostname (localhost for dev)                    |
| `REDIS_PORT`               | API         | No       | Redis port (default: 6379)                            |
| `RUNNER_SHARED_SECRET`     | API, Runner | Yes      | Inter-service auth (same value in both)               |
| `RUNNER_BASE_URL`          | API         | Yes      | Runner URL (e.g., `http://localhost:5000`)            |
| `API_CALLBACK_URL`         | Runner      | Yes      | API callback URL (e.g., `http://localhost:4000`)      |
| `WEB_BASE_URL`             | API         | Yes      | Frontend URL for CORS (e.g., `http://localhost:3000`) |
| `API_BASE_URL`             | Web         | Yes      | API URL for SSR                                       |
| `NEXT_PUBLIC_API_BASE_URL` | Web         | Yes      | API URL for client-side                               |
| `BETTER_AUTH_URL`          | API         | Yes      | Auth base URL                                         |
| `GITHUB_CLIENT_ID`         | API         | No       | GitHub OAuth (optional)                               |
| `GITHUB_CLIENT_SECRET`     | API         | No       | GitHub OAuth (optional)                               |
| `RESEND_API_KEY`           | API         | No       | Email sending (optional)                              |
| `SENTRY_DSN`               | API, Runner | No       | Error tracking (optional)                             |
| `WORKER_ENABLED`           | API         | No       | Embedded worker (default: true)                       |
| `WORKER_CONCURRENCY`       | API         | No       | Parallel jobs (default: 5)                            |

</details>

### 5. Set up the database

```bash
cd packages/database
bunx prisma migrate dev    # Run migrations
bunx prisma db seed        # Seed problems + test users
```

### 6. Start everything

```bash
# From project root
turbo run dev
```

This starts **API** (:4000) + **Runner** (:5000) + **Web** (:3000) with hot-reload.

Open **<http://localhost:3000>** and start solving!

> In development, the API runs with an embedded BullMQ worker by default, so you don't need a separate worker process.

### Quick test with curl

```bash
# Create a submission (needs valid auth cookie + problem ID)
curl -X POST http://localhost:4000/submissions \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "problemId": "<problem-id>",
    "code": {
      "files": {"index.js": "your code here"},
      "entryPoint": "index.js"
    }
  }'

# Watch real-time updates via SSE
curl -N http://localhost:4000/submissions/<submission-id>/stream \
  -H "Cookie: your-auth-cookie"
```

## Project Structure

```tree
reqres/
├── apps/
│   ├── api/            # Express 5 API + embedded BullMQ worker
│   ├── runner/         # Code execution service (Docker orchestrator)
│   └── web/            # Next.js 16 frontend
├── packages/
│   ├── database/       # Prisma schema, client, seeds
│   ├── types/          # Shared TypeScript DTOs & enums
│   ├── utils/          # Shared utility functions
│   ├── eslint-config/  # Shared ESLint presets
│   └── typescript-config/  # Shared tsconfig presets
├── docker/             # Dockerfiles (sandbox, worker, runner)
├── docker-compose.yml  # Redis + optional standalone worker
└── turbo.json          # Turborepo pipeline config
```

See each app's README for module-specific details:

- [/api](apps/api/README.md) — API routes, middleware, services
- [/runner](apps/runner/README.md) — Execution pipeline, Docker sandbox
- [/web](apps/web/README.md) — Frontend pages, components, auth flow

## How It Works

1. **User writes code** in the Monaco editor and clicks Run or Submit
2. **API** validates, saves to DB, enqueues a BullMQ job
3. **Worker** picks the job, sends code to the Runner
4. **Runner** creates a temp workspace, spawns a sandboxed Docker container
5. **Docker** runs Jest tests against the user's Express app (no network, read-only FS, resource limits)
6. **Runner** parses results, callbacks to the API
7. **SSE** streams real-time progress to the browser
8. **Results** displayed in the terminal panel with pass/fail details

For the full technical deep dive: architecture evolution, design decisions, security model, and learnings ~ see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Available Problems (will be expanded after stable v1 release)

| #   | Problem                       | Difficulty | Track      |
| :-- | :---------------------------- | :--------- | :--------- |
| 1   | Hello Express API             | Easy       | Routing    |
| 2   | Query Parameter Parser        | Easy       | Routing    |
| 3   | Request Body Parser           | Easy       | Routing    |
| 4   | Path Parameters               | Easy       | Routing    |
| 5   | Custom Error Handler          | Easy       | Middleware |
| 6   | Request Logger Middleware     | Medium     | Middleware |
| 7   | In-Memory CRUD API            | Medium     | Routing    |
| 8   | Input Validation Middleware   | Medium     | Middleware |
| 9   | API Versioning                | Medium     | Routing    |
| 10  | CORS Configuration            | Medium     | Security   |
| 11  | File Upload Handler           | Hard       | Middleware |
| 12  | JWT Authentication Middleware | Hard       | Security   |
| 13  | JWT with Refresh Tokens       | Hard       | Security   |
| 14  | GraphQL-like Query API        | Hard       | Routing    |
| 15  | Rate Limiting Middleware      | Hard       | Middleware |

## Standalone Worker (Production)

For production-like setup where the worker runs as a separate process:

```bash
# Via docker compose
docker compose --profile worker up -d

# Or manually
cd apps/api
WORKER_ENABLED=false bun run dev:api-only  # API without embedded worker
bun run worker:dev                          # Standalone worker
```

## Monitoring

```bash
# Redis queue status
docker exec -it reqres-redis redis-cli
> LLEN bull:submissionQueue:wait     # Waiting jobs
> LLEN bull:submissionQueue:active   # Processing jobs

# Redis Commander GUI (debug profile)
docker compose --profile debug up -d
# Open http://localhost:8081
```

Admin dashboard at `/admin/dashboard` (requires admin role) shows real-time metrics, queue depth, success rates, and daily active users.

## Troubleshooting

<details>
<summary><strong>Submission stuck in PENDING</strong></summary>

- Check the worker is running (look for `[Worker] Processing job...` in API logs)
- Verify Redis: `docker compose ps`
- Verify Runner is running

```bash
docker exec -it reqres-redis redis-cli
> LLEN bull:submissionQueue:wait
```

</details>

<details>
<summary><strong>Runner not responding (ECONNREFUSED)</strong></summary>

- Check both API and Runner services are running
- Verify `RUNNER_BASE_URL` and `API_CALLBACK_URL` are correct
- Check Docker Desktop is running

</details>

<details>
<summary><strong>Docker issues</strong></summary>

| Issue                           | Fix                                                  |
| :------------------------------ | :--------------------------------------------------- |
| Cannot connect to Docker daemon | Start Docker Desktop                                 |
| Execution timeout               | Restart Docker Desktop or increase `timeoutMs`       |
| Permission denied (Linux/Mac)   | `sudo usermod -aG docker $USER` then re-login        |
| Drive not shared (Windows)      | Docker Desktop → Settings → Resources → File Sharing |
| Slow performance (Windows)      | Enable WSL2 backend in Docker Desktop settings       |

</details>

<details>
<summary><strong>Database connection errors</strong></summary>

- Verify PostgreSQL is running
- Check `DATABASE_URL` is correct
- Run migrations: `bunx prisma migrate dev`

</details>

## Contributing

Contributions are welcome! Here's how to get started:

### Adding a New Problem

1. Create a test directory: `apps/runner/tests/{your-problem-slug}/`
2. Add `problem.test.js` (and optional `setup.js`) using the supertest pattern:

   ```javascript
   const app = require("../../index");
   const request = require("supertest");

   describe("Your Problem", () => {
     test("should do something", async () => {
       const res = await request(app).get("/endpoint");
       expect(res.status).toBe(200);
     });
   });
   ```

3. Add the slug to the whitelist in `apps/runner/src/services/executor.ts`
4. Seed the problem in the database via `packages/database/prisma/`

### Development Workflow

```bash
bun install                  # Install all dependencies
turbo run dev                # Start all services with hot-reload
turbo run lint               # Lint all packages
turbo run check-types        # Type-check all packages
turbo run build              # Build all packages
```

### Code Style

- TypeScript strict mode across all packages
- ESLint + Prettier (runs via lint-staged on commit)
- Pino structured logging (no `console.log`)
- Zod validation on all API inputs

## Architecture Deep Dive

For comprehensive technical documentation — the full evolution from MVP to current architecture, design decisions, security model, challenge breakdowns, and lessons learned — see **[ARCHITECTURE.md](ARCHITECTURE.md)**.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
