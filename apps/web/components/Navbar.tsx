"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { X, Menu, Loader2 } from "lucide-react";
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
  const { user, isAuthenticated, isLoading } = useAuth();
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
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin");
        },
      },
    });
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
          <Link href="/" className="cursor-pointer">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Req<span className="text-indigo-400">Res</span>
            </h1>
          </Link>

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

          <div className="hidden md:block">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-8 h-8 rounded-full cursor-pointer bg-linear-to-tr from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 flex items-center justify-center text-sm font-semibold text-white transition-all"
                >
                  {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-2 z-10">
                    <div className="px-4 py-2 border-b border-zinc-800">
                      <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                      <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm cursor-pointer text-zinc-300 hover:bg-zinc-800 hover:text-rose-400 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/signin"
                className="font-medium text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
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
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
          ) : isAuthenticated ? (
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-sm font-semibold text-white">
                  {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-zinc-400">{user?.email}</p>
                </div>
              </div>
              <Link href="/profile" className="text-zinc-400 hover:text-cyan-400 text-sm">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-left text-zinc-400 hover:text-rose-400 text-sm"
              >
                Sign Out
              </button>
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
