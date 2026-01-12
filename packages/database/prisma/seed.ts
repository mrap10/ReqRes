import { prisma } from "../src/client.js";

async function seedUser() {
  await prisma.user.upsert({
    where: { email: "dev@reqres.site" },
    update: {},
    create: {
      id: "6bdee8fd-e5d1-44d6-80c1-00db5a7fc86c",
      email: "dev@reqres.site",
      password: "dev-only",
      username: "devuser",
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
      difficulty: "EASY",
      track: "express",
      instructions: `
                Create a GET /health endpoint that responds with:
                Status: 200
                Body: { "status": "healthy" }
            `,
      starterCode: `
                const express = require('express');
                const app = express();
                
                // Your code here

                module.exports = { app };
            `,
      submissionType: "EXPRESS_API",
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
      title: "JWT Authentication Middleware",
      description: `
        Implement JWT-based authentication middleware for an Express application.

        Your task is to create an authentication middleware that verifies JWT tokens
        provided in the \`Authorization\` header of incoming requests. The middleware
        should protect a sample route \`GET /profile\`, allowing access only to requests
        with valid tokens.

        Use the \`jsonwebtoken\` package to handle token verification. The JWT secret
        key should be retrieved from the environment variable \`JWT_SECRET\`.

        If the token is missing or invalid, the middleware should respond with a 401
        Unauthorized status. If the token is valid, the request should proceed to the
        protected route, which will return a JSON object containing the user's profile
        information extracted from the token.

        Ensure your implementation does not include any hardcoded secrets and does not
        use any authentication frameworks like Passport.js. Focus on using only
        Express and jsonwebtoken for this task.
      `,
      difficulty: "MEDIUM",
      track: "express",
      instructions: `
        Implement JWT-based authentication in an Express app.

        ### Requirements
        - Implement an authentication middleware
        - Protect a \`GET /profile\` route
        - Use JWT from \`Authorization: Bearer <token>\`
        - Verify token using \`process.env.JWT_SECRET\`

        ### Expected Behavior
        - Missing or invalid token → 401 Unauthorized
        - Valid token → return user profile

        ### Constraints
        - ⊘ No \`app.listen()\`
        - ✓ Export Express \`app\`
        - ⊘ No hardcoded secrets
        - ⊘ No Passport or auth frameworks
        - ✓ jsonwebtoken allowed
      `,
      starterCode: `
        const express = require('express');
        const jwt = require('jsonwebtoken');
        const app = express();

        // Your code here

        module.exports = { app };
      `,
      submissionType: "EXPRESS_API",
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
      description: `
        Build a complete CRUD API with an in-memory data store.

        Your task is to implement a simple REST API that manages items stored in memory.
        The API should support creating, reading, updating, and deleting items without
        using any database or file system - all data should be stored in a JavaScript
        array in memory.

        Each item should have an \`id\` (string), \`name\` (string), and \`value\` (number).
        The \`id\` should be automatically generated (you can use UUID or any unique string).

        Note: Data will be lost when the server restarts - this is expected behavior
        for an in-memory store.
      `,
      difficulty: "EASY",
      track: "express",
      instructions: `
        Implement a CRUD API with in-memory storage.

        ### Required Endpoints

        **POST /items**
        - Body: { name: string, value: number }
        - Response: 201 with created item { id, name, value }

        **GET /items**
        - Response: 200 with array of all items

        **GET /items/:id**
        - Response: 200 with item { id, name, value }
        - Response: 404 if not found

        **PUT /items/:id**
        - Body: { name: string, value: number }
        - Response: 200 with updated item
        - Response: 404 if not found

        **DELETE /items/:id**
        - Response: 204 on success
        - Response: 404 if not found

        ### Constraints
        - ✓ Store data in an in-memory array
        - ⊘ No database or file system
        - ⊘ No \`app.listen()\`
        - ✓ Export Express \`app\`
        - ✓ Generate unique IDs (UUID recommended)
      `,
      starterCode: `
        const express = require('express');
        const { randomUUID } = require('crypto');

        const app = express();
        app.use(express.json());

        // In-memory store
        const items = [];

        // Your code here

        module.exports = { app };
      `,
      submissionType: "EXPRESS_API",
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
      description: `
        Implement request validation using Zod schemas.

        Your task is to create a POST endpoint that validates incoming user data using
        Zod. The endpoint should enforce strict validation rules and return appropriate
        error responses when validation fails.

        Zod is a TypeScript-first schema validation library that allows you to define
        data schemas and validate data against them. You'll use it to ensure that all
        incoming user data meets your requirements before processing it.

        The validated data should be stored in memory (similar to the CRUD problem) and
        returned with a generated ID upon successful creation.
      `,
      difficulty: "EASY",
      track: "express",
      instructions: `
        Implement Zod validation for user registration.

        ### Required Endpoint

        **POST /users**
        - Body: { email: string, password: string, age: number }
        - Validation rules:
          • email: must be a valid email format
          • password: must be at least 8 characters long
          • age: must be a number >= 18

        ### Expected Responses

        **On validation failure:**
        - Status: 400
        - Body: { error: "Invalid request body" }

        **On success:**
        - Status: 201
        - Body: { id: string, email: string, age: number }
        - Note: Do NOT return the password

        ### Constraints
        - ✓ Use Zod for validation
        - ✓ Store users in an in-memory array
        - ⊘ No database or file system
        - ⊘ No \`app.listen()\`
        - ✓ Export Express \`app\`
      `,
      starterCode: `
        const express = require('express');
        const { z } = require('zod');
        const { randomUUID } = require('crypto');

        const app = express();
        app.use(express.json());

        // In-memory store
        const users = [];

        // Define your Zod schema here

        // Your code here

        module.exports = { app };
      `,
      submissionType: "EXPRESS_API",
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
      description: `
        Implement rate limiting middleware for an Express application.

        Your task is to create middleware that limits the number of requests a client
        can make to the server within a specified time window. This is essential for
        preventing abuse and ensuring fair usage of the API.

        The middleware should track requests based on the client's IP address and
        enforce a limit of **3 requests per 10 seconds** per IP. If a client exceeds this limit, the
        server should respond with a **429 Too Many Requests** status code.

        You may use in-memory storage to track request counts, but be mindful that
        this data will be lost when the server restarts.
      `,
      difficulty: "MEDIUM",
      track: "express",
      instructions: `
        Implement rate limiting middleware for an Express app.

        ### Requirements
        - Limit each client (by IP) to 3 requests per 10 seconds
        - Apply middleware globally
        - Respond with 429 Too Many Requests when limit is exceeded

        ### Constraints
        - ✓ Use in-memory storage for tracking
        - ⊘ No \`app.listen()\`
        - ✓ Export Express \`app\`

      `,
      starterCode: `
        const express = require('express');
        const app = express();

        // Your code here

        app.get('/', (req, res) => {
          res.send('Hello, world!');
        });

        module.exports = { app };
      `,
      submissionType: "EXPRESS_API",
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
