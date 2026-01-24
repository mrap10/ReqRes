# ReqRes

Somthing like leetcode but modern and for backend (express for now, will extend as needed)

## Architecture overview

```tree
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   API       │────▶│   Redis     │────▶│   Worker    │
│   (Next.js) │◀────│   (Express) │◀────│   (Queue)   │◀────│   (BullMQ)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                                        │
      │                   │                                        ▼
      │                   │                                  ┌─────────────┐
      │◀──────────────────│◀───────────────────────────────▶│   Runner    │
      │       SSE         │                                  │   (Docker)  │
      │                   │                                  └─────────────┘
```

Flow:

1. **User submits code** → Frontend sends POST to `/submissions`
2. **API queues job** → Creates submission in DB, adds job to Redis queue
3. **Worker picks up job** → Processes submission, calls Runner service
4. **Real-time updates** → Frontend receives updates via SSE (Server-Sent Events)
5. **Completion** → Worker updates DB, SSE sends final result

---

## Runner

- does the heavy lifting of executing user submissions in a secure environment

- pulls the submission code from the database, runs it against predefined test cases, and reports the results back to the API.

### Workflow

```tree
User submits code → API creates submission (PENDING)
    ↓
API sends to Runner → Runner creates temp workspace
    ↓
Writes user code + tests + configs → Runs Docker with Jest --json
    ↓
Docker outputs to jest-results.json → Runner reads file
    ↓
Parses results → Sends back to API callback
    ↓
API updates: status=PASSED/FAILED, stores results JSON
    ↓
User fetches submission → Gets detailed test results
```

---

## Current Architecture Overview (docker x runner explanation)

### Queue-Based Execution (Phase 3 Update!)

We now use **BullMQ + Redis** for handling submission spikes without overloading the runner:

**Old Flow:** User → API → Runner (direct) → Response (could crash under load)  
**New Flow:** User → API → Queue → Worker → Runner → Response (via SSE)

**Why queues?**

- Handles submission spikes gracefully (100 concurrent users? no problem)
- Workers scale independently (add more workers = more throughput)
- Real-time updates via SSE (watch your code execute live!)
- Submissions never get lost (Redis persistence)

**Architecture:**

- **Redis:** Job queue storage, persisted to disk
- **Worker:** Picks jobs from queue, calls runner, updates DB
- **SSE:** Real-time streaming of submission status to frontend

For detailed setup, testing, and production deployment → (will add later)

### dockerRun.ts - Code Execution Engine

Handles secure code execution in isolated Docker containers:

**Workflow:**

1. Creates temp workspace with user's transpiled JS code
2. Spawns Docker container with security limits (memory, CPU, read-only filesystem)
3. Mounts workspace as read-only + Jest results file as writable
4. Container copies files to `/tmp`, runs Jest tests, writes results to mounted file
5. Host reads results JSON after container exits
6. Returns parsed Jest output (passed/failed tests, errors)

- Docker executes JS code only (for now, will prob. extend it to TS in v1.1+)

Runner service uses **ephemeral containers** - they're created on-demand and destroyed after each submission:

```typescript
// In dockerRun.ts
docker run --rm \           // --rm = auto-delete after execution
  node:20-alpine \          // Uses official Node.js Alpine image (lightweight)
  sh -c "npm install && npm test"
```

Why this approach?

- no image building needed, each submission gets a clean environment, automatic cleanup, simple for MVP

Run locally with Docker Desktop running.
Check with: (if empty table appears, Docker is running)

```powershell
docker ps
```

### Docker commands used by Runner

```bash
docker run \
  --rm \                    # Remove container after exit
  --network none \          # No internet access (security)
  --memory=256m \           # Limit RAM to 256MB
  --cpus=0.5 \             # Limit to 0.5 CPU cores
  --read-only \            # Filesystem is read-only (security)
  --tmpfs /tmp:rw \        # Writable temp directory
  -v "C:/path":/app:ro \   # Mount user code (read-only)
  -w /app \                # Working directory
  node:20-alpine \         # Image to use
  sh -c "npm test"         # Command to run
```

| Flag             | Purpose              | Why?                        |
| :--------------- | :------------------- | :-------------------------- |
| `--network none` | No internet          | Prevent data exfiltration   |
| `--read-only`    | Immutable filesystem | Can't modify system         |
| `--memory=256m`  | RAM limit            | Prevent memory bombs        |
| `--cpus=0.5`     | CPU limit            | Prevent infinite loops      |
| `:ro` mount      | Read-only code       | Can't modify submitted code |

## Common Docker Issues & Fixes

### "Cannot connect to Docker daemon"

-> **Fix:** Start Docker Desktop

### "Execution timeout"

-> **Causes:**

