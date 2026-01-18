"use client";

import { getProblems } from "@/actions";
import { ProblemListDTO } from "@reqres/types";
import { Award, ChevronDown, Clock, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import DifficultyTag from "./DifficultyTag";

export default function SubmissionHistory() {
  const [problems, setProblems] = useState<ProblemListDTO>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProblems() {
      setIsLoading(true);
      const data = await getProblems();
      setProblems(data[0]);
      setIsLoading(false);
    }
    fetchProblems();
  }, []);

  const trackLabel = problems?.track
    ? problems.track.charAt(0) + problems.track.slice(1).toLowerCase()
    : "General";

  return (
    <div>
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Submission History
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
            Detailed performance metrics for your solved problems.
          </p>
        </div>

        {/* will add functionality later */}
        <button className="flex items-center gap-2 text-xs font-medium cursor-pointer text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors">
          <Filter className="w-3 h-3" /> Filter <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-950/50 text-sm font-mono text-zinc-400 tracking-wider">
            <tr>
              <th className="p-5 font-medium">Problems</th>
              <th className="p-5 font-medium">Category</th>
              <th className="p-5 font-medium">Solved</th>
              <th className="p-5 font-medium">Runtime</th>
              <th className="p-5 font-medium">XP Gained</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-5 text-center text-zinc-500">
                  Loading...
                </td>
              </tr>
            ) : (
              <tr className="hover:bg-zinc-800/30 transition-colors group">
                <td className="p-5">
                  <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                    {problems?.title}
                  </div>
                  <DifficultyTag level={problems?.difficulty || "EASY"} />
                </td>
                <td className="p-5">
                  <span className="text-zinc-400 bg-zinc-900 px-2 py-1 rounded text-xs border border-zinc-800">
                    {trackLabel}
                  </span>
                </td>
                <td className="p-5 text-zinc-400 font-mono text-sm">18-01-2026</td>
                <td className="p-5 text-zinc-400 font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: "40%" }}
                      ></div>
                    </div>
                    120 ms
                  </div>
                </td>
                <td className="p-5">
                  <div className="flex flex-col">
                    <span className="text-indigo-400 font-bold font-mono">+50 XP</span>
                    <span className="text-[10px] text-emerald-500 flex items-center gap-1 mt-0.5">
                      <Award className="w-3 h-3" /> First Try Bonus
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
