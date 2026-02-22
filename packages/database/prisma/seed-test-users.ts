import { prisma } from "../src/client.js";
import { hashPassword } from "better-auth/crypto";

interface TestUser {
  email: string;
  password: string;
  username: string;
  name: string;
  role?: "USER" | "ADMIN";
  xp?: number;
}

const TEST_USERS: TestUser[] = [
  {
    email: "admin@reqres.site",
    password: "Admin@123",
    username: "admin",
    name: "Admin User",
    role: "ADMIN",
    xp: 0,
  },
  {
    email: "test@reqres.site",
    password: "Test@123",
    username: "testuser",
    name: "Test User",
    role: "USER",
    xp: 0,
  },
  {
    email: "alice@reqres.site",
    password: "Alice@123",
    username: "alice_coder",
    name: "Alice",
    role: "USER",
    xp: 0,
  },
];

async function seedTestUsers() {
  console.log("Starting test users seeding...\n");

  for (const testUser of TEST_USERS) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      if (existingUser) {
        console.log(`⊘ ${testUser.email} already exists, skipping`);
        continue;
      }

      // Hash password using better-auth's hashPassword (scrypt-based)
      const hashedPassword = await hashPassword(testUser.password);

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: testUser.email,
            username: testUser.username,
            name: testUser.name,
            emailVerified: true, // Pre-verified for testing
            role: testUser.role || "USER",
            xp: testUser.xp || 0,
          },
        });

        await tx.account.create({
          data: {
            userId: user.id,
            accountId: testUser.email, // Use email as accountId for credential provider
            providerId: "credential", // better-auth uses "credential" for email/password
            password: hashedPassword,
          },
        });
      });

      console.log(`✓ Seeded ${testUser.email} (${testUser.role || "USER"})`);
    } catch (error) {
      console.error(`✗ Failed to seed ${testUser.email}:`, error);
    }
  }

  console.log("\nTest users seeding completed!");
}

seedTestUsers()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("\nSeeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
