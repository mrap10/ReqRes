# ReqRes

Somthing like leetcode but modern and more than just DSA practice platform

## High level architecture

Browser (untrusted)

↓

API (trusted)

↓

Runner (isolated & disposable)

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

- will prob. create a new architecture md file and update these later, there

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

- Docker must be running (for code execution in containers)
- Node.js/Bun installed
- PostgreSQL running

### Environment Setup

### Running the Application

- build the optimized runner base image:

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

- run /apps/api and /apps/runner in separate terminals, simulateously

### Testing Submissions

```bash
curl -X POST http://localhost:4000/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "problemId": "<your-problem-id>",
    "code": {
      "files": {
        "index.ts": "your code here"
      }
    }
  }'
```

- Check submission status

```bash
curl http://localhost:4000/submissions/<submission-id>
```

## Troubleshooting

### Submission stuck in RUNNING

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

todo: haven't tested new problems, prolly 99% will work tho, too tired cuz of that weirdass docker error taking a whole day to fix lol

---

Will update this README as the project evolves.
