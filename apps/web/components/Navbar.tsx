"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { X, Menu } from "lucide-react";
import { useAuth } from "@/lib/providers/AuthProvider";
import { signOut } from "@/lib/auth-client";

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
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const handleLogout = async () => {
    await signOut();
    router.push("/signin");
  };

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
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className=" font-medium text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/signin"
                className=" font-medium text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Sign In
              </Link>
            )}
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
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 flex items-center justify-center text-[10px] font-semibold text-white"
              >
                {user?.username?.charAt(0).toUpperCase()}
              </div>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-2 z-10">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/signin"
              className="font-medium text-zinc-400 hover:text-cyan-400 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
