"use client";

import { CheckCircle2 } from "lucide-react";
import TerminalCode from "./TerminalCode";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="relative mx-auto mt-16 grid w-full max-w-6xl gap-12 px-4 pb-10 md:grid-cols-[1.04fr_0.96fr] md:items-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-125 h-125 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="space-y-7"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-cyan-400 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          v1.0 Public Beta Live
        </div>
        <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Practice{" "}
          <span className="bg-linear-to-r from-indigo-300 to-cyan-200 bg-clip-text text-transparent">
            real-life
          </span>{" "}
          Express.js scenarios, not toy snippets.
        </h1>
        <p className="text-base leading-7 text-white/65 sm:text-lg">
          Stop building todo-lists. Solve real-world architectural challenges using Express.js. Fix
          broken endpoints, optimize middleware, and secure APIs.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-indigo-100 cursor-pointer hover:scale-105">
            Start Practicing
          </button>
          <button className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white/85 transition hover:border-cyan-300/40 hover:text-white cursor-pointer">
            View Challenge List
          </button>
        </div>
        <div className="flex items-center gap-5 text-xs text-white/55">
          <span>15+ practical challenges</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Browser coding sandbox</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Live test runner</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
        className="relative"
      >
        <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-cyan-600 rounded-2xl blur opacity-20"></div>
        <div className="pointer-events-none absolute -left-6 -top-8 h-24 w-24 rounded-full bg-indigo-400/18 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 -right-5 h-24 w-24 rounded-full bg-cyan-400/14 blur-2xl" />

        <motion.div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
            </div>
            <div className="text-xs font-mono text-zinc-400">index.js</div>
            <div className="w-10" />
          </div>

          <div className="p-6 bg-zinc-950/50 min-h-90">
            <TerminalCode />
          </div>

          <div className="border-t border-zinc-800 bg-zinc-950 p-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tests Passed (4/4)</span>
            </div>
            <div className="space-y-1 text-zinc-400">
              <div className="flex justify-between">
                <span>✓ should handle missing credentials</span>
                <span className="text-zinc-500">12ms</span>
              </div>
              <div className="flex justify-between">
                <span>✓ should validate email format</span>
                <span className="text-zinc-500">6ms</span>
              </div>
              <div className="flex justify-between">
                <span>✓ should prevent SQL injection</span>
                <span className="text-zinc-500">8ms</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
