export default function Home() {
  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      <div className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center z-10">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
              Prove your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Backend Logic.{" "}
              </span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8 max-w-lg leading-relaxed">
              Stop building todo-lists. Solve real-world architectural challenges using Express.js.
              Fix broken endpoints, optimize middleware, and secure APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
