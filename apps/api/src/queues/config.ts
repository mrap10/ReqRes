import { QueueOptions, WorkerOptions } from "bullmq";
import { Redis } from "ioredis";

const createRedisConnection = () => {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 10) {
        console.error("Redis connection failed after 10 retries");
        return null;
      }
      return Math.min(times * 200, 2000); // exponential backoff
    },
  });

  redis.on("connect", () => {
    console.log("Redis connected successfully");
  });

  redis.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });

  redis.on("close", () => {
    console.log("Redis connection closed");
  });

  return redis;
};

const connection = createRedisConnection();

export const queueConfig: QueueOptions = {
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
};

export const workerConfig: WorkerOptions = {
  connection,
  concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
};

export async function closeQueueConnections() {
  await connection.quit();
  console.log("Queue connections closed");
}
