"use client";

import { motion } from "motion/react";
import Link from "next/link";

export default function CTA() {
  return (
    <div className="mx-auto mt-24 w-full max-w-6xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-[#0d0d13] border border-white/10 px-6 py-14 text-center sm:px-10"
      >
        <div className="pointer-events-none absolute inset-0 opacity-50 bg-[linear-gradient(to_right,rgba(124,131,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,131,255,0.08)_1px,transparent_1px)] bg-size:[56px_56px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(124,131,255,0.28),transparent)]" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-28 w-2/3 -translate-x-1/2 rounded-full bg-cyan-300/8 blur-3xl" />
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />

        <div className="max-w-2xl mx-auto relative">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Build{" "}
            <span className="bg-linear-to-r from-indigo-300 to-cyan-200 bg-clip-text text-transparent">
              production-grade
            </span>{" "}
            Express instincts.
          </h2>
          <p className="mx-auto mt-4 mb-8 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
            Join the ReqRes beta and train on request/response edge cases teams actually hit in
            backend systems.
          </p>

          <Link
            href={"problems"}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-indigo-100 cursor-pointer hover:scale-105"
          >
            Start Challenges
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
