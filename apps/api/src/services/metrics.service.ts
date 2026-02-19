import { Redis } from "ioredis";
import { apiLogger } from "../lib/logger.js";

const REDIS_AVAILABLE = !!process.env.REDIS_HOST;

let redis: Redis | null = null;

if (REDIS_AVAILABLE) {
  redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    lazyConnect: true,
  });
  redis.connect().catch((err) => {
    apiLogger.warn(
      { error: err.message },
      "Metrics Redis connection failed — metrics will be unavailable"
    );
    redis = null;
  });
} else {
  apiLogger.warn("REDIS_HOST not set — metrics service disabled. Set REDIS_HOST to enable.");
}

export enum MetricType {
  SUBMISSION_CREATED = "submission:created",
  SUBMISSION_QUEUED = "submission:queued",
  SUBMISSION_PROCESSING = "submission:processing",
  SUBMISSION_COMPLETED = "submission:completed",
  SUBMISSION_FAILED = "submission:failed",
  SUBMISSION_ERROR = "submission:error",
  EXECUTION_TIME = "execution:time",
  QUEUE_DEPTH = "queue:depth",
  ACTIVE_USERS = "active:users",
}

class MetricsService {
  private get available(): boolean {
    return redis !== null;
  }

  async incrementCounter(metric: MetricType, value: number = 1): Promise<void> {
    if (!this.available) return;
    try {
      const key = `metrics:counter:${metric}`;
      await redis!.incrby(key, value);

      const hourKey = `metrics:counter:${metric}:${this.getCurrentHour()}`;
      await redis!.incrby(hourKey, value);
      await redis!.expire(hourKey, 60 * 60 * 24 * 7);
    } catch (error) {
      apiLogger.error({ metric, error }, "Failed to increment counter metric");
    }
  }

  async setGauge(metric: MetricType, value: number): Promise<void> {
    if (!this.available) return;
    try {
      const key = `metrics:gauge:${metric}`;
      await redis!.set(key, value);
    } catch (error) {
      apiLogger.error({ metric, error }, "Failed to set gauge metric");
    }
  }

  async recordTiming(metric: MetricType, durationMs: number): Promise<void> {
    if (!this.available) return;
    try {
      const key = `metrics:timing:${metric}`;
      const timestamp = Date.now();

      await redis!.zadd(key, timestamp, `${timestamp}:${durationMs}`);

      await redis!.zremrangebyrank(key, 0, -100001);

      const hourKey = `metrics:timing:${metric}:${this.getCurrentHour()}`;
      await redis!.rpush(hourKey, durationMs.toString());
      await redis!.expire(hourKey, 60 * 60 * 24 * 7);
    } catch (error) {
      apiLogger.error({ metric, error }, "Failed to record timing metric");
    }
  }

  async trackUniqueUser(userId: string): Promise<void> {
    if (!this.available) return;
    try {
      const dailyKey = `metrics:unique_users:${this.getCurrentDay()}`;
      await redis!.pfadd(dailyKey, userId);
      await redis!.expire(dailyKey, 60 * 60 * 24 * 30);

      const hourlyKey = `metrics:unique_users:${this.getCurrentHour()}`;
      await redis!.pfadd(hourlyKey, userId);
      await redis!.expire(hourlyKey, 60 * 60 * 24 * 7);
    } catch (error) {
      apiLogger.error({ userId, error }, "Failed to track unique user");
    }
  }

  async getCounter(metric: MetricType): Promise<number> {
    if (!this.available) return 0;
    try {
      const key = `metrics:counter:${metric}`;
      const value = await redis!.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      apiLogger.error({ metric, error }, "Failed to get counter metric");
      return 0;
    }
  }

  async getGauge(metric: MetricType): Promise<number> {
    if (!this.available) return 0;
    try {
      const key = `metrics:gauge:${metric}`;
      const value = await redis!.get(key);
      return value ? parseFloat(value) : 0;
    } catch (error) {
      apiLogger.error({ metric, error }, "Failed to get gauge metric");
      return 0;
    }
  }

  async getTimingStats(
    metric: MetricType
  ): Promise<{ avg: number; count: number; p50: number; p95: number; p99: number }> {
    if (!this.available) return { avg: 0, count: 0, p50: 0, p95: 0, p99: 0 };
    try {
      const key = `metrics:timing:${metric}`;
      const values = await redis!.zrange(key, 0, -1);

      if (values.length === 0) {
        return {
          avg: 0,
          count: 0,
          p50: 0,
          p95: 0,
          p99: 0,
        };
      }

      const durations = values
        .map((v) => {
          const parts = v.split(":");
          return parts[1] ? parseFloat(parts[1]) : NaN;
        })
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);

      if (durations.length === 0) {
        return { avg: 0, count: 0, p50: 0, p95: 0, p99: 0 };
      }

      const sum = durations.reduce((a, b) => a + b, 0);
      const avg = sum / durations.length;
      const p50 = this.percentile(durations, 50);
      const p95 = this.percentile(durations, 95);
      const p99 = this.percentile(durations, 99);

      return {
        avg: Math.round(avg),
        count: durations.length,
        p50: Math.round(p50),
        p95: Math.round(p95),
        p99: Math.round(p99),
      };
    } catch (error) {
      apiLogger.error({ metric, error }, "Failed to get timing stats metric");
      return {
        avg: 0,
        count: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }
  }

