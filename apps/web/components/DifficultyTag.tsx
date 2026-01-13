export default function DifficultyTag({ level }: { level: "Easy" | "Medium" | "Hard" }) {
  const styles = {
    Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Hard: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <span className={`px-2 py-1 text-xs font-mono font-medium rounded-md border ${styles[level]}`}>
      {level}
    </span>
  );
}
