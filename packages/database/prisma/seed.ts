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
