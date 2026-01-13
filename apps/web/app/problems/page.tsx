import Navbar from "../../components/Navbar";

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
      </main>
    </div>
  );
}
