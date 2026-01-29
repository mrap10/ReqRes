"use client";

import clsx from "clsx";
import { LayoutDashboard, LogOut, Settings, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/rate-limit", label: "Rate Limit", icon: ShieldAlert },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  // const router = useRouter();

  const handleLogout = () => {
    // keeping this route open for now, will add auth and complications later after adding auth API endpoints
    alert("Logged out!");
  };

  return (
    <div>
      <div className="w-16 lg:w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col fixed h-full z-10 transition-all">
        <div className="h-16 flex items-center justify-center lg:justify-start cursor-pointer lg:px-6 border-b border-zinc-900">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Req<span className="text-indigo-400">Res</span>{" "}
            <span className="text-indigo-400 text-xs px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              Admin
            </span>
          </h1>
        </div>

        <div className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-white bg-zinc-900/50 border border-zinc-800"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                )}
              >
                <item.icon
                  className={clsx("w-5 h-5", isActive ? "text-indigo-400" : "text-zinc-400")}
                />
                <span className="hidden lg:block text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-zinc-900 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-red-400 cursor-pointer transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
