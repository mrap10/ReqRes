export default function QueueHealth() {
  return (
    <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-xl flex flex-col hover:bg-zinc-900/60 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-bold text-white">Queue Health</h1>
          <p className="text-xs text-zinc-500">BullMQ Status</p>
        </div>
        <div className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
          4 Workers
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6">
        <div className="space-y-4">
          <QueueBars label="Active Processing" value={12} total={100} color="emerald" />
          <QueueBars label="Waiting in Queue" value={42} total={100} color="amber" />
          <QueueBars label="Delayed/Scheduled" value={5} total={100} color="indigo" />
          <QueueBars label="Failed (Requires Retry)" value={8} total={100} color="rose" />
        </div>
        <div className="pt-6 border-t border-white/5 mt-auto">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Redis Memory</span>
            <span className="text-white font-mono">245MB/512MB</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-2">
            <div className="bg-zinc-600 h-full rounded-full" style={{ width: "24%" }} />
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
        <span className="text-white font-mono">{value}</span>
      </div>

      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full translate-all duration-500 ${colors[color as keyof typeof colors]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
