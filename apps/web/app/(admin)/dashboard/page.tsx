"use client";

import AdminSidebar from "@/components/AdminSidebar";
import DashboardCard from "@/components/DashboardCard";
import { CheckCircle2, Clock, Layers, RefreshCw, Server } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const [isRefreshing] = useState(false);

  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AdminSidebar />
      <main className="flex-1 ml-16 lg:ml-64 p-6 lg:p-10 max-w-[1600px]">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-zinc-500 text-sm">System Overview & Performance Metrics</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                alert("will fetch new data here...");
              }}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-700 cursor-pointer transition-all active:scale-95"
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
            value={100}
            trendUp={true}
            change="+12.5%"
            icon={Layers}
          />
          <DashboardCard
            label="Success Rate"
            value={"94.2%"}
            trendUp={true}
            change="+0.8%"
            icon={CheckCircle2}
          />
          <DashboardCard
            label="Avg. Execution"
            value={"245ms"}
            trendUp={false}
            change="-12ms"
            icon={Clock}
          />
          <DashboardCard label="Queue Depth" value={21} trendUp={true} change="+8" icon={Server} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div>submission volume graph here</div>

          <div>queue health status graph here</div>
        </div>
      </main>
    </div>
  );
}
