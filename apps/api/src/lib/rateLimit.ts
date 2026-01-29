// currently using only default tier, 'premium' is for ~ if expanded in future
export type RateLimitTier = "default" | "premium" | "admin";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const RATE_LIMIT_TIERS: Record<RateLimitTier, RateLimitConfig> = {
  default: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },
  premium: {
    windowMs: 60 * 1000,
    maxRequests: 500,
  },
  admin: {
    windowMs: 60 * 1000,
    maxRequests: Infinity,
  },
};

export const ENDPOINT_OVERRIDES: Record<string, RateLimitConfig> = {
  "POST:/api/auth/sign-in": {
    windowMs: 60 * 1000,
    maxRequests: 5,
  },
  "POST:/api/auth/sign-up": {
    windowMs: 60 * 1000,
    maxRequests: 3,
  },
  "POST:/api/auth/forgot-password": {
    // left to be implemented
    windowMs: 60 * 1000,
    maxRequests: 3,
  },
  "POST:/api/auth/reset-password": {
    windowMs: 60 * 1000,
    maxRequests: 3,
  },
};

export function getRateLimitConfig(
  method: string,
  path: string,
  tier: RateLimitTier = "default"
): RateLimitConfig {
  const endpointKey = `${method.toUpperCase()}:${path}`;

  if (ENDPOINT_OVERRIDES[endpointKey]) {
    return ENDPOINT_OVERRIDES[endpointKey];
  }

  if (ENDPOINT_OVERRIDES[path]) {
    return ENDPOINT_OVERRIDES[path];
  }

  return RATE_LIMIT_TIERS[tier];
}

export function generateRateLimitKey(
  identifier: string,
  method: string,
  path: string,
  windowMs: number
): string {
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const pathWithoutQuery = path.split("?")[0] ?? path;
  const normalizedPath = pathWithoutQuery.replace(/\/+$/, "") || "/";
  return `ratelimit:${identifier}:${method}:${normalizedPath}:${windowStart}`;
}
