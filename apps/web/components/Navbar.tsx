"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { X, Menu, Loader2, Star } from "lucide-react";
import { useAuth } from "@/lib/providers/AuthProvider";
import { signOut } from "@/lib/auth-client";
import { AnimatePresence, motion } from "motion/react";

const navItems = [
  { href: "/problems", label: "Problems" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/feedback", label: "Feedback" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

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
    <header className="sticky top-0 z-50">
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/55 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_-20%,rgba(124,131,255,0.25),transparent_45%),radial-gradient(circle_at_92%_-30%,rgba(76,215,246,0.16),transparent_42%)]" />
          <nav className="relative flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="cursor-pointer">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Req<span className="text-indigo-400">Res</span>
              </h1>
            </Link>

            <div className="hidden md:flex gap-7 items-center text-white/65 text-sm">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "transition-colors",
                      isActive ? "text-white cursor-default" : "hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="https://github.com/mrap10/reqres"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-all hover:border-indigo-300/35 hover:text-white"
              >
                <Star className="w-4 h-4" />
                Star
              </Link>
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
              ) : isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    aria-label="Account"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-9 h-9 rounded-full border border-white/15 bg-white/5 text-shadow-xs text-white/80 transition hover:border-indigo-300/40 hover:text-white cursor-pointer"
                  >
                    {user?.username?.charAt(0).toUpperCase() ||
                      user?.email?.charAt(0).toUpperCase()}
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
                  className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/90 transition hover:border-cyan-300/40 hover:text-white"
                >
                  Sign In
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle menu"
              className="rounded-lg cursor-pointer border border-white/10 p-2 text-white/80 transition hover:text-white md:hidden"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </nav>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden border-t border-white/10 md:hidden"
              >
                <div className="space-y-4 px-4 py-4 text-sm">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={clsx(
                        "block transition-colors",
                        pathname === item.href
                          ? "text-white cursor-default"
                          : "text-white/75 hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      href="https://github.com/mrap10/reqres"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-all hover:border-indigo-300/35 hover:text-white"
                    >
                      <Star className="w-4 h-4" />
                      Star
                    </Link>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                    ) : isAuthenticated ? (
                      <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-sm font-semibold text-white">
                            {user?.username?.charAt(0).toUpperCase() ||
                              user?.email?.charAt(0).toUpperCase()}
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
                          className="text-left text-sm text-zinc-400 hover:text-rose-400 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <Link
                        href="/signin"
                        className="font-medium block rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/90 transition hover:border-cyan-300/40 hover:text-white "
                      >
                        Sign In
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
