import { Activity, TrendingUp } from "lucide-react";
import { GlowingRadialChart } from "./ui/glowing-radial-chart";

export default function LeaderboardPiechart() {
  return (
    <div className="space-y-3">
      <GlowingRadialChart />
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-900/40 border border-zinc-500/20 p-4 rounded-xl">
            <div className="text-zinc-400 text-xs tracking-wider mb-1 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Global Rank
            </div>
            <div className="text-2xl font-bold text-indigo-400">#10</div>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-500/20 p-4 rounded-xl">
            <div className="text-zinc-400 text-xs tracking-wider mb-1 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Streak
            </div>
            <div className="text-2xl font-bold text-indigo-400">18 Days</div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-500/20 rounded-xl p-4 overflow-hidden">
          <h3 className="font-bold text-zinc-200 tracking-wider mb-2 flex items-center gap-2">
            Scoring System
          </h3>
          <div className="space-y-2 text-sm text-zinc-400">
            <div className="flex justify-between">
              <span>Base XP</span>
              <span className="text-zinc-300 font-mono">Difficulty Based</span>
            </div>
            <div className="flex justify-between">
              <span>First Try Bonus</span>
              <span className="text-emerald-400 font-mono">+20% XP</span>
            </div>
            <div className="text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-800">
              Earn XP to climb the global ranks and showcase your skills!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
