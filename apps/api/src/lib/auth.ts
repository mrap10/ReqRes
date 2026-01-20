import { betterAuth } from "better-auth";
import { prisma } from "@reqres/database";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { ExtendedUser } from "../middleware/auth.js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    async onSignUp({ user }: { user: ExtendedUser }) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          username: user.username || user.email?.split("@")[0],
        },
      });
    },
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
  callbacks: {
    async onOAuthAccountLinked({ user }: { user: ExtendedUser }) {
      if (!user.username) {
        const baseUsername = user.email.split("@")[0];
        const username = baseUsername + Math.random().toString(36).substring(2, 6);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            username,
          },
        });
      }
    },
  },
});