  async getHourlyCounters(
    metric: MetricType,
    hours: number = 24
  ): Promise<Array<{ hour: string; value: number }>> {
    if (!this.available) return [];
    try {
      const data: Array<{ hour: string; value: number }> = [];
      const now = new Date();

      for (let i = hours - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourKey = `metrics:counter:${metric}:${this.formatHour(date)}`;
        const value = await redis!.get(hourKey);

        data.push({
          hour: this.formatHour(date),
          value: value ? parseInt(value, 10) : 0,
        });
      }

      return data;
    } catch (error) {
      apiLogger.error({ metric, error }, "Failed to get hourly counters metric");
      return [];
    }
  }

  async getDailyActiveUsers(): Promise<number> {
    if (!this.available) return 0;
    try {
      const key = `metrics:unique_users:${this.getCurrentDay()}`;
      const count = await redis!.pfcount(key);
      return count;
    } catch (error) {
      apiLogger.error({ error }, "Failed to get daily active users metric");
      return 0;
    }
  }

  async getHourlyActiveUsers(): Promise<number> {
    if (!this.available) return 0;
    try {
      const key = `metrics:unique_users:${this.getCurrentHour()}`;
      const count = await redis!.pfcount(key);
      return count;
    } catch (error) {
      apiLogger.error({ error }, "Failed to get hourly active users metric");
      return 0;
    }
  }

  async getSuccessRate(): Promise<number> {
    try {
      const completed = await this.getCounter(MetricType.SUBMISSION_COMPLETED);
      const failed = await this.getCounter(MetricType.SUBMISSION_FAILED);
      const error = await this.getCounter(MetricType.SUBMISSION_ERROR);

      const total = completed + failed + error;
      if (total === 0) return 0;

      return Math.round((completed / total) * 100);
    } catch (error) {
      apiLogger.error({ error }, "Failed to get success rate metric");
      return 0;
    }
  }

