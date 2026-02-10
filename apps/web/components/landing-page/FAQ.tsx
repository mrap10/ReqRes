"use client";

import { ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const faqs = [
  {
    question: "What is ReqRes?",
    answer:
      "ReqRes is a challenge platform for Express.js where you solve realistic backend API tasks and validate behavior with tests.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes, that's the best part! You can access all the challenges and features for free during the beta period.",
  },
  {
    question: "Are problems grouped by difficulty?",
    answer:
      "Yes. You get easy, medium, and hard tracks so you can progress from route basics to production edge-case handling.",
  },
  {
    question: "Do I need local setup to start solving?",
    answer:
      "No setup needed. You can code in-browser, run validators, and inspect request/response logs immediately.",
  },
  {
    question: "Is this platform in beta right now?",
    answer:
      "Yes, ReqRes is currently in beta, which means new challenge packs and scoring improvements are rolling out continuously.",
  },
  {
    question: "Can I compete on a leaderboard?",
    answer:
      "Yes. Track streaks, completion speed, and correctness against other developers in the leaderboard section.",
  },
  {
    question: "How do I get started?",
    answer:
      "Simply sign up for an account, choose a challenge pack, and start coding in the browser. No local setup required!",
  },
  {
    question: "What technologies are covered in the challenges?",
    answer:
      "The challenges focus on Express.js and related backend technologies, but we also include tasks that require knowledge of databases, authentication, and API design.",
  },
  {
    question: "Can I contribute challenges?",
    answer:
      "Absolutely! We welcome contributions from the community. If you have a challenge idea or want to help out, check out our open-source GitHub repository for guidelines on how to contribute. Also if you have feedback or suggestions for improvement, please don't hesitate to reach out to us through our contact page. We're always looking for ways to make ReqRes better for everyone!",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(1);
  return (
    <div className="mx-auto mt-24 w-full max-w-6xl px-4 pb-14">
      <div>
        <div className="grid gap-10 md:grid-cols-2 ">
          <div>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/58">
              Need more detail about the beta, challenge format, or roadmap? Start here.
            </p>
          </div>
          <div className="divide-y divide-white/10">
            {faqs.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.question}
                  className={`py-4 px-3 rounded-md ${isOpen ? "bg-white/5" : ""}`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center cursor-pointer justify-between gap-3 text-left"
                  >
                    <span
                      className={`text-base font-medium ${isOpen ? "text-white" : "text-white/60 hover:text-white"}`}
                    >
                      {item.question}
                    </span>
                    <span className="text-white/60">
                      {isOpen ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronUp className="rotate-180 size-4" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 pr-7 text-sm leading-6 text-white/60">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