1. Infinite loop in user code
2. Tests taking too long
3. Docker is slow/unresponsive

**Fix:** Restart Docker Desktop or increase `timeoutMs`

### "Permission denied" (Linux/Mac)

```bash
sudo usermod -aG docker $USER
# Then logout and login
```

### "Drive not shared" (Windows)

-> **Fix:** Docker Desktop → Settings → Resources → File Sharing → Add your project drive

### "Slow performance" (Windows)

-> **Fix:** Use WSL2 backend (Docker Desktop → Settings → General → Use WSL2 based engine)

---

## Steps to run locally

### Prerequisites

- **Docker Desktop** running (for Redis + code execution in containers)
- Node.js/Bun installed
- PostgreSQL running

### Environment Setup

1. **Start Redis** (required for queue system)

   ```bash
   # From project root
   docker-compose up -d

   # Verify it's running
   docker-compose ps
   ```

2. **Configure API environment**

   ```bash
   cd apps/api
   cp .env.example .env
   # Edit .env and set:
   # - REDIS_HOST=localhost
   # - REDIS_PORT=6379
   # - RUNNER_SHARED_SECRET=your-secret
   # - Other values as needed
   ```

3. **Configure Runner environment**

   ```bash
   cd apps/runner
   cp .env.example .env
   # Make sure RUNNER_SHARED_SECRET matches API's secret
   ```

### Running the Application

**You need 4 terminals:**

```bash
# Terminal 1: Redis (already started via docker-compose)
docker-compose ps  # Just verify it's running

# Terminal 2: API Server (includes embedded worker for dev)
cd apps/api
bun run dev

# Terminal 3: Runner Service
cd apps/runner
bun run dev

# Terminal 4: Frontend
cd apps/web
bun run dev
```

**For production-like setup** (separate worker process):

```bash
# Terminal 2: API only (no embedded worker)
cd apps/api
bun run dev:api-only

# Terminal 3: Dedicated Worker
cd apps/api
bun run worker:dev

# Terminal 4: Runner
cd apps/runner
bun run dev

# Terminal 5: Frontend
cd apps/web
bun run dev
```

Open `http://localhost:3000` and start solving problems!

### Build the optimized runner base image (one-time setup)

```bash
# From the project root directory
docker build -f docker/runner-base.Dockerfile -t reqres-runner:latest .
```

- verify the Image

```bash
# Check image size
docker images reqres-runner:latest

# Test the image
docker run --rm reqres-runner:latest node --version
docker run --rm reqres-runner:latest npm list --depth=0
```

### Quick Testing

Submit code via the frontend at `http://localhost:3000` or use curl:

```bash
# Create a submission (you'll need a valid auth cookie and problem ID)
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

# Get final results
curl http://localhost:4000/submissions/<submission-id> \
  -H "Cookie: your-auth-cookie"
```

### Monitoring the Queue

```bash
# Check Redis queue status
docker exec -it reqres-redis redis-cli

# In Redis CLI:
> KEYS bull:*  # View all queues
> LLEN bull:submissionQueue:wait  # Check waiting jobs
> LLEN bull:submissionQueue:active  # Check processing jobs

# Optional: Start Redis Commander UI for visual monitoring
docker-compose --profile debug up -d
# Open http://localhost:8081
```

## Troubleshooting

### Submission stuck in PENDING

**Possible causes:**

- Worker not running (check terminal 2/3)
- Redis connection failed (check `docker-compose ps`)
- Runner not running (terminal 3/4)

**Debug:**

```bash
# Check if worker is processing
# Look for "[Worker] Processing job..." in API logs

# Check queue depth
docker exec -it reqres-redis redis-cli
> LLEN bull:submissionQueue:wait
```

### Runner not responding (ECONNREFUSED)

- Check if both API and Runner services are running
- Check if Docker is running
- Verify environment variables are set correctly
- Check logs in both terminals

### Docker errors

- Ensure Docker Desktop is running
- On Windows, make sure WSL2 backend is enabled

### Database connection errors

- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Run migrations: `bunx prisma migrate dev`

---

## some problems identified (will fix them in phase 3)

- uneven problem tracks display in /leaderboard 's user submission history
- need to test more with seeded users and some more distributed submissions
- tested with 15 concurrent submissions, ~4 of them failed with docker timeout errors (need to investigate more, prolly happening due to rate-limit problem)
- will add more bugs here

---

phase 1 completed - MVP achieved! (sort of)

phase 2 completed - ui, editor, leaderboard, stats, BE integration, runner improvements and more

- learned a bit more about using refs
- "that" express problem came again (route order lmao)
- handling refs and editor/terminal layout was hard bits here. other were pretty much db queries and some api/runner improvements

---

Will update this README as the project evolves.
