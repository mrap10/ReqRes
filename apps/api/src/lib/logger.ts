import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV || "development",
  },
});

export const apiLogger = logger.child({ service: "api" });
export const queueLogger = logger.child({ service: "queue" });
export const workerLogger = logger.child({ service: "worker" });
export const runnerLogger = logger.child({ service: "runner" });
