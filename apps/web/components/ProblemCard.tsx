"use client";

import DifficultyTag from "./DifficultyTag";
import { ProblemListDTO } from "@reqres/types";
import Link from "next/link";
import { motion } from "motion/react";

interface ProblemCardProps {
  problem: ProblemListDTO;
}

export default function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 230, damping: 20 }}
      className="group relative h-full overflow-hidden rounded-2xl border p-2 border-[#0b0b10]"
    >
      <Link href={`/problems/${problem.slug}`} className="block h-full">
        <div className="group relative h-full flex flex-col bg-zinc-900/40 border border-white/5 rounded-xl p-6 hover:bg-zinc-900 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/42">
                {problem.track}
              </p>
              <h3 className="mt-2 text-lg font-medium tracking-tight text-white">
                {problem.title}
              </h3>
            </div>
            <DifficultyTag level={problem.difficulty} />
          </div>

          <p className="flex-1 text-sm leading-6 text-white/62">{problem.shortDescription}</p>

          <div className="mt-4 pt-4 flex flex-wrap gap-2 border-t border-white/10">
            {problem.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-white/10 bg-white/3 px-2 py-1 font-mono text-[11px] text-white/56"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
