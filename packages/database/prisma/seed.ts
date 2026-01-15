import { prisma } from "../src/client.js";

async function seedUser() {
  await prisma.user.upsert({
    where: { email: "dev@reqres.site" },
    update: {},
    create: {
      id: "cmke8l4hl000304ju6o218tod",
      email: "dev@reqres.site",
      password: "dev-only",
      username: "devuser",
      xp: 1000,
    },
  });
  console.log("✓ Seeded dev user");
}

async function seedHealthCheck() {
  const existing = await prisma.problem.findUnique({
    where: { slug: "health-check" },
  });

  if (existing) {
    console.log("⊘ health-check already exists, skipping");
    return;
  }

  await prisma.problem.create({
    data: {
      slug: "health-check",
      title: "Health Check API",
      description:
        "Create a simple health check API endpoint that returns a 200 status code with a JSON response indicating the service is healthy.",
      shortDescription: "Create a health check endpoint that returns service status.",
      difficulty: "EASY",
      track: "ROUTING",
      instructions: `- Create a \`GET\` route at \`/health\`
- Return a status code of \`200\`
- Return a JSON body: \`{ "status": "healthy" }\``,
      constraints: [
        "The endpoint must be exactly '/health'",
        "The HTTP method must be GET",
        "Response must be valid JSON",
        "Status code must be exactly 200",
        "Response time < 50ms",
      ],
      examples: {
        request: {
          method: "GET",
          url: "http://localhost:3000/health",
          curl: "curl -X GET http://localhost:3000/health",
        },
        response: {
          status: "HTTP/1.1 200 OK",
          body: { status: "healthy" },
        },
      },
      starterCode: `const express = require('express');
const app = express();

// TODO: Implement the health check endpoint here

module.exports = { app };`,
      submissionType: "EXPRESS_API",
      tags: ["routing", "basics"],
      isPublished: true,
      testConfig: {
        create: {
          timeoutMs: 30000,
          memoryMb: 256,
        },
      },
    },
  });
  console.log("✓ Seeded health-check-api");
}

async function seedJwtAuth() {
  const existing = await prisma.problem.findUnique({
    where: { slug: "jwt-authentication-express" },
  });

  if (existing) {
    console.log("⊘ jwt-authentication-express already exists, skipping");
    return;
  }

  await prisma.problem.create({
    data: {
      slug: "jwt-authentication-express",
      title: "JWT Auth Middleware",
      description:
        "Implement JWT-based authentication middleware for an Express application. Your task is to create an authentication middleware that verifies JWT tokens provided in the `Authorization` header of incoming requests. The middleware should protect a sample route `GET /profile`, allowing access only to requests with valid tokens.",
      shortDescription: "Implement JWT authentication middleware in Express.",
      difficulty: "MEDIUM",
      track: "MIDDLEWARE",
      instructions: `### Requirements
- Implement an authentication middleware
- Protect a \`GET /profile\` route
- Use JWT from \`Authorization: Bearer <token>\`
- Verify token using \`process.env.JWT_SECRET\`

### Expected Behavior
- Missing or invalid token → \`401\` Unauthorized
- Valid token → return user profile from decoded token`,
      constraints: [
        "No app.listen()",
        "Export Express app",
        "No hardcoded secrets",
        "No Passport or auth frameworks",
        "Use jsonwebtoken package",
      ],
      examples: {
        request: {
          method: "GET",
          url: "http://localhost:3000/profile",
          headers: { Authorization: "Bearer <your-jwt-token>" },
          curl: 'curl -X GET http://localhost:3000/profile -H "Authorization: Bearer <token>"',
        },
        response: {
          success: {
            status: "HTTP/1.1 200 OK",
            body: { id: "123", email: "user@example.com" },
          },
          error: {
            status: "HTTP/1.1 401 Unauthorized",
            body: { error: "Unauthorized" },
          },
        },
      },
      starterCode: `const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

// Your code here

module.exports = { app };`,
      submissionType: "EXPRESS_API",
      tags: ["middleware", "security", "jwt"],
      isPublished: true,
      testConfig: {
        create: {
          timeoutMs: 30000,
          memoryMb: 256,
        },
      },
    },
  });
  console.log("✓ Seeded jwt-authentication-express");
}

