"use client";

import { Clock3, FileText, Rocket } from "lucide-react";
import { motion } from "motion/react";

const bugChecklist = [
  "What you expected vs what happened",
  "Exact route, payload, and status code",
  "Browser/OS or runtime details",
];

const flow = [
  {
    title: "We triage every message",
    detail: "Feedback is reviewed and grouped by impact on learning flow.",
    icon: FileText,
  },
  {
    title: "Bugs get tracked publicly",
    detail: "Confirmed bugs are moved into GitHub issue tracking for visibility.",
    icon: Rocket,
  },
  {
    title: "Response cadence",
    detail: "Critical bugs are prioritized first, then UX and feature requests.",
    icon: Clock3,
  },
];

export default function FeedbackDetails() {
  return (
    <div className="mx-auto mt-8 w-full max-w-6xl px-4 pb-16">
      <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-white/10 bg-[#0b0b10] p-5"
        >
          <p className="text-xs tracking-wider text-white/45">Better bug reports</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
            Include this for faster fixes.
          </h3>
          <ul className="mt-4 space-y-4">
            {bugChecklist.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-sm text-white/72"
              >
                {item}
              </li>
            ))}
          </ul>
        </motion.article>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="rounded-2xl border border-white/10 bg-[#0b0b10] p-5"
        >
          <p className="text-sm tracking-wider text-white/45">How we handle feedback</p>
          <div className="mt-3 space-y-3">
            {flow.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/3 px-3 py-3"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-cyan-200" />
                  <h4 className="text-sm font-medium text-white">{item.title}</h4>
                </div>
                <p className="mt-1 text-sm text-white/62">{item.detail}</p>
              </div>
            ))}
          </div>
        </motion.article>
      </div>
    </div>
  );
}
