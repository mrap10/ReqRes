export interface DashboardMetrics {
  current: {
    totalSubmissions: number;
    completed: number;
    failed: number;
    error: number;
    successRate: number;
    queueDepth: number;
    avgExecutionTime: number;
  };
  today: {
    submissions: number;
    completed: number;
    failed: number;
    avgExecutionTime: number;
    activeUsers: number;
  };
  yesterday: {
    submissions: number;
    completed: number;
    failed: number;
    avgExecutionTime: number;
    activeUsers: number;
    successRate: number;
  };
}

export interface HourlySubmissionData {
  hour: string;
  hourLabel: string;
  created: number;
  completed: number;
}

export interface DailyActiveUsersData {
  day: string;
  dayLabel: string;
  value: number;
}

export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

export interface TrendData {
  value: string | number;
  change: string;
  trendUp: boolean;
}

export function calculateTrend(
  current: number,
  previous: number,
  isLowerBetter: boolean = false,
  suffix: string = ""
): TrendData {
  if (previous === 0) {
    return {
      value: current + suffix,
      change: current > 0 ? "+100%" : "0%",
      trendUp: !isLowerBetter && current > 0,
    };
  }

  const diff = current - previous;
  const percentChange = ((diff / previous) * 100).toFixed(1);
  const sign = diff >= 0 ? "+" : "";

  // for metrics where lower is better (like execution time), inverting the trend direction
  const isPositiveChange = diff > 0;
  const trendUp = isLowerBetter ? !isPositiveChange : isPositiveChange;

  return {
    value: current + suffix,
    change: `${sign}${percentChange}%`,
    trendUp,
  };
}

export function calculateAbsoluteTrend(
  current: number,
  previous: number,
  isLowerBetter: boolean = false,
  suffix: string = ""
): TrendData {
  const diff = current - previous;
  const sign = diff >= 0 ? "+" : "";

  const isPositiveChange = diff > 0;
  const trendUp = isLowerBetter ? !isPositiveChange : isPositiveChange;

  return {
    value: current + suffix,
    change: `${sign}${diff}${suffix}`,
    trendUp,
  };
}
