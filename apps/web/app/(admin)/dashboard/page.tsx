"use client";

import { AdminSidebar, DashboardCard, QueueHealth } from "@/components/admin-components";
import { AnimatedHighlightedAreaChart } from "@/components/ui/animated-highlighted-chart";
import { DefaultBarChart } from "@/components/ui/default-bar-chart";
import {
  calculateTrend,
  calculateAbsoluteTrend,
  type DashboardMetrics,
  type HourlySubmissionData,
  type DailyActiveUsersData,
  type QueueMetrics,
} from "@/lib/types/metrics";
import { CheckCircle2, Clock, Layers, RefreshCw, Server } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [hourlySubmissions, setHourlySubmissions] = useState<HourlySubmissionData[]>([]);
  const [dailyActiveUsers, setDailyActiveUsers] = useState<DailyActiveUsersData[]>([]);
  const [queueMetrics, setQueueMetrics] = useState<QueueMetrics | null>(null);

  const fetchAllMetrics = useCallback(async () => {
    try {
      const [dashboardRes, hourlyRes, dailyUsersRes, queueRes] = await Promise.all([
        fetch(`${API_BASE_URL}/metrics/dashboard`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/metrics/submissions/hourly?hours=24`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/metrics/users/daily?days=7`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/metrics/queue`, { credentials: "include" }),
      ]);

      if (dashboardRes.ok) {
        const data: DashboardMetrics = await dashboardRes.json();
        setDashboardMetrics(data);
      }

      if (hourlyRes.ok) {
        const data: { data: HourlySubmissionData[] } = await hourlyRes.json();
        setHourlySubmissions(data.data);
      }

      if (dailyUsersRes.ok) {
        const data: { data: DailyActiveUsersData[] } = await dailyUsersRes.json();
        setDailyActiveUsers(data.data);
      }

      if (queueRes.ok) {
        const data: QueueMetrics = await queueRes.json();
        setQueueMetrics(data);
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllMetrics();

    const interval = setInterval(fetchAllMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchAllMetrics]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAllMetrics();
  };

  const submissionsTrend = dashboardMetrics
    ? calculateTrend(
        dashboardMetrics.today.submissions,
        dashboardMetrics.yesterday.submissions,
        false
      )
    : { value: 0, change: "0%", trendUp: true };

  const successRateTrend = dashboardMetrics
    ? calculateTrend(
        dashboardMetrics.current.successRate,
        dashboardMetrics.yesterday.successRate,
        false,
        "%"
      )
    : { value: "0%", change: "0%", trendUp: true };

  const executionTimeTrend = dashboardMetrics
    ? calculateAbsoluteTrend(
        dashboardMetrics.current.avgExecutionTime,
        dashboardMetrics.yesterday.avgExecutionTime,
        true,
        "ms"
      )
    : { value: "0ms", change: "0ms", trendUp: true };

  const queueDepthTrend = dashboardMetrics
    ? {
        value: dashboardMetrics.current.queueDepth,
        change:
          dashboardMetrics.current.queueDepth > 50
            ? "High"
            : dashboardMetrics.current.queueDepth > 20
              ? "Medium"
              : "Low",
        trendUp: dashboardMetrics.current.queueDepth <= 20,
      }
    : { value: 0, change: "Low", trendUp: true };

  const hourlyTrend = (() => {
    if (hourlySubmissions.length < 24) return 0;
    const recent12h = hourlySubmissions.slice(-12).reduce((sum, h) => sum + h.created, 0);
    const previous12h = hourlySubmissions.slice(-24, -12).reduce((sum, h) => sum + h.created, 0);
    if (previous12h === 0) return recent12h > 0 ? 100 : 0;
    return ((recent12h - previous12h) / previous12h) * 100;
  })();

  const dauTrend = (() => {
    if (dailyActiveUsers.length < 2) return 0;
    const today = dailyActiveUsers[dailyActiveUsers.length - 1]?.value ?? 0;
    const yesterday = dailyActiveUsers[dailyActiveUsers.length - 2]?.value ?? 0;
    if (yesterday === 0) return today > 0 ? 100 : 0;
    return ((today - yesterday) / yesterday) * 100;
  })();

  const todayNewSignups = dashboardMetrics?.today.activeUsers ?? 0;
  const yesterdayNewSignups = dashboardMetrics?.yesterday.activeUsers ?? 0;
  const retentionRate =
    yesterdayNewSignups > 0 ? Math.round((todayNewSignups / yesterdayNewSignups) * 100) : 0;

  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AdminSidebar />
      <main className="flex-1 ml-16 lg:ml-64 p-6 lg:p-10 max-w-400">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-zinc-500 text-sm">System Overview & Performance Metrics</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-700 cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            label="Total Submissions"
            value={dashboardMetrics?.current.totalSubmissions ?? 0}
            trendUp={submissionsTrend.trendUp}
            change={submissionsTrend.change}
            icon={Layers}
            isLoading={isLoading}
          />
          <DashboardCard
            label="Success Rate"
            value={`${dashboardMetrics?.current.successRate ?? 0}%`}
            trendUp={successRateTrend.trendUp}
            change={successRateTrend.change}
            icon={CheckCircle2}
            isLoading={isLoading}
          />
          <DashboardCard
            label="Avg. Execution"
            value={`${dashboardMetrics?.current.avgExecutionTime ?? 0}ms`}
            trendUp={executionTimeTrend.trendUp}
            change={executionTimeTrend.change}
            icon={Clock}
            isLoading={isLoading}
          />
          <DashboardCard
            label="Queue Depth"
            value={dashboardMetrics?.current.queueDepth ?? 0}
            trendUp={queueDepthTrend.trendUp}
            change={queueDepthTrend.change}
            icon={Server}
            isLoading={isLoading}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <AnimatedHighlightedAreaChart
              data={hourlySubmissions}
              isLoading={isLoading}
              trendPercentage={hourlyTrend}
            />
          </div>
          <QueueHealth data={queueMetrics} isLoading={isLoading} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h1>recent failures table here</h1>
            <p>
              not sure should i implement this or not, as i already have sentry configured for error
              traces
            </p>
          </div>
          <div>
            <DefaultBarChart
              data={dailyActiveUsers}
              isLoading={isLoading}
              trendPercentage={dauTrend}
            />
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex flex-col hover:bg-zinc-900/60 transition-colors">
                <div className="text-xs text-zinc-500">Today&apos;s Active Users</div>
                <div className="text-xl font-bold text-white">
                  {isLoading ? (
                    <div className="h-7 w-12 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    `+${todayNewSignups}`
                  )}
                </div>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex flex-col hover:bg-zinc-900/60 transition-colors">
                <div className="text-xs text-zinc-500">Day-over-Day</div>
                <div className="text-xl font-bold text-white">
                  {isLoading ? (
                    <div className="h-7 w-12 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    `${retentionRate}%`
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
