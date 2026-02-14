"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "motion/react";
import {
  ProfileCard,
  ActivityGrid,
  QuickStats,
  ProfileActions,
  AvatarPicker,
  DeleteAccountDialog,
} from "@/components/profile/";
import { useAuth } from "@/lib/providers/AuthProvider";
import { useSession } from "@/lib/auth-client";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface UserStats {
  rank: number | null;
  totalSolved: number;
  byDifficulty: { easy: number; medium: number; hard: number };
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { refetch } = useSession();
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0 });

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/stats`, {
        credentials: "include",
      });
      if (res.ok) setStats(await res.json());
    } catch {
      // silently fail
    }
  }, []);

  const fetchStreak = useCallback(async () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch(`${API_BASE_URL}/user/streak?timezone=${encodeURIComponent(tz)}`, {
        credentials: "include",
      });
      if (res.ok) setStreak(await res.json());
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchStreak();
    }
  }, [user, fetchStats, fetchStreak]);

  const handleUserUpdated = () => {
    refetch();
  };

  const handleAvatarSaved = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-x-clip">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="size-8 animate-spin text-white/50" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-2xl border border-white/15 bg-[#090910] p-4 sm:p-6"
        >
          <h3 className="text-2xl font-semibold mb-5">Account Overview</h3>
          <ProfileCard
            user={user}
            streak={streak}
            onAvatarClick={() => setAvatarPickerOpen(true)}
            onUserUpdated={handleUserUpdated}
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <ActivityGrid />
            <QuickStats stats={stats} />
          </div>
          <ProfileActions onDeleteAccount={() => setDeleteDialogOpen(true)} />
        </motion.div>
      </main>

      <Footer />

      <AvatarPicker
        isOpen={avatarPickerOpen}
        currentAvatar={user.image}
        onClose={() => setAvatarPickerOpen(false)}
        onSave={handleAvatarSaved}
      />
      <DeleteAccountDialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} />
    </div>
  );
}
