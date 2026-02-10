"use client";

import { motion } from "motion/react";
import { Database, Server, ShieldCheck, Terminal, Zap } from "lucide-react";

interface FiltersProps {
  currentFilter: string;
  setFilter: (filter: string) => void;
}

export default function Filters({ currentFilter, setFilter }: FiltersProps) {
  const categories = [
    { id: "all", label: "All Problems", icon: Terminal },
    { id: "routing", label: "Routing", icon: Server },
    { id: "middleware", label: "Middleware", icon: Zap },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "database", label: "Database", icon: Database },
  ];

  const difficulty = [
    { id: "easy", label: "Easy" },
    { id: "medium", label: "Medium" },
    { id: "hard", label: "Hard" },
  ];

  return (
    <div className="space-y-4 flex justify-between">
      <div>
        <p className="mb-2 text-sm tracking-wider text-white/45">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = currentFilter === category.id;
            return (
              <motion.button
                key={category.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(category.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition flex items-center gap-2 ${
                  isActive
                    ? "border-indigo-300/45 bg-indigo-400/15 text-white"
                    : "border-white/12 bg-white/3 text-white/70 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {category.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm tracking-wider text-center text-white/45">Difficulty</p>
        <div className="flex flex-wrap gap-4">
          {difficulty.map((level) => {
            const isActive = currentFilter === level.id;
            return (
              <motion.button
                key={level.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setFilter(level.id)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                  isActive
                    ? "border-indigo-300/45 bg-indigo-400/15 text-white"
                    : "border-white/12 bg-white/3 text-white/70 hover:text-white"
                }`}
              >
                {level.label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
