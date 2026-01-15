import { Code } from "lucide-react";
import DifficultyTag from "./DifficultyTag";
import { ProblemListDTO } from "@reqres/types";
import Link from "next/link";

interface ProblemCardProps {
  problem: ProblemListDTO;
}

export default function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <Link href={`/problems/${problem.slug}`} className="block">
      <div className="group relative bg-zinc-900/40 border border-white/5 rounded-xl p-6 hover:bg-zinc-900 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                {problem.title}
              </h3>
              <DifficultyTag level={problem.difficulty} />
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed h-10">
              {problem.shortDescription}
            </p>
          </div>

          <button className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer text-zinc-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
            <Code className="size-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800"
              >
                #{tag.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
