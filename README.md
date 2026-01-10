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

---

## Steps to run locally

### Prerequisites

- Docker must be running (for code execution in containers)
- Node.js/Bun installed
- PostgreSQL running

### Environment Setup

### Running the Application

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

Will update this README as the project evolves.
