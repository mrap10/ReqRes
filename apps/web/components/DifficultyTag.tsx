import { ProblemDifficulty } from "@reqres/types";

export default function DifficultyTag({ level }: { level: ProblemDifficulty }) {
  const styles: Record<ProblemDifficulty, string> = {
    EASY: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
    MEDIUM: "border-amber-300/30 bg-amber-400/10 text-amber-100",
    HARD: "border-rose-300/25 bg-rose-400/10 text-rose-300",
  };

  const labels: Record<ProblemDifficulty, string> = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
  };

  return (
    <span className={`px-2 py-1 text-xs font-mono font-medium rounded-md border ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}
