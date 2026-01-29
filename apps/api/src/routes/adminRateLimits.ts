import { Request, Response, Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { apiLogger } from "../lib/logger.js";
import { RATE_LIMIT_TIERS, ENDPOINT_OVERRIDES } from "../lib/rateLimit.js";
import { rateLimitStore } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/config", (_req: Request, res: Response) => {
  res.json({
    tiers: RATE_LIMIT_TIERS,
    endpointOverrides: ENDPOINT_OVERRIDES,
  });
});

router.get("/overrides", async (_req: Request, res: Response) => {
  try {
    const overrides = await rateLimitStore.getUserOverrides();
    res.json({ overrides });
  } catch (error) {
    apiLogger.error({ error }, "Failed to fetch rate limit overrides");
    res.status(500).json({ error: "Failed to fetch overrides" });
  }
});

router.post("/overrides", async (req: Request, res: Response) => {
  const { userId, limit, windowMs, reason } = req.body;

  if (!userId || typeof limit !== "number" || typeof windowMs !== "number") {
    return res.status(400).json({
      error: "Missing required fields: userId, limit, windowMs",
    });
  }

  if (limit < 0 || windowMs < 1000) {
    return res.status(400).json({
      error: "Invalid values: limit must be >= 0, windowMs must be >= 1000",
    });
  }

  try {
    await rateLimitStore.setUserOverride(userId, {
      limit,
      windowMs,
      reason: reason || undefined,
    });

    apiLogger.info(
      { adminId: req.user?.id, userId, limit, windowMs, reason },
      "Rate limit override created/updated"
    );

    res.json({ success: true, userId, limit, windowMs, reason });
  } catch (error) {
    apiLogger.error({ error, userId }, "Failed to set rate limit override");
    res.status(500).json({ error: "Failed to set override" });
  }
});

router.delete("/overrides/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    await rateLimitStore.removeUserOverride(userId!);

    apiLogger.info({ adminId: req.user?.id, userId }, "Rate limit override removed");

    res.json({ success: true, userId });
  } catch (error) {
    apiLogger.error({ error, userId }, "Failed to remove rate limit override");
    res.status(500).json({ error: "Failed to remove override" });
  }
});

router.get("/blocked", async (_req: Request, res: Response) => {
  try {
    const blocked = await rateLimitStore.getBlockedIPs();
    res.json({ blocked });
  } catch (error) {
    apiLogger.error({ error }, "Failed to fetch blocked IPs");
    res.status(500).json({ error: "Failed to fetch blocked IPs" });
  }
});

router.post("/blocked", async (req: Request, res: Response) => {
  const { ip, reason, expiresInMinutes } = req.body;

  if (!ip || !reason) {
    return res.status(400).json({
      error: "Missing required fields: ip, reason",
    });
  }

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([a-fA-F0-9:]+)$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({ error: "Invalid IP address format" });
  }

  try {
    const expiresAt = expiresInMinutes
      ? new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()
      : null;

    await rateLimitStore.blockIP(ip, reason, expiresInMinutes || null);

    apiLogger.info({ adminId: req.user?.id, ip, reason, expiresAt }, "IP address blocked");

    res.json({ success: true, ip, reason, expiresAt });
  } catch (error) {
    apiLogger.error({ error, ip }, "Failed to block IP");
    res.status(500).json({ error: "Failed to block IP" });
  }
});

router.delete("/blocked/:ip", async (req: Request, res: Response) => {
  const { ip } = req.params;

  try {
    await rateLimitStore.unblockIP(ip!);

    apiLogger.info({ adminId: req.user?.id, ip }, "IP address unblocked");

    res.json({ success: true, ip });
  } catch (error) {
    apiLogger.error({ error, ip }, "Failed to unblock IP");
    res.status(500).json({ error: "Failed to unblock IP" });
  }
});

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await rateLimitStore.getStats();
    res.json(stats);
  } catch (error) {
    apiLogger.error({ error }, "Failed to fetch rate limit stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
