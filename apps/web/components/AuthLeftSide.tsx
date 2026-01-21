import { CodeXml, Cpu } from "lucide-react";

export default function AuthLeftSide() {
  return (
    <div className="hidden relative lg:w-1/2 lg:flex flex-col items-center justify-center border-r border-white/5">
      <div className="absolute inset-0 opacity-20 overflow-hidden">
        <svg viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="2.0"
              numOctaves="1"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="96%" filter="url(#noiseFilter)" />
        </svg>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-zinc-950/80"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px]"></div>

      <div className="relative z-10 w-full max-w-lg space-y-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-xs font-mono text-indigo-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <p>Join 100+ Developers</p>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Master the art of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Backend Engineering.
            </span>
          </h1>

          <p className="text-zinc-400 leading-relaxed">
            ReqRes provides the sandbox you need to break, fix an optimize Express.js applications.
            No setup required.
          </p>
        </div>
        <div>terminal box</div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg">
              <CodeXml className="w-4 h-4 text-indigo-400" />
            </div>
            <p>Real World Scenarios</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-lg">
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <p>Instant feedback</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 text-xs text-center text-zinc-400 font-mono">
        &copy; {new Date().getFullYear()} ReqRes
      </div>
    </div>
  );
}
