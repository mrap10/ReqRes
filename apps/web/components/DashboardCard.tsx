import { TrendingDown, TrendingUp } from "lucide-react";

interface DashboardCardProps {
  label: string;
  value: string | number;
  trendUp: boolean;
  change: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function DashboardCard({
  label,
  value,
  trendUp,
  change,
  icon: Icon,
}: DashboardCardProps) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-xl flex flex-col justify-between hover:bg-zinc-900/60 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-zinc-500 text-sm font-medium tracking-wider mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400">
          <Icon className="w-4 h-4 text-zinc-400" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span
          className={`flex items-center font-bold ${trendUp ? "text-emerald-400" : "text-rose-400"}`}
        >
          {trendUp ? (
            <TrendingUp className="w-3 h-3 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 mr-1" />
          )}
          {change}
        </span>
        <span className="text-zinc-500">vs last period</span>
      </div>
    </div>
  );
}
