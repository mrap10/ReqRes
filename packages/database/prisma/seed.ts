import { prisma } from "../src/client.js";
import { problems } from "./problems-data.js";
import { SubmissionType, Difficulty, ProblemTrack } from "../src/generated/prisma-client/index.js";

// Note: For test users with email/password authentication, use:
// bun run db:seed-test-users
// This will create pre-verified users with credentials for testing

async function seedUser() {
  await prisma.user.upsert({
    where: { email: "dev@reqres.site" },
    update: {},
    create: {
      email: "dev@reqres.site",
      username: "devuser",
      xp: 0,
      emailVerified: true,
      role: "USER",
      name: "Dev",
    },
  });

  console.log("\u2713 Seeded user: dev@reqres.site");
}

async function seedProblems() {
  const counts = { created: 0, skipped: 0 };
  const byDifficulty: Record<string, number> = {};

  for (const problemData of problems) {
    const existing = await prisma.problem.findUnique({
      where: { slug: problemData.slug },
    });

    if (existing) {
      console.log(`\u2298 ${problemData.slug} (already exists)`);
      counts.skipped++;
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

    byDifficulty[problemData.difficulty] = (byDifficulty[problemData.difficulty] || 0) + 1;
    counts.created++;
    console.log(`\u2713 ${problemData.slug} [${problemData.difficulty}]`);
  }

  console.log(`\nProblems: ${counts.created} created, ${counts.skipped} skipped (already existed)`);
  if (counts.created > 0) {
    const breakdown = Object.entries(byDifficulty)
      .map(([d, c]) => `${c} ${d.toLowerCase()}`)
      .join(", ");
    console.log(`Breakdown: ${breakdown}`);
  }
}

async function main() {
  console.log("Starting database seeding...\n");
  console.log(`Source: problems.json → ${problems.length} published problems\n`);

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
