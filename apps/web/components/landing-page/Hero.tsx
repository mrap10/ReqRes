"use client";

import { ArrowRight, Play } from "lucide-react";
import TerminalCode from "./TerminalCode";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const testCases = [
  { name: "GET /orders/42 > returns 200", status: "PASSED" },
  { name: "Missing token > returns 401", status: "PASSED" },
  { name: "Invalid id format > returns 400", status: "PASSED" },
];

export default function Hero() {
  const [typingComplete, setTypingComplete] = useState(false);
  const [visibleTests, setVisibleTests] = useState(0);

  useEffect(() => {
    if (!typingComplete || visibleTests >= testCases.length) {
      return;
    }

    const timer = setTimeout(() => {
      setVisibleTests((prev) => prev + 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [typingComplete, visibleTests]);

  return (
    <section className="relative mx-auto mt-20 grid w-full max-w-6xl gap-12 px-4 pb-10 md:grid-cols-2 md:items-center">
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
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-cyan-400 transition ease-out hover:bg-cyan-500/10 hover:duration-300 hover:border-cyan-400/40">
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
          Express.js scenarios
        </h1>
        <p className="text-base leading-7 text-white/65 sm:text-lg">
          Stop building todo-lists. Solve real-world architectural challenges using Express.js. Fix
          broken endpoints, optimize middleware, and secure APIs.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={"problems"}
            className="inline-flex group items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-indigo-100 cursor-pointer hover:scale-105"
          >
            Start Solving{" "}
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
          <Link
            href={"problems"}
            className="inline-flex group items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white/85 transition hover:border-cyan-300/40 hover:text-white cursor-pointer"
          >
            Watch Demo <Play className="size-4 group-hover:animate-spin-once duration-1000" />
          </Link>
        </div>
        <div className="flex items-center gap-5 text-xs text-white/55">
          <span>14+ practical challenges</span>
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

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
          className="relative border border-white/10 bg-[#09090d] shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-24 bg-linear-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ["-120%", "500%"] }}
            transition={{
              duration: 4.8,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 1.6,
              ease: "easeInOut",
            }}
          />

          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs">
            <div className="inline-flex items-center gap-2 text-white/60">
              <span className="h-2 w-2 rounded-full bg-emerald-300/70" />
              index.js
            </div>
            <span className="rounded-md border border-white/10 bg-amber-400/80 px-2 py-0.5 text-[10px] text-white">
              Medium
            </span>
          </div>

          <div className="md:w-130 space-y-1 p-4 font-mono text-xs text-white/75">
            <TerminalCode typingComplete={typingComplete} setTypingComplete={setTypingComplete} />
          </div>

          <div className="border-t border-white/10 bg-black/30 p-4">
            <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-white/45">
              Test Cases
            </div>
            <div className="space-y-2">
              {testCases.slice(0, visibleTests).map((test) => (
                <motion.div
                  key={test.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/2 px-3 py-2 text-xs"
                >
                  <span className="text-white/70">{test.name}</span>
                  <span className="rounded-md bg-emerald-400/15 px-2 py-1 text-[10px] tracking-[0.08em] text-emerald-200">
                    {test.status}
                  </span>
                </motion.div>
              ))}
              {!typingComplete && (
                <p className="text-xs text-white/40">Waiting for code execution...</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
