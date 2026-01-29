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
    // future(after introducing premium tier): could be based on req.user.tier
    const userTier = tier || (req.user as { tier?: RateLimitTier })?.tier || "default";
    const config = getRateLimitConfig(req.method, req.path, userTier);
    const identifier = getClientIdentifier(req);

    const key = generateRateLimitKey(identifier, req.method, req.path, config.windowMs);

    const { allowed, remaining, resetTime } = await checkRateLimit(key, config);

    setRateLimitHeaders(res, config.maxRequests, remaining, resetTime);

    if (!allowed) {
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

export async function closeRateLimitConnection(): Promise<void> {
  await redisClient.quit();
  apiLogger.info("Rate limit Redis connection closed");
}
