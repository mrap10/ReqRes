"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Search, Sparkles } from "lucide-react";
import Navbar from "../../components/Navbar";
import ProblemCard from "../../components/ProblemCard";
import Filters from "../../components/Filters";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";
import { getProblems } from "../../actions";
import { ProblemListDTO } from "@reqres/types";
import { useAuth } from "@/lib/providers/AuthProvider";

export default function ProblemPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredProblems, setFilteredProblems] = useState<ProblemListDTO[]>([]);
  const [problems, setProblems] = useState<ProblemListDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchProblems() {
      setIsLoading(true);
      const data = await getProblems();
      setProblems(data);
      setIsLoading(false);
    }
    fetchProblems();
  }, []);

  useEffect(() => {
    let result = problems;

    if (activeFilter !== "all") {
      result = result.filter(
        (problem) =>
          problem.track === activeFilter || (problem.tags && problem.tags.includes(activeFilter))
      );
    }

    if (searchQuery) {
      result = result.filter(
        (problem) =>
          problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          problem.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          problem.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredProblems(result);
  }, [searchQuery, activeFilter, problems]);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_-20%,rgba(124,131,255,0.22),transparent_45%),radial-gradient(circle_at_88%_-30%,rgba(76,215,246,0.14),transparent_42%)]" />
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d13] p-6 sm:p-8"
        >
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-end">
            <div>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white">
                Build your backend instincts with expressive, practical API tasks.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                Filter by difficulty, focus area, and category to discover scenarios that match
                exactly what you want to practice today.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
              <p className="mb-3 text-sm tracking-wider text-white/45">Library Overview</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-white/10 bg-white/4 px-2 py-3">
                  <p className="text-xl font-semibold text-emerald-300">5</p>
                  <p className="mt-1 text-[12px] tracking-wider text-white/50">Easy</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/4 px-2 py-3">
                  <p className="text-xl font-semibold text-amber-300">5</p>
                  <p className="mt-1 text-[12px] tracking-wider text-white/50">Medium</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/4 px-2 py-3">
                  <p className="text-xl font-semibold text-rose-300">5</p>
                  <p className="mt-1 text-[12px] tracking-wider text-white/50">Hard</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0c0c11]/85 p-4 sm:p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <input
                type="text"
                placeholder="Search problems, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/35 py-2.5 pl-9 pr-3 text-sm text-white/85 placeholder:text-white/35 outline-none transition focus:border-indigo-300/35"
              />
            </div>
          </div>

          <Filters currentFilter={activeFilter} setFilter={setActiveFilter} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="wait" initial={false}>
            {isAuthenticated ? (
              <motion.div
                key="signed-in-stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid gap-3 sm:grid-cols-3 md:col-span-2"
              >
                <div className="rounded-xl border border-white/10 bg-[#0b0b10] p-4">
                  <p className="text-xl font-semibold text-white">4</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/48">
                    Solved This Week
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b10] p-4">
                  <p className="text-xl font-semibold text-indigo-100">12</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/48">
                    Current Streak
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b10] p-4">
                  <p className="text-xl font-semibold text-cyan-100">Top 5%</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/48">
                    Rank Snapshot
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="public-nudge"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-white/10 bg-[#0b0b10] p-5 md:col-span-2"
              >
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  <Sparkles className="inline-flex mr-2 h-3.5 w-3.5 text-cyan-200" />
                  Sign in to unlock progress tracking, streaks, and more.
                </h2>
                <div className="mt-4 inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/3 px-3 py-1.5 text-xs text-white/72">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                  You can still preview every challenge as a guest.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-zinc-400">Loading problems...</p>
            </div>
          ) : filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => <ProblemCard key={problem.id} problem={problem} />)
          ) : (
            <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-zinc-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No problems found</h3>
              <p className="text-zinc-500">Try adjusting your search or filters.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
