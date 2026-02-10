"use client";

import { motion } from "motion/react";

export default function CTA() {
  return (
    <div>
      <motion.div className="py-32 bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
            Ready to handle <br />
            <span className="text-indigo-400">Traffic?</span>
          </h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Join thousands of developers mastering Express.js through practices, not passive
            reading.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]">
              Start Challenge
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-900 transition-all cursor-pointer">
              View Challenges
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
