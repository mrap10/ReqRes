"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/providers/AuthProvider";

export default function ProblemHeader() {
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
            <Link href="/" className="cursor-pointer">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Req<span className="text-indigo-400">Res</span>
              </h1>
            </Link>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="font-mono italic text-white/70 text-[8px] rounded-full bg-zinc-800 px-1 font-semibold py-0.5">
          i
        </div>
        <p className="text-[11px] text-white/50">
          Some submissions may take upto 1 minute to show the test results as they might contain
          hidden test cases up to 100.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="items-center gap-1 text-xs text-zinc-400 mr-4 font-mono hidden md:flex">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Server Ready
        </div>
        {isAuthenticated ? (
          <Link href="/profile" className="flex items-center gap-2">
            <button
              aria-label="Account"
              className="w-9 h-9 rounded-full border border-white/15 bg-white/5 text-shadow-xs text-white/80 transition hover:border-indigo-300/40 hover:text-white cursor-pointer"
            >
              {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </button>
          </Link>
        ) : (
          <h1 className="hover:text-indigo-400 cursor-pointer">Sign In</h1>
        )}
      </div>
    </div>
  );
}
