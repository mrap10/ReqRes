import { ProblemDifficulty } from "@reqres/types";

export default function DifficultyTag({ level }: { level: ProblemDifficulty }) {
  const styles: Record<ProblemDifficulty, string> = {
    EASY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    HARD: "bg-rose-500/10 text-rose-400 border-rose-500/20",
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
