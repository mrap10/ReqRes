"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

const steps = [
  {
    title: "Pick a Problem",
    description:
      "Choose from 15+ challenges ranging from 'Hello, Express!' to 'Implement GraphQL like Query API'.",
  },
  {
    title: "Write Your Code",
    description:
      "No setup required. Our VS Code-like Editor comes pre-configured with Express and necessary dependencies.",
  },
  {
    title: "Run & Validate",
    description:
      "Fire tests to verify request shape, response status, payload contracts, and edge handling.",
  },
];

const flowStages = [
  {
    label: "Request",
    title: "POST /api/auth/login",
    code: "body: { email, password }",
    status: "Incoming",
  },
  { label: "Response", title: "200 OK", code: "{ token, expiresIn, role }", status: "Returned" },
  {
    label: "Test",
    title: "Auth headers + body schema",
    code: "expect(status).toBe(200)",
    status: "Passed",
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((value) => (value + 1) % flowStages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto mt-24 flex justify-center bg-[linear-gradient(170deg,#0d0d13_0%,#09090d_48%,#0b0b0f_100%)]">
      <div className="max-w-6xl overflow-hidden px-4 py-10 sm:px-8 sm:py-12">
        <div className="grid gap-10 md:grid-cols-[1.08fr_0.92fr] md:items-center">
          <div>
            <h2 className="mb-8 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              The Flow is{" "}
              <span className="bg-linear-to-r from-indigo-300 to-cyan-200 bg-clip-text text-transparent">
                Simple.
              </span>
            </h2>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/3 text-xs text-white/75">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{step.title}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
              {flowStages.map((stage, index) => (
                <button
                  key={stage.label}
                  onClick={() => setActive(index)}
                  className={`rounded-md px-3 py-1 text-xs transition ${
                    index === active
                      ? "bg-white text-black"
                      : "bg-white/4 text-white/70 hover:text-white"
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>

            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="rounded-xl border border-white/10 bg-[#090a0f] p-4"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-white">{flowStages[active]?.title}</p>
                <span className="rounded-md border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-[10px] tracking-wider text-emerald-200">
                  {flowStages[active]?.status}
                </span>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs text-white/75">
                {flowStages[active]?.code}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
