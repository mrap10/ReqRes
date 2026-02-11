"use client";

import { motion } from "motion/react";
import { Database, Server, ShieldCheck, Terminal, Zap } from "lucide-react";

interface FiltersProps {
  activeCategory: string;
  activeDifficulty: string;
  setCategory: (filter: string) => void;
  setDifficulty: (filter: string) => void;
}

export default function Filters({
  activeCategory,
  activeDifficulty,
  setCategory,
  setDifficulty,
}: FiltersProps) {
  const categories = [
    { id: "all", label: "All Problems", icon: Terminal },
    { id: "ROUTING", label: "Routing", icon: Server },
    { id: "MIDDLEWARE", label: "Middleware", icon: Zap },
    { id: "SECURITY", label: "Security", icon: ShieldCheck },
    { id: "DATABASE", label: "Database", icon: Database },
  ];

  const difficulty = [
    { id: "all", label: "All" },
    { id: "EASY", label: "Easy" },
    { id: "MEDIUM", label: "Medium" },
    { id: "HARD", label: "Hard" },
  ];

  return (
    <div className="space-y-4 flex justify-between">
      <div>
        <p className="mb-2 text-sm tracking-wider text-white/45">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <motion.button
                key={category.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setCategory(category.id)}
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
            const isActive = activeDifficulty === level.id;
            return (
              <motion.button
                key={level.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setDifficulty(level.id)}
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
