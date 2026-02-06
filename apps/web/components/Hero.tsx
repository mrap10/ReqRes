import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-125 h-125 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-cyan-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            v1.0 Public Beta Live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Prove your <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400">
              Backend Logic.{" "}
            </span>
          </h1>
          <p className="text text-zinc-400 mb-8 max-w-lg leading-relaxed">
            Stop building todo-lists. Solve real-world architectural challenges using Express.js.
            Fix broken endpoints, optimize middleware, and secure APIs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 group shadow-[0_4px_20px_-5px_rgba(99,102,241,0.4)]">
              Start Challenge
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium border border-zinc-800 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2">
              <Play className="w-4 h-4 text-zinc-500" />
              Watch Demo
            </button>
          </div>
          <div className="mt-5 mx-2 flex items-center gap-4 text-sm text-zinc-500 font-mono">
            <p>Joined by 100+ devs</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-cyan-600 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div>window controls</div>
            <div>code area</div>
            <div>terminal area</div>
          </div>
        </div>
      </div>
    </div>
  );
}
