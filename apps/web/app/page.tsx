import Features from "@/components/Features";
import Navbar from "../components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background:
          "radial-gradient(circle at 20% 10%, rgb(124 131 255 / 10%), transparent 28%), radial-gradient(circle at 85% 8%, rgb(76 215 246 / 8%), transparent 26%), var(--background)",
      }}
    >
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
