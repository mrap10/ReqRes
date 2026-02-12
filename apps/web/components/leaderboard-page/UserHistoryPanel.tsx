"use client";

import { useAuth } from "@/lib/providers/AuthProvider";
import { useUserSubmissions } from "@/lib/providers/UserSubmissionsProvider";
import { ChartColumnIncreasing, Lock, Sparkles, Zap } from "lucide-react";
import SubmissionHistory from "./SubmissionHistory";
import { GlowingRadialChart } from "../ui/glowing-radial-chart";

export default function UserHistoryPanel() {
  const { user, isAuthenticated } = useAuth();
  const { totalSolved, difficultyCounts, baseXp, bonusXp, isLoading } = useUserSubmissions();

  return (
    <div>
      {isAuthenticated ? (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0b0b10] p-4 sm:p-5">
            <p className="text-sm tracking-wider text-white/45">Your Performance</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/4 p-3">
                <p className="text-sm tracking-wider text-white/50">Username</p>
                <p className="mt-2 text-lg font-semibold text-white">{user?.username}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/4 p-3">
                <p className="inline-flex items-center gap-1.5 text-sm tracking-wider text-white/50">
                  <ChartColumnIncreasing className="w-3.5 h-3.5 text-cyan-200" />
                  Solved
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {isLoading ? "—" : totalSolved}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/4 p-3">
                <p className="inline-flex items-center gap-1.5 text-sm tracking-wider text-white/50">
                  <Zap className="w-3.5 h-3.5 text-amber-200" />
                  XP Snapshot
                </p>
                <p className="mt-2 text-lg font-semibold text-white">{user?.xp}</p>
                <p className="text-xs text-white/50">
                  {isLoading ? "calculating..." : `base ${baseXp} + bonus ${bonusXp}`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="w-full">
              <GlowingRadialChart
                difficultyCounts={difficultyCounts}
                totalSolved={totalSolved}
                isLoading={isLoading}
              />
            </div>
            <div className="col-span-2 overflow-auto">
              <SubmissionHistory />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b0b10] p-5">
          <div className="inline-flex items-center gap-2 text-xs text-white/58">
            <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
            Guest view enabled
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-white">
            Sign in to unlock your difficulty analytics and submissions history.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            This route remains public, but authenticated users get extra insight cards,
            solved-distribution pie chart, and detailed XP breakdown per solved problem.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/4 px-3 py-2 text-xs text-white/75">
            <Lock className="h-3.5 w-3.5 text-indigo-100" />
            Private analytics appear after login.
          </div>
        </div>
      )}
    </div>
  );
}
