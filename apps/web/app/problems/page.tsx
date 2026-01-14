"use client";

import { Search } from "lucide-react";
import Navbar from "../../components/Navbar";
import ProblemCard from "../../components/ProblemCard";
import Filters from "../../components/Filters";
import Footer from "../../components/Footer";
import { useEffect, useState } from "react";
import { getProblems } from "../../actions";
import { ProblemListDTO } from "@reqres/types";

export default function ProblemPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredProblems, setFilteredProblems] = useState<ProblemListDTO[]>([]);
  const [problems, setProblems] = useState<ProblemListDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-zinc-800 rounded-xl leading-5 sm:text-sm bg-zinc-900 text-zinc-300 placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

          <Filters currentFilter={activeFilter} setFilter={setActiveFilter} />
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
