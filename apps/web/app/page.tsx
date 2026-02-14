import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import { Hero, Features, HowItWorks, CTA, FAQ } from "@/components/landing-page";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

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
        <FAQ />
      </main>
      <Footer />
      <div className="-mt-17 h-90 hidden lg:flex flex-col items-center justify-center bg-zinc-950">
        <TextHoverEffect text="ReqRes" />
      </div>
    </div>
  );
}
