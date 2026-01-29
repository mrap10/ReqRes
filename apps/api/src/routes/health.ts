import { Request, Response, Router } from "express";
import { apiLogger } from "../lib/logger.js";
import {
  rateLimitStore,
  getRateLimitRedisStatus,
  getRateLimitMetrics,
} from "../middleware/rateLimit.middleware.js";

const router = Router();

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  services: {
    redis: {
      connected: boolean;
      latencyMs?: number;
    };
    rateLimiter: {
      enabled: boolean;
      failOpenMode: boolean;
    };
  };
}

router.get("/", async (_req: Request, res: Response) => {
  try {
    const redisStatus = await getRateLimitRedisStatus();

    const health: HealthStatus = {
      status: redisStatus.connected ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        redis: {
          connected: redisStatus.connected,
          latencyMs: redisStatus.latencyMs,
        },
        rateLimiter: {
          enabled: true,
          failOpenMode: !redisStatus.connected,
        },
      },
    };

    const statusCode = health.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    apiLogger.error({ error }, "Health check failed");
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: "Health check failed",
    });
  }
});

router.get("/ready", async (_req: Request, res: Response) => {
  try {
    const redisStatus = await getRateLimitRedisStatus();

    if (redisStatus.connected) {
      res.status(200).json({ ready: true });
    } else {
      // Still ready (fail-open), but degraded
      res.status(200).json({ ready: true, degraded: true, reason: "Redis unavailable" });
    }
  } catch {
    res.status(503).json({ ready: false });
  }
});

router.get("/live", (_req: Request, res: Response) => {
  res.status(200).json({ alive: true, timestamp: new Date().toISOString() });
});

// Prometheus-compatible metrics endpoint
router.get("/metrics", async (_req: Request, res: Response) => {
  try {
    const [rateLimitStats, redisStatus, rateLimitMetrics] = await Promise.all([
      rateLimitStore.getStats(),
      getRateLimitRedisStatus(),
      getRateLimitMetrics(),
    ]);

    const metrics: string[] = [
      "# HELP process_uptime_seconds Process uptime in seconds",
      "# TYPE process_uptime_seconds gauge",
      `process_uptime_seconds ${process.uptime()}`,
      "",
      "# HELP nodejs_memory_heap_used_bytes Node.js heap memory used",
      "# TYPE nodejs_memory_heap_used_bytes gauge",
      `nodejs_memory_heap_used_bytes ${process.memoryUsage().heapUsed}`,
      "",
      "# HELP nodejs_memory_heap_total_bytes Node.js total heap memory",
      "# TYPE nodejs_memory_heap_total_bytes gauge",
      `nodejs_memory_heap_total_bytes ${process.memoryUsage().heapTotal}`,
      "",
      "# HELP redis_connected Whether Redis is connected",
      "# TYPE redis_connected gauge",
      `redis_connected ${redisStatus.connected ? 1 : 0}`,
      "",
      "# HELP redis_latency_ms Redis ping latency in milliseconds",
      "# TYPE redis_latency_ms gauge",
      `redis_latency_ms ${redisStatus.latencyMs ?? -1}`,
      "",
      "# HELP ratelimit_requests_total Total number of requests processed by rate limiter",
      "# TYPE ratelimit_requests_total counter",
      `ratelimit_requests_total ${rateLimitStats.totalRequests}`,
      "",
      "# HELP ratelimit_blocked_total Total number of requests blocked by rate limiter",
      "# TYPE ratelimit_blocked_total counter",
      `ratelimit_blocked_total ${rateLimitStats.blockedRequests}`,
      "",
      "# HELP ratelimit_user_overrides_active Number of active user rate limit overrides",
      "# TYPE ratelimit_user_overrides_active gauge",
      `ratelimit_user_overrides_active ${rateLimitStats.activeOverrides}`,
      "",
      "# HELP ratelimit_blocked_ips_active Number of currently blocked IP addresses",
      "# TYPE ratelimit_blocked_ips_active gauge",
      `ratelimit_blocked_ips_active ${rateLimitStats.blockedIPs}`,
      "",
      "# HELP ratelimit_current_window_requests Requests in current rate limit window",
      "# TYPE ratelimit_current_window_requests gauge",
      `ratelimit_current_window_requests ${rateLimitMetrics.currentWindowRequests}`,
      "",
      "# HELP ratelimit_fail_open_mode Whether rate limiter is in fail-open mode",
      "# TYPE ratelimit_fail_open_mode gauge",
      `ratelimit_fail_open_mode ${redisStatus.connected ? 0 : 1}`,
      "",
    ];

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(metrics.join("\n"));
  } catch (error) {
    apiLogger.error({ error }, "Failed to generate metrics");
    res.status(500).send("# Error generating metrics");
  }
});

router.get("/ratelimit", async (_req: Request, res: Response) => {
  try {
    const [stats, redisStatus] = await Promise.all([
      rateLimitStore.getStats(),
      getRateLimitRedisStatus(),
    ]);

    const blockedRate =
      stats.totalRequests > 0
        ? ((stats.blockedRequests / stats.totalRequests) * 100).toFixed(2)
        : "0.00";

    res.json({
      status: redisStatus.connected ? "active" : "fail-open",
      redis: {
        connected: redisStatus.connected,
        latencyMs: redisStatus.latencyMs,
      },
      statistics: {
        totalRequests: stats.totalRequests,
        blockedRequests: stats.blockedRequests,
        blockedRate: `${blockedRate}%`,
        activeOverrides: stats.activeOverrides,
        blockedIPs: stats.blockedIPs,
      },
    });
  } catch (error) {
    apiLogger.error({ error }, "Failed to get rate limit status");
    res.status(500).json({ error: "Failed to get rate limit status" });
  }
});

export default router;
