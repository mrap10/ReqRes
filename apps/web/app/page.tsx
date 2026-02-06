import Navbar from "../components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      <Navbar />
      <Hero />
    </div>
  );
}
