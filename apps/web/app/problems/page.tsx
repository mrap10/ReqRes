"use client";

import { Search } from "lucide-react";
import Navbar from "../../components/Navbar";
import ProblemCard from "../../components/ProblemCard";
import Filters from "../../components/Filters";
import Footer from "../../components/Footer";

export default function ProblemPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="mb-12 flex flex-col lg:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Practice <span className="text-indigo-400">Problems</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Sharpen your backend skills with real-world Express.js scenarios. From basic routing
              to advanced security implementation.
            </p>
          </div>
          <div className=" flex flex-row lg:flex-col lg:w-auto w-full justify-between gap-3 text-zinc-400 text-sm bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <p className="text-sm text-zinc-400 font-mono tracking-wider">
              Solved: <span className="text-xl font-bold text-zinc-200">0</span>
            </p>
            <p className="text-sm text-zinc-400 font-mono tracking-wider">
              Streak: <span className="text-xl font-bold text-zinc-200">0 Days</span>
            </p>
            <p className="text-sm text-zinc-400 font-mono tracking-wider">
              Rank: <span className="text-xl font-bold text-zinc-200">Top 0%</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="size-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search problems, tags..."
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-800 rounded-xl leading-5 sm:text-sm bg-zinc-900 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

          <Filters currentFilter={"all"} setFilter={() => {}} />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProblemCard />
          <ProblemCard />
          <ProblemCard />
          <ProblemCard />
          <ProblemCard />
          <ProblemCard />
          <ProblemCard />
          <ProblemCard />
          <ProblemCard />
          <ProblemCard />
        </div>
      </main>

      <Footer />
    </div>
  );
}
