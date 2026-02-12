"use client";

import { motion } from "motion/react";
import type { ComponentType } from "react";
import { Mail, Bug, Lightbulb, ExternalLink } from "lucide-react";

type ActionCardProps = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  ctaLabel: string;
  href: string;
  external?: boolean;
  tone: "indigo" | "rose" | "cyan";
  delay: number;
};

const toneStyles: Record<ActionCardProps["tone"], string> = {
  indigo: "hover:border-indigo-300/35 hover:shadow-[0_0_24px_-10px_rgba(124,131,255,0.6)]",
  rose: "hover:border-rose-300/35 hover:shadow-[0_0_24px_-10px_rgba(251,113,133,0.55)]",
  cyan: "hover:border-cyan-300/35 hover:shadow-[0_0_24px_-10px_rgba(76,215,246,0.5)]",
};

function ActionCard({
  title,
  description,
  icon: Icon,
  ctaLabel,
  href,
  external,
  tone,
  delay,
}: ActionCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay }}
      className={`group rounded-2xl border border-white/10 bg-[#0b0b10] p-5 transition-all duration-300 ${toneStyles[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/5">
          <Icon className="h-4.5 w-4.5 text-white/75" />
        </div>
        {external && <ExternalLink className="h-4 w-4 text-white/40" />}
      </div>

      <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/62">{description}</p>

      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="mt-5 inline-flex items-center rounded-xl border border-white/12 bg-white/4 px-3 py-2 text-xs font-medium text-white/85 transition hover:border-white/25 hover:bg-white/7 hover:text-white"
      >
        {ctaLabel}
      </a>
    </motion.article>
  );
}

export default function FeedbackActions() {
  return (
    <div className="mx-auto mt-8 w-full max-w-6xl px-4">
      <div className="mb-5">
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Pick the fastest route for your message.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          title="General feedback"
          description="Share product feedback, UX notes, and overall suggestions directly with our team."
          icon={Mail}
          ctaLabel="Email: hello@reqres.online"
          href="mailto:hello@reqres.online?subject=ReqRes%20General%20Feedback"
          tone="indigo"
          delay={0.05}
        />
        <ActionCard
          title="Report a bug"
          description="Found a broken flow or incorrect behavior? Open an issue in the GitHub issue tab."
          icon={Bug}
          ctaLabel="Open GitHub Issues"
          href="https://github.com/mrap10/reqres/issues"
          external
          tone="rose"
          delay={0.12}
        />
        <ActionCard
          title="Feature requests"
          description="Have an idea for a new feature or improvement?"
          icon={Lightbulb}
          ctaLabel="Join the discussion"
          href="https://github.com/mrap10/ReqRes/discussions"
          external
          tone="cyan"
          delay={0.18}
        />
      </div>
    </div>
  );
}
