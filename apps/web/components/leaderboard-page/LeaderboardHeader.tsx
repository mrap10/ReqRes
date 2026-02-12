import { Activity, Trophy, User } from "lucide-react";
import { ReactNode } from "react";

interface LeaderboardHeaderProps {
  totalPlayers: number;
  topXP: number;
  userRank: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | string | null;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/4 px-3 py-3">
      <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-white/55">
        {icon}
        {label}
      </p>
      {value !== null ? (
        <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      ) : (
        <div className="mt-2 h-8 w-12 animate-pulse rounded bg-zinc-800" />
      )}
    </div>
  );
}

export default function LeaderboardHeader({
  totalPlayers,
  topXP,
  userRank,
  isAuthenticated,
  isLoading,
}: LeaderboardHeaderProps) {
  const showRankCard = isAuthenticated;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d13] p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_-20%,rgba(124,131,255,0.22),transparent_45%),radial-gradient(circle_at_88%_-30%,rgba(76,215,246,0.14),transparent_42%)]" />

      <div className="relative grid gap-8 lg:grid-cols-2 lg:items-end">
        <div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Global standings of developers on ReqRes.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
            Compare progress across the community, and once logged in, track your
            solved-distribution and submission history in the same view.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/35 p-4 sm:p-5">
          <div
            className={`grid grid-cols-1 gap-3 ${showRankCard ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
          >
            <StatCard
              icon={<Activity className="h-3.5 w-3.5 text-cyan-200" />}
              label="Players"
              value={isLoading ? null : totalPlayers}
            />
            <StatCard
              icon={<Trophy className="h-3.5 w-3.5 text-amber-200" />}
              label="Top XP"
              value={isLoading ? null : topXP}
            />
            {showRankCard && (
              <StatCard
                icon={<User className="h-3.5 w-3.5 text-indigo-200" />}
                label="Your Rank"
                value={isLoading ? null : userRank ? `#${userRank}` : "Unranked"}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
