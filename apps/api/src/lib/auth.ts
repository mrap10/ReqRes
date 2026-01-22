import { betterAuth } from "better-auth";
import { prisma } from "@reqres/database";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      mapProfileToUser: (profile) => {
        return {
          email: profile.email || `${profile.login}@users.noreply.github.com`,
          image: profile.avatar_url,
          emailVerified: true,
          username: profile.login || `github_${Date.now()}`,
        };
      },
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
  trustedOrigins: ["http://localhost:3000"],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    cookiePrefix: "reqres",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  // todo: additional rate limiting at API gateway/reverse proxy level
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
});
