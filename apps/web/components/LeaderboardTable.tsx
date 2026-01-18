"use client";

import { Search, Trophy, User } from "lucide-react";
import { useState } from "react";

export default function LeaderboardTable() {
  const [searchTerm, setSearchTerm] = useState("");

  // const rankColor =
  //     user.rank === 1 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
  //     user.rank === 2 ? 'text-zinc-300 bg-zinc-300/10 border-zinc-300/20' :
  //     user.rank === 3 ? 'text-amber-600 bg-amber-600/10 border-amber-600/20' :
  //     'text-zinc-500 bg-zinc-800/50 border-zinc-800';
  const rankColor = "text-zinc-500 bg-zinc-800/50 border-zinc-800";
  return (
    <div>
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
            <tr className="border-b border-white/5 hover:bg-zinc-800/30 transition-colors group">
              <td className="p-4">
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border font-bold ${rankColor}`}
                >
                  1
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-lg shadow-inner">
                    <User className="w-5 h-5 text-indigo-500" />
                  </div>
                  <span className="font-medium text-zinc-300">Peter Parker</span>
                </div>
              </td>
              <td className="p-4 text-right font-mono text-zinc-400">5</td>
              <td className="p-4 text-right">
                <span className="font-mono font-bold text-zinc-400">123 XP</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
