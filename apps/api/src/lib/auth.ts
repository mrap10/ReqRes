import { betterAuth } from "better-auth";
import { prisma } from "@reqres/database";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email.js";
import { logAuditEvent, getClientIp, getUserAgent } from "./auditLogger.js";

function getOriginFromUrl(urlValue?: string): string | null {
  if (!urlValue) {
    return null;
  }

  try {
    return new URL(urlValue).origin;
  } catch {
    try {
      return new URL(`https://${urlValue}`).origin;
    } catch {
      return null;
    }
  }
}

function parseMultipleOrigins(urlString?: string): string[] {
  if (!urlString) return [];

  return urlString
    .split(",")
    .map((url) => url.trim())
    .map((url) => getOriginFromUrl(url))
    .filter((origin): origin is string => Boolean(origin));
}

function withWwwVariants(origins: string[]): string[] {
  return Array.from(
    new Set(
      origins.flatMap((origin) => {
        try {
          const url = new URL(origin);
          const host = url.hostname;

          if (host === "localhost" || host.startsWith("localhost:")) {
            return [origin];
          }

          if (host.startsWith("www.")) {
            const withoutWww = `${url.protocol}//${host.slice(4)}${url.port ? `:${url.port}` : ""}`;
            return [origin, withoutWww];
          }

          const withWww = `${url.protocol}//www.${host}${url.port ? `:${url.port}` : ""}`;
          return [origin, withWww];
        } catch {
          return [origin];
        }
      })
    )
  );
}

const trustedOrigins = withWwwVariants(
  Array.from(
    new Set(
      [
        "http://localhost:3000",
        ...parseMultipleOrigins(process.env.WEB_BASE_URL),
        getOriginFromUrl(process.env.BETTER_AUTH_URL),
      ].filter((origin): origin is string => Boolean(origin))
    )
  )
);

const authBaseUrl = process.env.BETTER_AUTH_URL || "http://localhost:4000";
const githubRedirectUrl = `${authBaseUrl}/api/auth/callback/github`;

const redirectOrigins = withWwwVariants(
  Array.from(new Set(["http://localhost:3000", ...parseMultipleOrigins(process.env.WEB_BASE_URL)]))
);

const authOrigin = getOriginFromUrl(process.env.BETTER_AUTH_URL);

const cookieDomain =
  authOrigin && process.env.NODE_ENV === "production"
    ? (() => {
        try {
          const { hostname } = new URL(authOrigin);
          const parts = hostname.split(".");

          if (parts.length < 2) {
            return hostname;
          }

          const topLevel = parts.slice(-2).join(".");
          return `.${topLevel}`;
        } catch {
          return undefined;
        }
      })()
    : undefined;

const defaultWebOrigin =
  redirectOrigins.find((origin) => origin !== "http://localhost:3000" && origin !== authOrigin) ||
  trustedOrigins.find((origin) => origin !== "http://localhost:3000" && origin !== authOrigin) ||
  redirectOrigins.find((origin) => origin !== authOrigin);

const authErrorRedirectUrl = `${defaultWebOrigin || "http://localhost:3000"}/signin`;

const isSecureAuthContext =
  process.env.NODE_ENV === "production" || (authOrigin ? authOrigin.startsWith("https://") : false);

export const auth = betterAuth({
  baseURL: authBaseUrl,
  basePath: "/api/auth",
  onAPIError: {
    errorURL: authErrorRedirectUrl,
  },
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
            redirectURI: githubRedirectUrl,
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
  account: {
    skipStateCookieCheck: true,
  },
  trustedOrigins,
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: false,
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: Boolean(cookieDomain),
      domain: cookieDomain,
    },
    cookiePrefix: "reqres",
    useSecureCookies: isSecureAuthContext,
    defaultCookieAttributes: {
      sameSite: isSecureAuthContext ? "none" : "lax",
      secure: isSecureAuthContext,
    },
  },
  allowedRedirectURLs: [
    "http://localhost:3000/problems",
    "http://localhost:3000/signin",
    "http://localhost:3000/signup",
    "http://localhost:3000/verify-email",
    ...redirectOrigins.flatMap((origin) => [
      `${origin}/problems`,
      `${origin}/signin`,
      `${origin}/signup`,
      `${origin}/verify-email`,
    ]),
    githubRedirectUrl,
  ].filter(Boolean),
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
