"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Search, Sparkles } from "lucide-react";
import Navbar from "../../components/Navbar";
import { ProblemCard, Filters } from "@/components/problems-page-components";
import Footer from "../../components/Footer";
import { useEffect, useMemo, useState } from "react";
import { getProblems } from "../../actions";
import { ProblemListDTO } from "@reqres/types";
import { useAuth } from "@/lib/providers/AuthProvider";

let problemsCache: ProblemListDTO[] | null = null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface UserStats {
  rank: number | null;
  totalSolved: number;
  byDifficulty: { easy: number; medium: number; hard: number };
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

export default function ProblemPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDifficulty, setActiveDifficulty] = useState("all");
  const [filteredProblems, setFilteredProblems] = useState<ProblemListDTO[]>([]);
  const [problems, setProblems] = useState<ProblemListDTO[]>(problemsCache ?? []);
  const [isLoading, setIsLoading] = useState(!problemsCache);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (problemsCache) return;
    async function fetchProblems() {
      setIsLoading(true);
      const data = await getProblems();
      problemsCache = data;
      setProblems(data);
      setIsLoading(false);
    }
    fetchProblems();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchUserData() {
      try {
        const [statsRes, streakRes] = await Promise.all([
          fetch(`${API_BASE_URL}/user/stats`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/user/streak`, { credentials: "include" }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (streakRes.ok) {
          const streakData = await streakRes.json();
          setStreak(streakData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, [isAuthenticated]);

  const difficultyCounts = useMemo(
    () => ({
      easy: problems.filter((p) => p.difficulty === "EASY").length,
      medium: problems.filter((p) => p.difficulty === "MEDIUM").length,
      hard: problems.filter((p) => p.difficulty === "HARD").length,
    }),
    [problems]
  );

  useEffect(() => {
    let result = problems;

    if (activeCategory !== "all") {
      result = result.filter(
        (problem) =>
          problem.track === activeCategory ||
          (problem.tags && problem.tags.some((t) => t.toUpperCase() === activeCategory))
      );
    }

    if (activeDifficulty !== "all") {
      result = result.filter((problem) => problem.difficulty === activeDifficulty);
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
  }, [searchQuery, activeCategory, activeDifficulty, problems]);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="p-6 sm:p-8 relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c11]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_-20%,rgba(124,131,255,0.22),transparent_45%),radial-gradient(circle_at_88%_-30%,rgba(76,215,246,0.14),transparent_42%)]" />
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
                  <p className="text-xl font-semibold text-emerald-300">{difficultyCounts.easy}</p>
                  <p className="mt-1 text-[12px] tracking-wider text-white/50">Easy</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/4 px-2 py-3">
                  <p className="text-xl font-semibold text-amber-300">{difficultyCounts.medium}</p>
                  <p className="mt-1 text-[12px] tracking-wider text-white/50">Medium</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/4 px-2 py-3">
                  <p className="text-xl font-semibold text-rose-300">{difficultyCounts.hard}</p>
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

          <Filters
            activeCategory={activeCategory}
            activeDifficulty={activeDifficulty}
            setCategory={setActiveCategory}
            setDifficulty={setActiveDifficulty}
          />
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
                  <p className="text-xl font-semibold text-white">{stats?.totalSolved ?? 0}</p>
                  <p className="mt-1 text-sm tracking-wider text-white/48">Total Solved</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b10] p-4">
                  <p className="text-xl font-semibold text-indigo-100">
                    {streak?.currentStreak ?? 0}
                  </p>
                  <p className="mt-1 text-sm tracking-wider text-white/48">Current Streak</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b0b10] p-4">
                  <p className="text-xl font-semibold text-cyan-100">
                    {stats?.rank ? `#${stats.rank}` : "Unranked"}
                  </p>
                  <p className="mt-1 text-sm tracking-wider text-white/48">Global Rank</p>
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

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#0b0b10] p-2">
                <div className="animate-pulse rounded-xl border border-white/5 bg-zinc-900/40 p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="h-3 w-16 rounded bg-white/8" />
                      <div className="mt-3 h-5 w-3/4 rounded bg-white/10" />
                    </div>
                    <div className="h-6 w-16 rounded-md bg-white/8" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3.5 w-full rounded bg-white/6" />
                    <div className="h-3.5 w-5/6 rounded bg-white/6" />
                  </div>
                  <div className="mt-4 pt-4 flex gap-2 border-t border-white/10">
                    <div className="h-6 w-14 rounded-md bg-white/6" />
                    <div className="h-6 w-18 rounded-md bg-white/6" />
                    <div className="h-6 w-12 rounded-md bg-white/6" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredProblems.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredProblems.map((problem, index) => (
                <motion.div
                  key={problem.id}
                  layout
                  className="h-full"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, delay: index * 0.05 }}
                >
                  <ProblemCard key={problem.id} problem={problem} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="col-span-full h-80 place-content-center rounded-2xl border border-dashed border-white/18 bg-black/25 py-14 text-center"
              >
                <Search className="mx-auto h-5 w-5 text-white/45" />
                <h3 className="mt-4 text-lg font-medium text-white">
                  No matches with these filters
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  Try another category, or difficulty level.
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
