export default function QuickStats() {
  return (
    <div className="rounded-3xl border border-white/14 bg-[#0e0e15] p-5 sm:p-6">
      <p className="text-sm tracking-wider text-white/50">Quick Stats</p>
      <div className="mt-4 space-y-3">
        <div className="rounded-xl border border-white/15 bg-black/35 p-3">
          <p className="text-sm text-white/50">Rank</p>
          <p className="mt-1 text-xl font-semibold text-white"># 1</p>
        </div>

        <div className="rounded-xl border border-white/15 bg-black/35 p-3">
          <p className="text-sm text-white/50">Problems solved</p>
          <p className="mt-1 text-xl font-semibold text-cyan-100">14</p>
        </div>

        <div className="rounded-xl border border-white/15 bg-black/35 p-3">
          <p className="text-sm text-white/50">By difficulty</p>
          <ul className="mt-2 space-y-1.5 text-sm text-white/90">
            <div>
              <li className="flex items-center justify-between gap-3">
                <span>Easy</span>
                <span className="font-semibold text-cyan-100">5</span>
              </li>
            </div>
            <div>
              <li className="flex items-center justify-between gap-3">
                <span>Medium</span>
                <span className="font-semibold text-cyan-100">5</span>
              </li>
            </div>
            <div>
              <li className="flex items-center justify-between gap-3">
                <span>Hard</span>
                <span className="font-semibold text-cyan-100">4</span>
              </li>
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
}
