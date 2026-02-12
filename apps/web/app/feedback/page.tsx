import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { FeedbackHero, FeedbackActions, FeedbackDetails } from "@/components/feedback-page";

export default function FeedbackPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Navbar />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(55%_70%_at_50%_0%,rgba(124,131,255,0.22),transparent)]" />
      <main>
        <FeedbackHero />
        <FeedbackActions />
        <FeedbackDetails />
      </main>
      <Footer />
    </div>
  );
}