async function seedCrudInMemory() {
  const existing = await prisma.problem.findUnique({
    where: { slug: "crud-in-memory-store" },
  });

  if (existing) {
    console.log("⊘ crud-in-memory-store already exists, skipping");
    return;
  }

  await prisma.problem.create({
    data: {
      slug: "crud-in-memory-store",
      title: "CRUD In-Memory Store",
      description:
        "Build a complete CRUD API with an in-memory data store. Your task is to implement a simple REST API that manages items stored in memory. Each item should have an `id` (string), `name` (string), and `value` (number). The `id` should be automatically generated using UUID.",
      shortDescription: "Build a CRUD API with in-memory data storage.",
      difficulty: "EASY",
      track: "DATABASE",
      instructions: `### Required Endpoints

**POST /items**
- Body: \`{ name: string, value: number }\`
- Response: \`201\` with created item \`{ id, name, value }\`

**GET /items**
- Response: \`200\` with array of all items

**GET /items/:id**
- Response: \`200\` with item \`{ id, name, value }\`
- Response: \`404\` if not found

**PUT /items/:id**
- Body: \`{ name: string, value: number }\`
- Response: \`200\` with updated item
- Response: \`404\` if not found

**DELETE /items/:id**
- Response: \`204\` on success
- Response: \`404\` if not found`,
      constraints: [
        "Store data in an in-memory array",
        "No database or file system",
        "No app.listen()",
        "Export Express app",
        "Generate unique IDs (UUID recommended)",
      ],
      examples: {
        create: {
          request: {
            method: "POST",
            url: "http://localhost:3000/items",
            body: { name: "Widget", value: 100 },
            curl: 'curl -X POST http://localhost:3000/items -H "Content-Type: application/json" -d \'{"name":"Widget","value":100}\'',
          },
          response: {
            status: "HTTP/1.1 201 Created",
            body: { id: "abc-123", name: "Widget", value: 100 },
          },
        },
        getAll: {
          request: {
            method: "GET",
            url: "http://localhost:3000/items",
            curl: "curl -X GET http://localhost:3000/items",
          },
          response: {
            status: "HTTP/1.1 200 OK",
            body: [{ id: "abc-123", name: "Widget", value: 100 }],
          },
        },
      },
      starterCode: `const express = require('express');
const { randomUUID } = require('crypto');

const app = express();
app.use(express.json());

// In-memory store
const items = [];

// Your code here

module.exports = { app };`,
      submissionType: "EXPRESS_API",
      tags: ["crud", "in-memory", "basics"],
      isPublished: true,
      testConfig: {
        create: {
          timeoutMs: 30000,
          memoryMb: 256,
        },
      },
    },
  });
  console.log("✓ Seeded crud-in-memory-store");
}

