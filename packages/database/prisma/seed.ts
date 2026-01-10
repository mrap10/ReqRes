import { prisma } from "../src/client.js";

async function main() {
  await prisma.problem.create({
    data: {
      slug: "health-check-api",
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
                import express from 'express';

                export const app = express();
                
                // Your code here

            `,
      submissionType: "EXPRESS_API",
      isPublished: true,
      testConfig: {
        create: {
          timeoutMs: 3000,
          memoryMb: 256,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "dev@routepress.local" },
    update: {},
    create: {
      id: "6bdee8fd-e5d1-44d6-80c1-00db5a7fc86c",
      email: "dev@routepress.local",
      password: "dev-only",
      username: "devuser",
    },
  });

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
        - ❌ No \`app.listen()\`
        - ✅ Export Express \`app\`
        - ❌ No hardcoded secrets
        - ❌ No Passport or auth frameworks
        - ✅ jsonwebtoken allowed
      `,
      starterCode: `
        import express from 'express';
        import jwt from 'jsonwebtoken';

        export const app = express();

        // Your code here

      `,
      submissionType: "EXPRESS_API",
      isPublished: true,
      testConfig: {
        create: {
          timeoutMs: 5000,
          memoryMb: 256,
        },
      },
    },
  });
}

main()
  .then(() => console.log("Seeding completed."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
