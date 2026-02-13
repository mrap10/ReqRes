import { Redis } from "ioredis";
import { prisma } from "@reqres/database";
import { apiLogger } from "../lib/logger.js";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});

// validating an IANA timezone string.
function safeTimezone(timezone: string): string {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return timezone;
  } catch {
    return "UTC";
  }
}

// e.g. if it's 2024-01-15 23:30 in America/New_York → returns Date for "2024-01-15T00:00:00.000Z"
function getLocalToday(timezone: string): Date {
  const now = new Date();
  const tz = safeTimezone(timezone);
  // en-CA locale gives YYYY-MM-DD format
  const dateStr = now.toLocaleDateString("en-CA", { timeZone: tz });
  return new Date(dateStr + "T00:00:00.000Z");
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

function isYesterday(lastActive: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return lastActive.getTime() === yesterday.getTime();
}

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function updateStreakOnSubmission(
  tx: TransactionClient,
  userId: string,
  timezone: string = "UTC"
): Promise<void> {
  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveAt: true },
  });

  const today = getLocalToday(timezone);

  if (user.lastActiveAt && isSameDay(user.lastActiveAt, today)) {
    return;
  }

  let newStreak: number;

  if (user.lastActiveAt && isYesterday(user.lastActiveAt, today)) {
    newStreak = user.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  await tx.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      lastActiveAt: today,
    },
  });
}

function activityGridKey(userId: string): string {
  return `user:${userId}:activity-grid`;
}

export async function invalidateActivityGrid(userId: string): Promise<void> {
  try {
    await redis.del(activityGridKey(userId));
  } catch (error) {
    apiLogger.error({ userId, error }, "Failed to invalidate activity grid cache");
  }
}

export async function getActivityGrid(userId: string): Promise<Record<string, number>> {
  const cacheKey = activityGridKey(userId);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (error) {
    apiLogger.error({ userId, error }, "Failed to read activity grid from cache");
  }

  const since = new Date();
  since.setDate(since.getDate() - 365);

  const submissions = await prisma.submission.findMany({
    where: {
      userId,
      createdAt: { gte: since },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const grid: Record<string, number> = {};
  for (const sub of submissions) {
    const dateKey = sub.createdAt.toISOString().split("T")[0]!;
    grid[dateKey] = (grid[dateKey] || 0) + 1;
  }

  try {
    await redis.set(cacheKey, JSON.stringify(grid), "EX", 86400);
  } catch (error) {
    apiLogger.error({ userId, error }, "Failed to cache activity grid");
  }

  return grid;
}

export async function getUserStreakData(userId: string, timezone: string = "UTC") {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActiveAt: true,
    },
  });

  let displayStreak = 0;

  if (user.lastActiveAt) {
    const today = getLocalToday(timezone);
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    if (user.lastActiveAt.getTime() >= yesterday.getTime()) {
      displayStreak = user.currentStreak;
    }
  }

  return {
    currentStreak: displayStreak,
    longestStreak: user.longestStreak,
    lastActiveAt: user.lastActiveAt,
  };
}
