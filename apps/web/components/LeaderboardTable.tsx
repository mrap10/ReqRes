"use client";

import { getLeaderboard } from "@/actions";
import { LeaderboardDTO } from "@reqres/types";
import { Search, Trophy, User, ArrowRight, MessageCircleWarning } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LeaderboardTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardDTO[]>([]);

  // TODO: replace with actual user ID from auth context
  const currentUserId = "cmke8l4hl000304ju6o218tod";
  const isUserOnLeaderboard = leaderboardData.some((user) => user.userId === currentUserId);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      const data = await getLeaderboard();
      setLeaderboardData(data);
      setIsLoading(false);
    }
    fetchLeaderboard();
  }, []);

  return (
    <div>
      {!isLoading && leaderboardData.length > 0 && !isUserOnLeaderboard && (
        <div className="m-4 mb-0 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
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
                className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Start solving problems
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-3 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/80">
        <div className="flex items-center gap-2 text-yellow-500 font-bold text-lg">
          <Trophy className="w-5 h-5 fill-current" />
          <span>Top 10</span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <table className="w-full text-left border-collapse">
          <thead className="text-sm font-mono text-zinc-500 tracking-wider sticky top-0 bg-zinc-900 z-10">
            <tr>
              <th className="p-4">Rank</th>
              <th className="p-4">User</th>
              <th className="p-4 text-right">Problems Solved</th>
              <th className="p-4 text-right">Total XP</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto animate-spin" />
                  <p className="mt-2 text-zinc-400">Loading leaderboard...</p>
                </td>
              </tr>
            ) : leaderboardData.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-zinc-400">
                  No leaderboard data available.
                </td>
              </tr>
            ) : (
              leaderboardData
                .filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((user, index) => {
                  const rankColor =
                    user.globalRank === 1
                      ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                      : user.globalRank === 2
                        ? "text-zinc-300 bg-zinc-300/10 border-zinc-300/20"
                        : user.globalRank === 3
                          ? "text-amber-600 bg-amber-600/10 border-amber-600/20"
                          : "text-zinc-500 bg-zinc-800/50 border-zinc-800";
                  return (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-zinc-800/30 transition-colors group"
                    >
                      <td className="p-4">
                        <span
                          className={`w-8 h-8 flex items-center justify-center rounded-lg border font-bold ${rankColor}`}
                        >
                          {user.globalRank}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-lg shadow-inner">
                            <User className="w-5 h-5 text-indigo-500" />
                          </div>
                          <span className="font-medium text-zinc-300">{user.username}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono text-zinc-400">
                        {user.problemsSolved}
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-mono font-bold text-zinc-400">
                          {user.totalScore} XP
                        </span>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