  async getDailyCounters(
    metric: MetricType,
    days: number = 7
  ): Promise<Array<{ day: string; dayLabel: string; value: number }>> {
    if (!this.available) return [];
    try {
      const data: Array<{ day: string; dayLabel: string; value: number }> = [];
      const now = new Date();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayKey = date.toISOString().slice(0, 10);

        let dayTotal = 0;
        for (let h = 0; h < 24; h++) {
          const hourDate = new Date(date);
          hourDate.setHours(h, 0, 0, 0);
          const hourKey = `metrics:counter:${metric}:${this.formatHour(hourDate)}`;
          const value = await redis!.get(hourKey);
          dayTotal += value ? parseInt(value, 10) : 0;
        }

        data.push({
          day: dayKey,
          dayLabel: dayNames[date.getDay()] ?? "Unknown",
          value: dayTotal,
        });
      }

      return data;
    } catch (error) {
      apiLogger.error({ metric, error }, "Failed to get daily counters metric");
      return [];
    }
  }

  async getDailyActiveUsersHistory(
    days: number = 7
  ): Promise<Array<{ day: string; dayLabel: string; value: number }>> {
    if (!this.available) return [];
    try {
      const data: Array<{ day: string; dayLabel: string; value: number }> = [];
      const now = new Date();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayKey = date.toISOString().slice(0, 10);
        const redisKey = `metrics:unique_users:${dayKey}`;
        const count = await redis!.pfcount(redisKey);

        data.push({
          day: dayKey,
          dayLabel: dayNames[date.getDay()] ?? "Unknown",
          value: count,
        });
      }

      return data;
    } catch (error) {
      apiLogger.error({ error }, "Failed to get daily active users history metric");
      return [];
    }
  }

  async getYesterdayMetrics(): Promise<{
    submissions: number;
    completed: number;
    failed: number;
    avgExecutionTime: number;
    activeUsers: number;
  }> {
    const defaultMetrics = {
      submissions: 0,
      completed: 0,
      failed: 0,
      avgExecutionTime: 0,
      activeUsers: 0,
    };
    if (!this.available) return defaultMetrics;
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yesterdayKey = yesterday.toISOString().slice(0, 10);

      let submissions = 0;
      let completed = 0;
      let failed = 0;

      for (let h = 0; h < 24; h++) {
        const hourDate = new Date(yesterday);
        hourDate.setHours(h, 0, 0, 0);
        const hourStr = this.formatHour(hourDate);

        const createdKey = `metrics:counter:${MetricType.SUBMISSION_CREATED}:${hourStr}`;
        const completedKey = `metrics:counter:${MetricType.SUBMISSION_COMPLETED}:${hourStr}`;
        const failedKey = `metrics:counter:${MetricType.SUBMISSION_FAILED}:${hourStr}`;

        const [createdVal, completedVal, failedVal] = await Promise.all([
          redis!.get(createdKey),
          redis!.get(completedKey),
          redis!.get(failedKey),
        ]);

        submissions += createdVal ? parseInt(createdVal, 10) : 0;
        completed += completedVal ? parseInt(completedVal, 10) : 0;
        failed += failedVal ? parseInt(failedVal, 10) : 0;
      }

      const activeUsersKey = `metrics:unique_users:${yesterdayKey}`;
      const activeUsers = await redis!.pfcount(activeUsersKey);

      let totalTime = 0;
      let timeCount = 0;

      for (let h = 0; h < 24; h++) {
        const hourDate = new Date(yesterday);
        hourDate.setHours(h, 0, 0, 0);
        const hourStr = this.formatHour(hourDate);
        const timingKey = `metrics:timing:${MetricType.EXECUTION_TIME}:${hourStr}`;
        const timings = await redis!.lrange(timingKey, 0, -1);

        for (const t of timings) {
          totalTime += parseFloat(t);
          timeCount++;
        }
      }

      const avgExecutionTime = timeCount > 0 ? Math.round(totalTime / timeCount) : 0;

      return {
        submissions,
        completed,
        failed,
        avgExecutionTime,
        activeUsers,
      };
    } catch (error) {
      apiLogger.error({ error }, "Failed to get yesterday metrics");
      return {
        submissions: 0,
        completed: 0,
        failed: 0,
        avgExecutionTime: 0,
        activeUsers: 0,
      };
    }
  }

  async getTodayMetrics(): Promise<{
    submissions: number;
    completed: number;
    failed: number;
    avgExecutionTime: number;
    activeUsers: number;
  }> {
    const defaultMetrics = {
      submissions: 0,
      completed: 0,
      failed: 0,
      avgExecutionTime: 0,
      activeUsers: 0,
    };
    if (!this.available) return defaultMetrics;
    try {
      const today = new Date();
      const todayKey = today.toISOString().slice(0, 10);

      let submissions = 0;
      let completed = 0;
      let failed = 0;

      const currentHour = today.getHours();

      for (let h = 0; h <= currentHour; h++) {
        const hourDate = new Date(today);
        hourDate.setHours(h, 0, 0, 0);
        const hourStr = this.formatHour(hourDate);

        const createdKey = `metrics:counter:${MetricType.SUBMISSION_CREATED}:${hourStr}`;
        const completedKey = `metrics:counter:${MetricType.SUBMISSION_COMPLETED}:${hourStr}`;
        const failedKey = `metrics:counter:${MetricType.SUBMISSION_FAILED}:${hourStr}`;

        const [createdVal, completedVal, failedVal] = await Promise.all([
          redis!.get(createdKey),
          redis!.get(completedKey),
          redis!.get(failedKey),
        ]);

        submissions += createdVal ? parseInt(createdVal, 10) : 0;
        completed += completedVal ? parseInt(completedVal, 10) : 0;
        failed += failedVal ? parseInt(failedVal, 10) : 0;
      }

      const activeUsersKey = `metrics:unique_users:${todayKey}`;
      const activeUsers = await redis!.pfcount(activeUsersKey);

      let totalTime = 0;
      let timeCount = 0;

      for (let h = 0; h <= currentHour; h++) {
        const hourDate = new Date(today);
        hourDate.setHours(h, 0, 0, 0);
        const hourStr = this.formatHour(hourDate);
        const timingKey = `metrics:timing:${MetricType.EXECUTION_TIME}:${hourStr}`;
        const timings = await redis!.lrange(timingKey, 0, -1);

        for (const t of timings) {
          totalTime += parseFloat(t);
          timeCount++;
        }
      }

      const avgExecutionTime = timeCount > 0 ? Math.round(totalTime / timeCount) : 0;

      return {
        submissions,
        completed,
        failed,
        avgExecutionTime,
        activeUsers,
      };
    } catch (error) {
      apiLogger.error({ error }, "Failed to get today metrics");
      return {
        submissions: 0,
        completed: 0,
        failed: 0,
        avgExecutionTime: 0,
        activeUsers: 0,
      };
    }
  }

  private getCurrentHour(): string {
    return this.formatHour(new Date());
  }

  private formatHour(date: Date): string {
    return date.toISOString().slice(0, 13);
  }

  private getCurrentDay(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private percentile(sortedValues: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;

    if (lower === upper) {
      return sortedValues[lower] ?? 0;
    }

    return (sortedValues[lower] ?? 0) * (1 - weight) + (sortedValues[upper] ?? 0) * weight;
  }
}

export const metricsService = new MetricsService();
