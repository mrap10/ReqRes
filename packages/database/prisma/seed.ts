import { prisma } from "../src/client.js";
import { problems } from "./problems-data.js";
import { SubmissionType, Difficulty, ProblemTrack } from "../src/generated/prisma-client/index.js";

// Note: For test users with email/password authentication, use:
// bun run db:seed-test-users
// This will create pre-verified users with credentials for testing

async function seedUser() {
  // Seed a basic user (no password, expects OAuth login)
  await prisma.user.upsert({
    where: { email: "dev@reqres.site" },
    update: {},
    create: {
      email: "dev@reqres.site",
      username: "devuser",
      xp: 225,
      emailVerified: true,
      role: "USER",
      name: "Dev",
    },
  });

  console.log("✓ Seeded user");
}

async function seedProblems() {
  // 3 easy problems (indices 0, 1, 2) and 2 medium problems (indices 3, 4)
  const problemsToSeed = problems.slice(0, 5);

  for (const problemData of problemsToSeed) {
    const existing = await prisma.problem.findUnique({
      where: { slug: problemData.slug },
    });

    if (existing) {
      console.log(`⊘ ${problemData.slug} already exists, skipping`);
      continue;
    }

    await prisma.problem.create({
      data: {
        ...problemData,
        testConfig: {
          create: problemData.testConfig,
        },
        submissionType: problemData.submissionType as SubmissionType,
        difficulty: problemData.difficulty as Difficulty,
        track: problemData.track as ProblemTrack,
      },
    });

    console.log(`✓ Seeded ${problemData.slug}`);
  }
}

async function main() {
  console.log("Starting database seeding...\n");

  await seedUser();
  await seedProblems();

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
