"use client";

import { Award, CheckCircle2, XCircle } from "lucide-react";
import DifficultyTag from "../DifficultyTag";
import { Skeleton } from "../ui/skeleton";
import { useUserSubmissions } from "@/lib/providers/UserSubmissionsProvider";
import { slugify } from "@reqres/utils";
import Link from "next/link";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  PASSED: { label: "Passed", className: "text-emerald-400", Icon: CheckCircle2 },
  WRONG_ANSWER: { label: "Wrong Answer", className: "text-red-400", Icon: XCircle },
  RUNTIME_ERROR: { label: "Runtime Error", className: "text-red-400", Icon: XCircle },
  TIME_LIMIT: { label: "Time Limit", className: "text-amber-400", Icon: XCircle },
  MEMORY_LIMIT: { label: "Memory Limit", className: "text-amber-400", Icon: XCircle },
  COMPILE_ERROR: { label: "Compile Error", className: "text-red-400", Icon: XCircle },
};

export default function SubmissionHistory() {
  const { submissions, isLoading } = useUserSubmissions();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10]">
      <div className="px-4 py-4 sm:px-5 border-b border-white/10">
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">Submission History</h3>
        <p className="mt-2 text-xs text-white/55">
          Bonus XP is awarded only when all test cases pass on first attempt.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-225">
          <thead>
            <tr className="border-b border-white/10 text-left text-sm tracking-wider text-white/45">
              <th className="px-4 py-3 font-medium sm:px-5">Problem</th>
              <th className="px-4 py-3 font-medium sm:px-5">Status</th>
              <th className="px-4 py-3 font-medium sm:px-5">Difficulty</th>
              <th className="px-4 py-3 font-medium sm:px-5">Date</th>
              <th className="px-4 py-3 font-medium sm:px-5">Runtime</th>
              <th className="px-4 py-3 font-medium sm:px-5">XP Gained</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-white/7">
                  <td className="px-4 py-3.5 sm:px-5">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <Skeleton className="h-4 w-14" />
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <Skeleton className="h-4 w-16" />
                  </td>
                </tr>
              ))
            ) : submissions && submissions.length > 0 ? (
              submissions.map((submission) => {
                const statusInfo = STATUS_CONFIG[submission.status] || STATUS_CONFIG.PASSED!;
                const StatusIcon = statusInfo.Icon;

                return (
                  <tr
                    key={submission.id}
                    className="border-b border-white/7 text-sm last:border-b-0 hover:bg-white/3"
                  >
                    <td className="px-4 py-3 text-white/85 hover:text-white sm:px-5">
                      <Link href={`/problems/${slugify(submission.problemTitle)}`}>
                        {submission.problemTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${statusInfo.className}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <DifficultyTag level={submission.difficulty} />
                    </td>
                    <td className="px-4 py-3 text-white/75 sm:px-5">
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-white/75 sm:px-5">{submission.durationMs} ms</td>
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="font-mono text-white/75">{submission.xpEarned} XP</span>
                        {submission.isFirstTryBonus && (
                          <span className="text-[10px] text-emerald-500 flex items-center gap-1 mt-0.5">
                            <Award className="w-3 h-3" /> First Try Bonus
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-5 text-center text-zinc-500">
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
