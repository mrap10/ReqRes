import { ChevronDown, Clock, Filter } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

export default function LeaderboardPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="mb-6 flex flex-row justify-between items-center gap-6">
          <div className="max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Global <span className="text-indigo-400">Standings</span>
            </h1>
            <p className="text-zinc-400 mb-4">
              Compare your architectural skills with top backend engineers.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 h-auto lg:h-[500px] mb-6">
          <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl">
            {/* Leaderboard Table Placeholder */}
            here the leaderboard table will go
          </div>

          <div className="flex flex-col gap-6">here the pie chart stats will go</div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Submission History
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                Detailed performance metrics for your solved problems.
              </p>
            </div>

            {/* will add functionality later */}
            <button className="flex items-center gap-2 text-xs font-medium cursor-pointer text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors">
              <Filter className="w-3 h-3" /> Filter <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-950/50 text-sm font-mono text-zinc-400 tracking-wider">
                <tr>
                  <th className="p-5 font-medium">Problems</th>
                  <th className="p-5 font-medium">Category</th>
                  <th className="p-5 font-medium">Solved</th>
                  <th className="p-5 font-medium">Runtime</th>
                  <th className="p-5 font-medium">XP Gained</th>
                </tr>
              </thead>
              <tbody>
                <tr></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
