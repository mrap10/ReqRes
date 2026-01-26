import { Request, Response, Router } from "express";
import { metricsService, MetricType } from "../services/metrics.service.js";
import { submissionQueue } from "../queues/submission.queue.js";

const router = Router();

router.get("/", async (_, res: Response) => {
  try {
    const [
      totalCreated,
      totalCompleted,
      totalFailed,
      totalError,
      queueDepth,
      executionStats,
      successRate,
      dailyActiveUsers,
      hourlyActiveUsers,
    ] = await Promise.all([
      metricsService.getCounter(MetricType.SUBMISSION_CREATED),
      metricsService.getCounter(MetricType.SUBMISSION_COMPLETED),
      metricsService.getCounter(MetricType.SUBMISSION_FAILED),
      metricsService.getCounter(MetricType.SUBMISSION_ERROR),
      metricsService.getGauge(MetricType.QUEUE_DEPTH),
      metricsService.getTimingStats(MetricType.EXECUTION_TIME),
      metricsService.getSuccessRate(),
      metricsService.getDailyActiveUsers(),
      metricsService.getHourlyActiveUsers(),
    ]);

    res.json({
      submissions: {
        total: totalCreated,
        completed: totalCompleted,
        failed: totalFailed,
        error: totalError,
        successRate: `${successRate}%`,
      },
      queue: {
        depth: queueDepth,
      },
      execution: {
        avgTime: `${executionStats.avg}ms`,
        sampleCount: executionStats.count,
        p50: `${executionStats.p50}ms`,
        p95: `${executionStats.p95}ms`,
        p99: `${executionStats.p99}ms`,
      },
      users: {
        dailyActive: dailyActiveUsers,
        hourlyActive: hourlyActiveUsers,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

router.get("/submissions/hourly", async (req: Request, res: Response) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const data = await metricsService.getHourlyCounters(MetricType.SUBMISSION_CREATED, hours);

    res.json({ data });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch hourly submission metrics" });
  }
});

router.get("/queue", async (_, res: Response) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      submissionQueue.getWaitingCount(),
      submissionQueue.getActiveCount(),
      submissionQueue.getCompletedCount(),
      submissionQueue.getFailedCount(),
    ]);

    res.json({
      waiting,
      active,
      completed,
      failed,
      total: waiting + active + completed + failed,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    res.status(500).json({ error: "Failed to fetch queue metrics" });
  }
});

export default router;
