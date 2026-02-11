import {
  AdminRateLimitTable,
  AdminSidebar,
  GlobalConfigCard,
  RateLimitStatsCard,
} from "@/components/admin-components";
import { ShieldCheck } from "lucide-react";

export default function RateLimitPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AdminSidebar />
      <main className="flex-1 ml-16 lg:ml-64 p-6 lg:p-10 max-w-300">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Rate Limits</h1>
            <p className="text-zinc-500 text-sm">Traffic Control & IP Security</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-400">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Redis Store Active
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <GlobalConfigCard />
          <RateLimitStatsCard />
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden min-h-125 flex flex-col">
          <AdminRateLimitTable />
        </div>
      </main>
    </div>
  );
}
