"use client";

import { Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface GlobalConfig {
  tiers: Record<string, RateLimitConfig>;
  endpointOverrides: Record<string, RateLimitConfig>;
}

export default function GlobalConfigCard() {
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/rate-limits/config`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const defaultTier = config?.tiers?.default;

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6 relative overflow-hidden group">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            Global Configuration
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Default policy for standard users</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Window</div>
          {isLoading ? (
            <div className="h-7 w-12 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <div className="text-xl font-mono text-white">
              {defaultTier ? `${defaultTier.windowMs / 1000}s` : "—"}
            </div>
          )}
        </div>
        <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Max Req</div>
          {isLoading ? (
            <div className="h-7 w-12 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <div className="text-xl font-mono text-white">{defaultTier?.maxRequests ?? "—"}</div>
          )}
        </div>
        <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
          <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Fail-Open</div>
          <div className="text-xl font-mono text-emerald-400">Enabled</div>
        </div>
      </div>
    </div>
  );
}
