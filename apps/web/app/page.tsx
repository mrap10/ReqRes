import Features from "@/components/Features";
import Navbar from "../components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}
