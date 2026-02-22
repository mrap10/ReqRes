"use client";

import { LeaderboardDTO } from "@reqres/types";
import { ArrowRight, Crown, MessageCircleWarning } from "lucide-react";
import Link from "next/link";

interface LeaderboardTableProps {
  leaderboardData: LeaderboardDTO[];
  isLoading: boolean;
  currentUserId: string | null;
  userEntry: LeaderboardDTO | null;
}

function rankTone(rank: number) {
  if (rank === 1) return "text-amber-200";
  if (rank === 2) return "text-slate-200";
  if (rank === 3) return "text-orange-200";
  return "text-white/75";
}

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-b border-white/7 last:border-b-0">
      <td className="px-4 py-3 sm:px-5">
        <div className="h-4 w-8 animate-pulse rounded bg-zinc-800" />
      </td>
      <td className="px-4 py-3 sm:px-5">
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
      </td>
      <td className="px-4 py-3 sm:px-5">
        <div className="h-4 w-12 animate-pulse rounded bg-zinc-800" />
      </td>
      <td className="px-4 py-3 sm:px-5">
        <div className="h-4 w-16 animate-pulse rounded bg-zinc-800" />
      </td>
    </tr>
  ));
}

export default function LeaderboardTable({
  leaderboardData,
  isLoading,
  currentUserId,
  userEntry,
}: LeaderboardTableProps) {
  const isUserOnBoard = currentUserId
    ? leaderboardData.some((u) => u.userId === currentUserId)
    : false;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10]">
      {!isLoading && currentUserId && !isUserOnBoard && !userEntry && (
        <div className="m-4 mb-0 p-4 bg-linear-to-r from-indigo-500/10 via-transparent to-cyan-500/10 border border-indigo-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <MessageCircleWarning className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  You&apos;re not ranked yet!
                </h3>
                <p className="text-xs text-zinc-400">
                  Solve your first problem to gain XP and see your name on the leaderboard.
                </p>
              </div>
              <Link
                href="/problems"
                className="inline-flex items-center gap-2 text-xs font-medium text-white hover:text-indigo-300 transition-colors whitespace-nowrap"
              >
                Start solving problems
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-white/10 px-4 py-4 sm:px-5">
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Top performers</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-170">
          <thead>
            <tr className="border-b border-white/10 text-left text-sm tracking-wider text-white/45">
              <th className="px-4 py-3 font-medium sm:px-5">Rank</th>
              <th className="px-4 py-3 font-medium sm:px-5">Username</th>
              <th className="px-4 py-3 font-medium sm:px-5">Problems Solved</th>
              <th className="px-4 py-3 font-medium sm:px-5">Total XP</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : leaderboardData.length > 0 ? (
              <>
                {leaderboardData.map((entry) => {
                  const rank = entry.globalRank;
                  const isCurrentUser = currentUserId === entry.userId;
                  return (
                    <tr
                      key={entry.userId}
                      className={`border-b border-white/7 text-sm last:border-b-0 ${
                        isCurrentUser ? "bg-indigo-400/8" : "hover:bg-white/3"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium sm:px-5">
                        <span className={`inline-flex items-center gap-1.5 ${rankTone(rank)}`}>
                          {rank <= 3 && <Crown className="h-3.5 w-3.5" />}#{rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium sm:px-5">
                        <span className="inline-flex items-center gap-1.5">
                          {entry.username}
                          {isCurrentUser && (
                            <span className="rounded-full border border-indigo-300/35 bg-indigo-400/15 px-2 py-0.5 text-xs tracking-wider text-indigo-100">
                              You
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-white/75 sm:px-5">
                        {entry.problemsSolved}
                      </td>
                      <td className="px-4 py-3 font-mono text-white/75 sm:px-5">
                        {entry.totalScore}
                      </td>
                    </tr>
                  );
                })}

                {userEntry && (
                  <>
                    <tr className="border-b border-white/7">
                      <td colSpan={4} className="px-4 py-1 sm:px-5">
                        <div className="flex items-center gap-2 text-xs text-zinc-600">
                          <div className="flex-1 border-t border-dashed border-zinc-800" />
                          <span className="text-zinc-600">···</span>
                          <div className="flex-1 border-t border-dashed border-zinc-800" />
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-indigo-400/8 text-sm">
                      <td className="px-4 py-3 font-medium sm:px-5">
                        <span className="inline-flex items-center gap-1.5 text-white/75">
                          #{userEntry.globalRank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium sm:px-5">
                        <span className="inline-flex items-center gap-1.5">
                          {userEntry.username}
                          <span className="rounded-full border border-indigo-300/35 bg-indigo-400/15 px-2 py-0.5 text-xs tracking-wider text-indigo-100">
                            You
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-white/75 sm:px-5">
                        {userEntry.problemsSolved}
                      </td>
                      <td className="px-4 py-3 font-mono text-white/75 sm:px-5">
                        {userEntry.totalScore}
                      </td>
                    </tr>
                  </>
                )}
              </>
            ) : (
              <tr>
                <td colSpan={4} className="p-5 text-center text-zinc-500">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
