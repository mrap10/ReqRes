import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { LeaderboardContent } from "@/components/leaderboard-page";

export default function LeaderboardPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-14 pb-16">
        <LeaderboardContent />
      </main>
      <Footer />
    </div>
  );
}
