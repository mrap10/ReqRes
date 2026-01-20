import { betterAuth } from "better-auth";
import { prisma } from "@reqres/database";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
        unique: true,
      },
      xp: {
        type: "number",
        defaultValue: 0,
      },
      role: {
        type: "string",
        defaultValue: "USER",
      },
    },
  },
});
