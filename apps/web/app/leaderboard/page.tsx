import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import LeaderboardPiechart from "@/components/LeaderboardPiechart";
import LeaderboardTable from "@/components/LeaderboardTable";
import SubmissionHistory from "@/components/SubmissionHistory";

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

        <div className="grid lg:grid-cols-3 gap-8 h-auto mb-6">
          <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-xl">
            <LeaderboardTable />
          </div>

          <div className="flex flex-col gap-6">
            <LeaderboardPiechart />
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <SubmissionHistory />
        </div>
      </main>
      <Footer />
    </div>
  );
}
