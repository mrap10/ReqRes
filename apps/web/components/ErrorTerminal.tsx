"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function ErrorTerminal() {
  const [lines, setLines] = useState([
    { text: "GET /unknown-route", color: "text-blue-400" },
    { text: "Resolving path...", color: "text-zinc-500" },
  ]);

  useEffect(() => {
    const sequence = [
      { text: "Error: Route not defined", color: "text-rose-500" },
      { text: "Status: 404 Not Found", color: "text-amber-400" },
      { text: "Stack trace available below...", color: "text-zinc-600" },
    ];

    const delay = 500;
    sequence.forEach((line, index) => {
      setTimeout(
        () => {
          setLines((prev) => [...prev, line]);
        },
        delay * (index + 1)
      );
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full max-w-md bg-black/50 border border-zinc-800 rounded-lg overflow-hidden backdrop-blur-sm shadow-2xl"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>
        <div className="text-[10px] font-mono text-zinc-500">terminal — zsh</div>
      </div>
      <div className="p-4 font-mono text-xs space-y-2 min-h-35">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-zinc-600 select-none w-2">&gt;</span>
            <span className={line.color}>{line.text}</span>
          </div>
        ))}
        <div className="flex gap-3">
          <span className="text-zinc-600 select-none w-2">{`>`}</span>
          <span className="w-2 h-4 bg-indigo-500 animate-pulse block" />
        </div>
      </div>
    </motion.div>
  );
}
