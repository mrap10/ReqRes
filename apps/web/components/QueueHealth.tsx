import type { QueueMetrics } from "@/lib/types/metrics";

interface QueueHealthProps {
  data: QueueMetrics | null;
  isLoading?: boolean;
}

export default function QueueHealth({ data, isLoading = false }: QueueHealthProps) {
  const total = data?.total || 100;

  return (
    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-xl flex flex-col hover:bg-zinc-900/60 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-bold text-white">Queue Health</h1>
          <p className="text-xs text-zinc-500">BullMQ Status</p>
        </div>
        <div className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
          {isLoading ? "..." : `${data?.active ?? 0} Active`}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 bg-zinc-800 animate-pulse rounded w-1/3" />
                <div className="h-2 bg-zinc-800 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <QueueBars
              label="Active Processing"
              value={data?.active ?? 0}
              total={Math.max(total, 1)}
              color="emerald"
            />
            <QueueBars
              label="Waiting in Queue"
              value={data?.waiting ?? 0}
              total={Math.max(total, 1)}
              color="amber"
            />
            <QueueBars
              label="Completed"
              value={data?.completed ?? 0}
              total={Math.max(total, 1)}
              color="indigo"
            />
            <QueueBars
              label="Failed"
              value={data?.failed ?? 0}
              total={Math.max(total, 1)}
              color="rose"
            />
          </div>
        )}
        <div className="pt-6 border-t border-white/5 mt-auto">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Total Jobs Processed</span>
            <span className="text-white font-mono">
              {isLoading ? "..." : (data?.total ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${data && data.total > 0 ? Math.min(((data.completed ?? 0) / data.total) * 100, 100) : 0}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>Success Rate</span>
            <span>
              {data && data.total > 0
                ? `${(((data.completed ?? 0) / data.total) * 100).toFixed(1)}%`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QueueBarsProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function QueueBars({ label, value, total, color }: QueueBarsProps) {
  const percent = Math.min((value / total) * 100, 100);
  const colors = {
    indigo: "bg-indigo-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400 font-medium">{label}</span>
        <span className="text-white font-mono">{value.toLocaleString()}</span>
      </div>

      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors[color as keyof typeof colors]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
