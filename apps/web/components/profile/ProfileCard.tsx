"use client";

import { Check, Loader2, Pencil } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const AVATAR_COLORS = [
  "from-indigo-500 to-cyan-400",
  "from-violet-500 to-indigo-400",
  "from-cyan-500 to-teal-400",
  "from-blue-500 to-indigo-400",
  "from-purple-500 to-pink-400",
  "from-teal-500 to-emerald-400",
];

function avatarColor(username: string) {
  const index = username.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

interface ProfileCardProps {
  user: {
    name?: string | null;
    username: string;
    email: string;
    image?: string | null;
  };
  streak: { currentStreak: number; longestStreak: number };
  onAvatarClick: () => void;
  onUserUpdated: () => void;
}

export default function ProfileCard({
  user,
  streak,
  onAvatarClick,
  onUserUpdated,
}: ProfileCardProps) {
  const hasExistingName = Boolean(user.name);
  const [name, setName] = useState(user.name || "");
  const [isEditing, setIsEditing] = useState(!hasExistingName);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [savedName, setSavedName] = useState<string | null>(null);

  const handleSaveName = async () => {
    if (!name.trim() || name.trim() === user.name) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/name`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        setSavedName(name.trim());
        setHasSaved(true);
        setIsEditing(false);
        onUserUpdated();
      }
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = savedName ?? user.name;

  return (
    <div className="rounded-3xl border border-white/15 bg-[#0e0e15] p-5 sm:p-6">
      <div className="flex flex-col md:flex-row justify-around md:items-start items-center gap-5">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={onAvatarClick}
            className="group relative h-36 w-36 overflow-hidden rounded-full border-2 cursor-pointer border-white/65 bg-white/5 transition hover:border-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/75"
          >
            {user.image ? (
              <Image
                src={user.image}
                alt="User avatar"
                fill
                className="mt-2 object-cover transition duration-200 group-hover:scale-105"
                sizes="144px"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-linear-to-br ${avatarColor(user.username)} transition duration-200 group-hover:scale-105`}
              >
                <span className="text-5xl font-bold text-white/90">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </button>
          <p className="mt-3 text-xs text-white/65">Tap avatar to change</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm tracking-wider text-white/50">Name</p>
            {!isEditing ? (
              <div className="flex items-center gap-2 mt-2">
                <p className="text-lg text-white">{displayName}</p>
                {!hasSaved && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 cursor-pointer rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/70 transition hover:border-white/30 hover:bg-white/10"
                  >
                    <Pencil className="size-3" />
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap mt-2">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-w-0 flex-1 rounded-l-xl border border-white/20 bg-black/45 px-3 py-2.5 text-sm text-white outline-none transition focus:border-(--brand-cyan)/85"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={isSaving || !name.trim() || name.trim() === user.name}
                  className="inline-flex items-center cursor-pointer gap-1 rounded-r-xl border border-indigo-200/55 bg-indigo-300/25 px-3 py-2.5 text-sm font-medium text-indigo-50 transition hover:border-indigo-100/80 hover:bg-indigo-300/35 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm tracking-wider text-white/50">Username</p>
              <p className="mt-1 text-lg text-white">@{user.username}</p>
            </div>
            <div>
              <p className="text-sm tracking-wider text-white/50">Email</p>
              <p className="mt-1 text-lg text-white">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl w-full md:w-auto md:place-self-center place-items-center border border-white/20 bg-black/40 p-4">
          <p className="text-sm font-medium text-white">Current Streak: {streak.currentStreak}</p>
          <p className="mt-2 text-sm font-medium text-white">
            Longest Streak: {streak.longestStreak}
          </p>
        </div>
      </div>
    </div>
  );
}