async function seedZodValidation() {
  const existing = await prisma.problem.findUnique({
    where: { slug: "zod-validation" },
  });

  if (existing) {
    console.log("⊘ zod-validation already exists, skipping");
    return;
  }

  await prisma.problem.create({
    data: {
      slug: "zod-validation",
      title: "Zod Validation Middleware",
      description:
        "Implement request validation using Zod schemas. Your task is to create a POST endpoint that validates incoming user data using Zod. The endpoint should enforce strict validation rules and return appropriate error responses when validation fails.",
      shortDescription: "Implement request validation using Zod schemas.",
      difficulty: "EASY",
      track: "MIDDLEWARE",
      instructions: `### Required Endpoint

**POST /users**
- Body: \`{ email: string, password: string, age: number }\`
- Validation rules:
  - \`email\`: must be a valid email format
  - \`password\`: must be at least 8 characters long
  - \`age\`: must be a number >= 18

### Expected Responses

**On validation failure:**
- Status: \`400\`
- Body: \`{ error: "Invalid request body" }\`

**On success:**
- Status: \`201\`
- Body: \`{ id: string, email: string, age: number }\`
- Note: Do NOT return the password`,
      constraints: [
        "Use Zod for validation",
        "Store users in an in-memory array",
        "No database or file system",
        "No app.listen()",
        "Export Express app",
      ],
      examples: {
        success: {
          request: {
            method: "POST",
            url: "http://localhost:3000/users",
            body: { email: "user@example.com", password: "securepass123", age: 25 },
            curl: 'curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d \'{"email":"user@example.com","password":"securepass123","age":25}\'',
          },
          response: {
            status: "HTTP/1.1 201 Created",
            body: { id: "abc-123", email: "user@example.com", age: 25 },
          },
        },
        failure: {
          request: {
            method: "POST",
            url: "http://localhost:3000/users",
            body: { email: "invalid", password: "short", age: 15 },
          },
          response: {
            status: "HTTP/1.1 400 Bad Request",
            body: { error: "Invalid request body" },
          },
        },
      },
      starterCode: `const express = require('express');
const { z } = require('zod');
const { randomUUID } = require('crypto');

const app = express();
app.use(express.json());

// In-memory store
const users = [];

// Define your Zod schema here

// Your code here

module.exports = { app };`,
      submissionType: "EXPRESS_API",
      tags: ["validation", "zod", "middleware"],
      isPublished: true,
      testConfig: {
        create: {
          timeoutMs: 30000,
          memoryMb: 256,
        },
      },
    },
  });
  console.log("✓ Seeded zod-validation");
}

async function seedRateLimitingMiddleware() {
  const existing = await prisma.problem.findUnique({
    where: { slug: "rate-limiting-middleware" },
  });

  if (existing) {
    console.log("⊘ rate-limiting-middleware already exists, skipping");
    return;
  }

  await prisma.problem.create({
    data: {
      slug: "rate-limiting-middleware",
      title: "Rate Limiting Middleware",
      description:
        "Implement rate limiting middleware for an Express application. Your task is to create middleware that limits the number of requests a client can make to the server within a specified time window. This is essential for preventing abuse and ensuring fair usage of the API.",
      shortDescription: "Implement rate limiting middleware in Express.",
      difficulty: "MEDIUM",
      track: "MIDDLEWARE",
      instructions: `### Requirements
- Limit each client (by IP) to **3 requests per 10 seconds**
- Apply middleware globally to all routes
- Respond with \`429 Too Many Requests\` when limit is exceeded

### Implementation Details
- Track requests based on the client's IP address
- Use in-memory storage to track request counts
- Reset the counter after the time window expires`,
      constraints: [
        "Use in-memory storage for tracking",
        "No app.listen()",
        "Export Express app",
        "Track requests by IP address",
        "Time window: 10 seconds",
      ],
      examples: {
        success: {
          request: {
            method: "GET",
            url: "http://localhost:3000/",
            curl: "curl -X GET http://localhost:3000/",
          },
          response: {
            status: "HTTP/1.1 200 OK",
            body: "Hello, world!",
          },
        },
        rateLimited: {
          request: {
            method: "GET",
            url: "http://localhost:3000/",
            note: "After 3 requests within 10 seconds",
          },
          response: {
            status: "HTTP/1.1 429 Too Many Requests",
            body: { error: "Too many requests" },
          },
        },
      },
      starterCode: `const express = require('express');
const app = express();

// Your rate limiting middleware here

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

module.exports = { app };`,
      submissionType: "EXPRESS_API",
      tags: ["middleware", "rate-limiting", "security"],
      isPublished: true,
      testConfig: {
        create: {
          timeoutMs: 60000,
          memoryMb: 256,
        },
      },
    },
  });
  console.log("✓ Seeded rate-limiting-middleware");
}

async function main() {
  console.log("Starting database seeding...\n");

  await seedUser();

  await seedHealthCheck();
  await seedJwtAuth();
  await seedCrudInMemory();
  await seedZodValidation();
  await seedRateLimitingMiddleware();

  console.log("\nSeeding completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("\nSeeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
