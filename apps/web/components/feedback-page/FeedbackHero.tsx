"use client";

import { motion } from "motion/react";

export default function FeedbackHero() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-6xl px-4">
      <div className="text-center max-w-2xl mx-auto mb-15">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-xs font-mono text-zinc-400 my-3"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          Community Driven
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
        >
          Shape the next version of{" "}
          <span className="bg-linear-to-r from-indigo-300 to-cyan-200 bg-clip-text text-transparent">
            ReqRes
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-zinc-400 leading-relaxed"
        >
          ReqRes is designed to be the ultimate sandbox for backend engineering. Found a glitch?
          Have a wild idea? We&apos;re listening.
        </motion.p>
      </div>
    </div>
  );
}
