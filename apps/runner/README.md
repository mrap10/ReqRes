# @reqres/runner

The code execution service for ReqRes: receives user-submitted Express.js code, runs it inside sandboxed Docker containers against Jest test suites, and reports results back to the API.

**Runtime:** Express 5.2 on Bun | **Port:** 5000 (configurable)

## Architecture

```text
POST /internal/execute (from Worker)
  │
  ├─ 1. Validate runner secret
  ├─ 2. Validate request (Zod: CUID format, slug whitelist, bounds)
  ├─ 3. Create temp workspace (/tmp/reqres-{uuid})
  ├─ 4. Write user code files (JS only)
  ├─ 5. Generate package.json + jest.config.js
  ├─ 6. Copy problem test files from tests/{slug}/
  ├─ 7. Spawn Docker container with security constraints
  ├─ 8. Parse jest-results.json
  ├─ 9. Sanitize errors (strip stack traces, limit to 5 lines)
  ├─ 10. POST result → API /internal/runner/result
  ├─ 11. POST logs → API /internal/runner/log
  └─ 12. Clean up workspace (always)
```

## Docker Sandbox

Each submission runs in an ephemeral Docker container with aggressive security constraints:

```bash
docker run \
  --rm \                              # Auto-delete after exit
  --network=none \                    # NO network access
  --read-only \                       # Immutable root filesystem
  --memory=512m \                     # Hard memory limit
  --cpus=1.5 \                        # CPU limit
  --tmpfs /tmp:rw,exec,size=512m \    # Writable temp (code runs here)
  --tmpfs /root:rw,size=64m \         # Writable home (npm cache)
  -v ${workspace}:/app:ro \           # User code (READ-ONLY)
  -v ${resultsFile}:/app/results:rw \ # Results file (WRITE)
  reqres-runner:latest \              # Pre-built base image
  sh -c "..."
```

| Constraint               | Prevents                                      |
| :----------------------- | :-------------------------------------------- |
| `--network=none`         | Data exfiltration, downloading malicious code |
| `--read-only`            | Filesystem tampering, persistent state        |
| `--memory=512m`          | Memory bombs, fork bombs                      |
| `--cpus=1.5`             | Infinite loops consuming host CPU             |
| Read-only code mount     | User modifying their own source               |
| External SIGKILL timeout | Container hung beyond timeout                 |

**Base image** (`reqres-runner:latest`) has Node 20 Alpine with pre-installed dependencies (express, jest, supertest, jsonwebtoken, zod, multer) — no `npm install` inside the container.

## Test Architecture

Each problem has a test directory: `tests/{slug}/`

```tree
tests/
└── jwt-authentication-middleware/
    ├── problem.test.js    # Jest tests using supertest
    └── setup.js           # Optional: setupFilesAfterEnv
```

Tests follow this pattern:

```javascript
const app = require("../../index"); // User's Express app
const request = require("supertest");

describe("Problem Name", () => {
  test("should handle GET /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
  });
});
```

## Key Dependencies

| Library        | Purpose                             |
| :------------- | :---------------------------------- |
| `express` 5.2  | HTTP framework                      |
| `zod`          | Request validation                  |
| `pino`         | Structured logging                  |
| `@sentry/node` | Error tracking (user code redacted) |
| `axios`        | HTTP client for API callbacks       |

## Environment Variables

| Variable               | Required           | Purpose                                |
| :--------------------- | :----------------- | :------------------------------------- |
| `PORT`                 | No (default: 5000) | Server port                            |
| `RUNNER_SHARED_SECRET` | Yes                | Auth with API (must match API's value) |
| `API_CALLBACK_URL`     | Yes                | API base URL for result/log callbacks  |
| `SENTRY_DSN`           | No                 | Error tracking                         |
| `SENTRY_ENABLED`       | No                 | Force enable in dev                    |
| `JWT_SECRET`           | No                 | Used by JWT test problems              |
| `NODE_ENV`             | No                 | Environment                            |

## Observability

- **Pino logging** with child loggers: `runnerLogger`, `executorLogger`, `dockerLogger`
- **Sentry** with aggressive PII protection — `codeBundle`, `files`, `stdout`, `stderr` are all redacted before sending. User code **never** reaches error monitoring.

## Development

```bash
# From project root (starts all services)
turbo run dev

# Runner only
cd apps/runner
bun run dev
```

**Prerequisite:** Docker Desktop must be running, and the sandbox image must be built:

```bash
docker build -f docker/runner-base.Dockerfile -t reqres-runner:latest .
```

## Links

- [Architecture](../../ARCHITECTURE.md)
- [Main Documentation](../../README.md)
- [/api](../api/README.md)
- [/web](../web/README.md)
