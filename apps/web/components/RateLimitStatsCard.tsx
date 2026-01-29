"use client";

import { Activity, Ban, ShieldAlert, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  activeOverrides: number;
  blockedIPs: number;
}

export default function RateLimitStatsCard() {
  const [stats, setStats] = useState<RateLimitStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/rate-limits/stats`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const throttleRate =
    stats && stats.totalRequests > 0
      ? ((stats.blockedRequests / stats.totalRequests) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6 flex flex-col justify-center relative overflow-hidden">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          {isLoading ? (
            <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <div className="text-2xl font-bold text-white">{throttleRate}%</div>
          )}
          <div className="text-xs text-zinc-500">Traffic Throttled</div>
        </div>
      </div>
      <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all ${
            parseFloat(throttleRate) > 10 ? "bg-rose-500" : "bg-emerald-500"
          }`}
          style={{ width: `${Math.min(parseFloat(throttleRate), 100)}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 text-xs">
          <ShieldAlert className="w-3 h-3 text-amber-500" />
          <span className="text-zinc-400">Blocked:</span>
          {isLoading ? (
            <span className="h-4 w-8 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <span className="text-white font-mono">{stats?.blockedRequests ?? 0}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Users className="w-3 h-3 text-indigo-500" />
          <span className="text-zinc-400">Overrides:</span>
          {isLoading ? (
            <span className="h-4 w-8 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <span className="text-white font-mono">{stats?.activeOverrides ?? 0}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Ban className="w-3 h-3 text-rose-500" />
          <span className="text-zinc-400">IPs:</span>
          {isLoading ? (
            <span className="h-4 w-8 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <span className="text-white font-mono">{stats?.blockedIPs ?? 0}</span>
          )}
        </div>
      </div>
    </div>
  );
}
