"use client";

import { ChevronLeft } from "lucide-react";
import DifficultyTag from "./DifficultyTag";
import Link from "next/link";
import { useAuth } from "@/lib/providers/AuthProvider";

export default function ProblemHeader({
  title,
  difficulty,
}: {
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}) {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <Link
          href="/problems"
          className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="h-6 w-px bg-zinc-800"></div>
        <div>
          <h1 className="text-sm font-bold text-white flex items-center gap-3">
            {title}
            {difficulty && <DifficultyTag level={difficulty} />}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="items-center gap-1 text-xs text-zinc-400 mr-4 font-mono hidden md:flex">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Server Ready
        </div>
        {isAuthenticated ? (
          <Link href="/profile" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-linear-to-tr from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 flex items-center justify-center text-[10px] font-semibold text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </Link>
        ) : (
          <h1 className="hover:text-indigo-400 cursor-pointer">Sign In</h1>
        )}
      </div>
    </div>
  );
}
