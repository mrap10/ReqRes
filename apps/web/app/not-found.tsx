"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ErrorTerminal from "@/components/ErrorTerminal";

export default function NotFoundPage() {
  const router = useRouter();
  const [timestamp, setTimestamp] = useState<string>("");
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    setTimestamp(new Date().toLocaleTimeString());
  }, []);

  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  function handleMouse(event: React.MouseEvent) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  return (
    <div
      className="bg-black min-h-screen text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-rose-200 overflow-hidden relative flex flex-col"
      onMouseMove={handleMouse}
    >
      <nav className="fixed top-0 w-full z-50 bg-transparent pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={"/"} className="text-xl font-bold text-white tracking-tight">
            Req<span className="text-zinc-500">Res</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="relative mb-8 perspective-midrange">
          <motion.h1
            style={{ rotateX, rotateY, z: 100 }}
            className="text-[12rem] md:text-[16rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-zinc-200 to-zinc-800 select-none relative z-10"
          >
            404
          </motion.h1>
          <motion.h1
            animate={{ x: [-2, 2, -1, 0], opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.2, repeatType: "mirror" }}
            className="absolute top-0 left-0 text-[12rem] md:text-[16rem] font-bold leading-none tracking-tighter text-rose-500/30 mix-blend-screen z-0 blur-[2px]"
          >
            404
          </motion.h1>
          <motion.h1
            animate={{ x: [2, -2, 1, 0], opacity: [0.5, 0.2, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.3, repeatType: "mirror" }}
            className="absolute top-0 left-0 text-[12rem] md:text-[16rem] font-bold leading-none tracking-tighter text-cyan-500/30 mix-blend-screen z-0 blur-[2px]"
          >
            404
          </motion.h1>
        </div>

        <div className="text-center max-w-lg mb-8 -mt-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            This route is <span className="text-rose-500">undefined</span>.
          </h2>
          <p className="text-zinc-400 ">
            It seems you&apos;ve ventured into the void. This endpoint hasn&apos;t been exported in
            our router yet.
          </p>
        </div>

        <div className="mb-5 w-full flex justify-center">
          <ErrorTerminal />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/"
              className="px-8 py-3 bg-white text-black font-bold rounded-full flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.6)] transition-shadow"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-zinc-900 text-white font-bold rounded-full cursor-pointer border border-zinc-800 hover:bg-zinc-800 transition-colors flex items-center gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </motion.button>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-zinc-600 text-xs font-mono relative z-10">
        Error ID: 0x404_VOID // Timestamp: {timestamp}
      </footer>
    </div>
  );
}
