"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { X, Menu } from "lucide-react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/problems", label: "Problems" },
  { href: "/resources", label: "Resources" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/feedback", label: "Feedback" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div
      className={clsx(
        "fixed top-0 left-0 py-2 w-full border-b shadow-sm z-50",
        scrolled
          ? "bg-zinc-950/90 backdrop-blur-md border-b border-white/5"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          <div className="cursor-pointer">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Req<span className="text-indigo-400">Res</span>
            </h1>
          </div>

          <div className="hidden md:flex gap-5 items-center text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "transition-colors",
                    isActive ? "text-white cursor-default" : "text-zinc-400 hover:text-cyan-400"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div>
            <Link
              href="/signin"
              className=" font-medium text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Sign In
            </Link>
          </div>

          <button className="md:hidden flex flex-col gap-1.5" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden absolute w-full bg-zinc-900 border-b border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl">
          <Link href="/" className="text-zinc-400 hover:text-cyan-400">
            Home
          </Link>
          <Link href="/problems" className="text-zinc-400 hover:text-cyan-400">
            Problems
          </Link>
          <Link href="/resources" className="text-zinc-400 hover:text-cyan-400">
            Resources
          </Link>
          <Link href="/leaderboard" className="text-zinc-400 hover:text-cyan-400">
            Leaderboard
          </Link>
          <Link href="/feedback" className="text-zinc-400 hover:text-cyan-400">
            Feedback
          </Link>
        </div>
      )}
    </div>
  );
}
