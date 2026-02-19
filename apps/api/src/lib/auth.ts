import { betterAuth } from "better-auth";
import { prisma } from "@reqres/database";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.js";
import { logAuditEvent, getClientIp, getUserAgent } from "./auditLogger.js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  basePath: "/api/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }, request) => {
      logAuditEvent({
        event: "PASSWORD_RESET_REQUESTED",
        userId: user.id,
        email: user.email,
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
      });

      void sendPasswordResetEmail({
        email: user.email,
        resetUrl: url,
        username: user.name || "user",
      });
    },
    onPasswordReset: async ({ user }, request) => {
      logAuditEvent({
        event: "PASSWORD_RESET_COMPLETED",
        userId: user.id,
        email: user.email,
        ip: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }, _request) => {
      void sendVerificationEmail({
        email: user.email,
        verificationUrl: url,
        username: user.name || "user",
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            mapProfileToUser: (profile) => {
              return {
                email: profile.email || `${profile.login}@users.noreply.github.com`,
                image: profile.avatar_url,
                emailVerified: true,
                username: profile.login || `github_${Date.now()}`,
              };
            },
          },
        }
      : {}),
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
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const { path, request } = ctx;
      const newSession = ctx.context.newSession;

      if (path === "/sign-up/email" && newSession) {
        logAuditEvent({
          event: "USER_SIGNUP",
          userId: newSession.user.id,
          email: newSession.user.email,
          ip: getClientIp(request),
          userAgent: getUserAgent(request),
          metadata: { provider: "email" },
        });
      }

      if (path === "/sign-in/email" && newSession) {
        logAuditEvent({
          event: "USER_SIGNIN",
          userId: newSession.user.id,
          email: newSession.user.email,
          ip: getClientIp(request),
          userAgent: getUserAgent(request),
          metadata: { provider: "email" },
        });
      }

      if (path.startsWith("/callback/github") && newSession) {
        logAuditEvent({
          event: "OAUTH_SIGNIN",
          userId: newSession.user.id,
          email: newSession.user.email,
          ip: getClientIp(request),
          userAgent: getUserAgent(request),
          metadata: { provider: "github" },
        });
      }

      if (path === "/sign-out") {
        const session = ctx.context.session;
        if (session) {
          logAuditEvent({
            event: "USER_SIGNOUT",
            userId: session.user.id,
            email: session.user.email,
            ip: getClientIp(request),
            userAgent: getUserAgent(request),
          });
        }
      }

      if (path === "/verify-email" && newSession) {
        logAuditEvent({
          event: "EMAIL_VERIFIED",
          userId: newSession.user.id,
          email: newSession.user.email,
          ip: getClientIp(request),
          userAgent: getUserAgent(request),
        });
      }
    }),
  },
});
