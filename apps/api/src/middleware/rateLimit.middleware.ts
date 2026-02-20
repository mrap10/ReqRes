import { NextFunction, Request, Response } from "express";
import { Redis } from "ioredis";
import { apiLogger } from "../lib/logger.js";
import {
  getRateLimitConfig,
  generateRateLimitKey,
  RateLimitTier,
  RateLimitConfig,
} from "../lib/rateLimit.js";

const createRateLimitRedis = () => {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 5) {
        apiLogger.error("Rate limit Redis connection failed after 5 retries");
        return null;
      }
      return Math.min(times * 100, 1000);
    },
    lazyConnect: true,
  });

  redis.on("error", (err) => {
    apiLogger.error({ error: err.message }, "Rate limit Redis error");
  });

  return redis;
};

const redisClient = createRateLimitRedis();
let redisConnected = false;

redisClient
  .connect()
  .then(() => {
    redisConnected = true;
    apiLogger.info("Rate limit Redis connected");
  })
  .catch((err) => {
    apiLogger.warn(
      { error: err.message },
      "Rate limit Redis initial connection failed, using fail-open"
    );
  });

redisClient.on("connect", () => {
  redisConnected = true;
});

redisClient.on("close", () => {
  redisConnected = false;
});

async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; current: number; remaining: number; resetTime: number }> {
  const { windowMs, maxRequests } = config;

  if (maxRequests === Infinity) {
    return { allowed: true, current: 0, remaining: Infinity, resetTime: 0 };
  }

  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const resetTime = windowStart + windowMs;

  if (!redisConnected) {
    apiLogger.warn("Rate limit Redis unavailable, allowing request (fail-open)");
    return { allowed: true, current: 0, remaining: maxRequests, resetTime };
  }

  try {
    const pipeline = redisClient.multi();
    pipeline.incr(key);
    pipeline.pexpire(key, windowMs);

    const results = await pipeline.exec();

    if (!results || !results[0] || results[0][0]) {
      apiLogger.warn("Rate limit Redis pipeline error, allowing request (fail-open)");
      return { allowed: true, current: 0, remaining: maxRequests, resetTime };
    }

    const current = (results[0][1] as number) ?? 0;
    const allowed = current <= maxRequests;
    const remaining = Math.max(0, maxRequests - current);

    return { allowed, current, remaining, resetTime };
  } catch (error) {
    apiLogger.warn(
      { error: error instanceof Error ? error.message : String(error) },
      "Rate limit check failed, allowing request (fail-open)"
    );
    return { allowed: true, current: 0, remaining: maxRequests, resetTime };
  }
}

function getClientIdentifier(req: Request): string {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  const ip = req.ip || req.socket.remoteAddress || "unknown";
  return `ip:${ip}`;
}

function setRateLimitHeaders(
  res: Response,
  limit: number,
  remaining: number,
  resetTime: number
): void {
  if (limit === Infinity) return;

  res.setHeader("X-RateLimit-Limit", limit);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", Math.ceil(resetTime / 1000));
}

export function rateLimitMiddleware(tier?: RateLimitTier) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket.remoteAddress || "unknown";

    const isBlocked = await rateLimitStore.isIPBlocked(clientIP);
    if (isBlocked) {
      await rateLimitStore.incrementStats("blockedRequests");
      return res.status(403).json({
        error: "Forbidden",
        message: "Your IP address has been blocked",
        correlationId: req.correlationId,
      });
    }

    await rateLimitStore.incrementStats("totalRequests");

    let config: RateLimitConfig;
    if (req.user?.id) {
      const userOverride = await rateLimitStore.getUserOverride(req.user.id);
      if (userOverride) {
        config = { maxRequests: userOverride.limit, windowMs: userOverride.windowMs };
      } else {
        const userTier = tier || (req.user as { tier?: RateLimitTier })?.tier || "default";
        config = getRateLimitConfig(req.method, req.path, userTier);
      }
    } else {
      const userTier = tier || "default";
      config = getRateLimitConfig(req.method, req.path, userTier);
    }

    const identifier = getClientIdentifier(req);
    const key = generateRateLimitKey(identifier, req.method, req.path, config.windowMs);

    const { allowed, remaining, resetTime } = await checkRateLimit(key, config);

    setRateLimitHeaders(res, config.maxRequests, remaining, resetTime);

    if (!allowed) {
      await rateLimitStore.incrementStats("blockedRequests");
      apiLogger.warn(
        {
          correlationId: req.correlationId,
          identifier,
          path: req.path,
          method: req.method,
        },
        "Rate limit exceeded"
      );

      res.setHeader("Retry-After", Math.ceil((resetTime - Date.now()) / 1000));

      return res.status(429).json({
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        correlationId: req.correlationId,
      });
    }

    next();
  };
}

export const strictRateLimit = rateLimitMiddleware();

interface UserOverride {
  userId: string;
  limit: number;
  windowMs: number;
  reason?: string;
  createdAt: string;
}

interface BlockedIP {
  ip: string;
  reason: string;
  expiresAt: string | null;
  createdAt: string;
}

interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  activeOverrides: number;
  blockedIPs: number;
}

const KEYS = {
  userOverrides: "ratelimit:overrides:users",
  blockedIPs: "ratelimit:blocked:ips",
  stats: "ratelimit:stats",
};

