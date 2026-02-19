import { QueueOptions, WorkerOptions } from "bullmq";
import { Redis } from "ioredis";
import { queueLogger } from "../lib/logger.js";

const REDIS_AVAILABLE = !!process.env.REDIS_HOST;

const createRedisConnection = (): Redis => {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 10) {
        queueLogger.error("Redis connection failed after 10 retries");
        return null;
      }
      return Math.min(times * 200, 2000); // exponential backoff
    },
  });

  redis.on("connect", () => {
    queueLogger.info("Redis connected successfully");
  });

  redis.on("error", (err) => {
    queueLogger.error({ error: err.message }, "Redis connection error");
  });

  redis.on("close", () => {
    queueLogger.info("Redis connection closed");
  });

  return redis;
};

let connection: Redis | null = null;

if (REDIS_AVAILABLE) {
  connection = createRedisConnection();
} else {
  queueLogger.warn(
    "REDIS_HOST not set — BullMQ queues disabled. Submissions won't be processed. Set REDIS_HOST to enable."
  );
}

export { connection };

export function isQueueAvailable(): boolean {
  return connection !== null;
}

export const queueConfig: QueueOptions | null = connection
  ? {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 86400,
        },
      },
    }
  : null;

export const workerConfig: WorkerOptions | null = connection
  ? {
      connection,
      concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
      limiter: {
        max: 10,
        duration: 1000,
      },
    }
  : null;

export async function closeQueueConnections() {
  if (connection) {
    await connection.quit();
    queueLogger.info("Queue connections closed");
  }
}
