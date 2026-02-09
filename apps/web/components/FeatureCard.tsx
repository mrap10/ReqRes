"use client";

import { CheckCircle2, Code2, Container, PlayCircle, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";

const icons = {
  Code2,
  PlayCircle,
  CheckCircle2,
  ShieldCheck,
  Container,
  Zap,
};

export type IconKey = keyof typeof icons;

interface FeatureCardProps {
  title: string;
  desc: string;
  index: number;
  icon: IconKey;
}

export default function FeatureCard({ title, desc, index, icon }: FeatureCardProps) {
  const Icon = icons[icon];

  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl hover:bg-linear-to-r from-zinc-900 via-transparent to-zinc-900 border border-white/10 bg-[#0c0c11] p-5"
    >
      <div className="relative">
        <div className="group-hover:hidden flex flex-col items-center">
          <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-zinc-300" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        </div>
        <div className="hidden group-hover:block mt-5">
          <p className="text-zinc-400 leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}