// for admin stats and management
export const rateLimitStore = {
  async getUserOverrides(): Promise<UserOverride[]> {
    if (!redisConnected) return [];

    try {
      const data = await redisClient.hgetall(KEYS.userOverrides);
      return Object.entries(data).map(([userId, json]) => {
        const parsed = JSON.parse(json) as Omit<UserOverride, "userId">;
        return { userId, ...parsed };
      });
    } catch (error) {
      apiLogger.error({ error }, "Failed to get user overrides");
      return [];
    }
  },

  async setUserOverride(
    userId: string,
    config: { limit: number; windowMs: number; reason?: string }
  ): Promise<void> {
    if (!redisConnected) throw new Error("Redis not connected");

    const override: Omit<UserOverride, "userId"> = {
      limit: config.limit,
      windowMs: config.windowMs,
      reason: config.reason,
      createdAt: new Date().toISOString(),
    };

    await redisClient.hset(KEYS.userOverrides, userId, JSON.stringify(override));
  },

  async removeUserOverride(userId: string): Promise<void> {
    if (!redisConnected) throw new Error("Redis not connected");
    await redisClient.hdel(KEYS.userOverrides, userId);
  },

  // user specific override
  async getUserOverride(userId: string): Promise<UserOverride | null> {
    if (!redisConnected) return null;

    try {
      const data = await redisClient.hget(KEYS.userOverrides, userId);
      if (!data) return null;

      const parsed = JSON.parse(data) as Omit<UserOverride, "userId">;
      return { userId, ...parsed };
    } catch {
      return null;
    }
  },

  async getBlockedIPs(): Promise<BlockedIP[]> {
    if (!redisConnected) return [];

    try {
      const data = await redisClient.hgetall(KEYS.blockedIPs);
      const now = new Date();
      const blocked: BlockedIP[] = [];

      for (const [ip, json] of Object.entries(data)) {
        const parsed = JSON.parse(json) as Omit<BlockedIP, "ip">;
        if (parsed.expiresAt && new Date(parsed.expiresAt) < now) {
          await redisClient.hdel(KEYS.blockedIPs, ip);
          continue;
        }
        blocked.push({ ip, ...parsed });
      }

      return blocked;
    } catch (error) {
      apiLogger.error({ error }, "Failed to get blocked IPs");
      return [];
    }
  },

  async blockIP(ip: string, reason: string, expiresInMinutes: number | null): Promise<void> {
    if (!redisConnected) throw new Error("Redis not connected");

    const blocked: Omit<BlockedIP, "ip"> = {
      reason,
      expiresAt: expiresInMinutes
        ? new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()
        : null,
      createdAt: new Date().toISOString(),
    };

    await redisClient.hset(KEYS.blockedIPs, ip, JSON.stringify(blocked));
  },

  async unblockIP(ip: string): Promise<void> {
    if (!redisConnected) throw new Error("Redis not connected");
    await redisClient.hdel(KEYS.blockedIPs, ip);
  },

  async isIPBlocked(ip: string): Promise<boolean> {
    if (!redisConnected) return false;

    try {
      const data = await redisClient.hget(KEYS.blockedIPs, ip);
      if (!data) return false;

      const parsed = JSON.parse(data) as Omit<BlockedIP, "ip">;
      if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        await redisClient.hdel(KEYS.blockedIPs, ip);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },

  async getStats(): Promise<RateLimitStats> {
    if (!redisConnected) {
      return { totalRequests: 0, blockedRequests: 0, activeOverrides: 0, blockedIPs: 0 };
    }

    try {
      const [overridesCount, blockedCount] = await Promise.all([
        redisClient.hlen(KEYS.userOverrides),
        redisClient.hlen(KEYS.blockedIPs),
      ]);

      const statsData = await redisClient.hgetall(KEYS.stats);

      return {
        totalRequests: parseInt(statsData.totalRequests || "0", 10),
        blockedRequests: parseInt(statsData.blockedRequests || "0", 10),
        activeOverrides: overridesCount,
        blockedIPs: blockedCount,
      };
    } catch (error) {
      apiLogger.error({ error }, "Failed to get rate limit stats");
      return { totalRequests: 0, blockedRequests: 0, activeOverrides: 0, blockedIPs: 0 };
    }
  },

  async incrementStats(field: "totalRequests" | "blockedRequests"): Promise<void> {
    if (!redisConnected) return;
    try {
      await redisClient.hincrby(KEYS.stats, field, 1);
    } catch {
      // ignore
    }
  },
};

export async function closeRateLimitConnection(): Promise<void> {
  await redisClient.quit();
  apiLogger.info("Rate limit Redis connection closed");
}

export async function getRateLimitRedisStatus(): Promise<{
  connected: boolean;
  latencyMs?: number;
}> {
  if (!redisConnected) {
    return { connected: false };
  }

  try {
    const start = Date.now();
    await redisClient.ping();
    const latencyMs = Date.now() - start;
    return { connected: true, latencyMs };
  } catch {
    return { connected: false };
  }
}

export async function getRateLimitMetrics(): Promise<{
  currentWindowRequests: number;
}> {
  if (!redisConnected) {
    return { currentWindowRequests: 0 };
  }

  try {
    const MAX_KEYS_TO_SCAN = 10_000;
    let cursor = "0";
    let keyCount = 0;

    do {
      const [nextCursor, keys] = await redisClient.scan(
        cursor,
        "MATCH",
        "ratelimit:*",
        "COUNT",
        "200"
      );

      keyCount += keys.length;
      cursor = nextCursor;
    } while (cursor !== "0" && keyCount < MAX_KEYS_TO_SCAN);

    return { currentWindowRequests: keyCount };
  } catch {
    return { currentWindowRequests: 0 };
  }
}
