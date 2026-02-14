"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const AVATARS = [
  { src: "/avatar1.svg", label: "Avatar 1" },
  { src: "/avatar2.svg", label: "Avatar 2" },
  { src: "/avatar3.svg", label: "Avatar 3" },
  { src: "/avatar4.svg", label: "Avatar 4" },
  { src: "/avatar5.svg", label: "Avatar 5" },
  { src: "/avatar6.svg", label: "Avatar 6" },
];

interface AvatarPickerProps {
  isOpen: boolean;
  currentAvatar: string | null | undefined;
  onClose: () => void;
  onSave: (newAvatar: string) => void;
}

export default function AvatarPicker({
  isOpen,
  currentAvatar,
  onClose,
  onSave,
}: AvatarPickerProps) {
  const [selected, setSelected] = useState<string>(currentAvatar || "/avatar1.svg");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/avatar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ avatar: selected }),
      });
      if (res.ok) {
        onSave(selected);
        onClose();
      }
    } catch {
      // silently fail
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0d0d13] p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white">Choose your avatar</h3>
            <p className="mt-1 text-sm text-white/65">Select one of the available avatars.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AVATARS.map((avatar) => {
                const isCurrent = currentAvatar === avatar.src;
                const isSelected = selected === avatar.src;
                return (
                  <button
                    key={avatar.src}
                    type="button"
                    onClick={() => setSelected(avatar.src)}
                    className={`rounded-2xl border p-2 transition ${
                      isSelected
                        ? "border-cyan-200/70 bg-cyan-300/10"
                        : "border-white/15 bg-white/5 hover:border-white/35"
                    }`}
                  >
                    <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-white/25">
                      <Image
                        src={avatar.src}
                        alt={avatar.label}
                        fill
                        className="object-cover mt-2"
                        sizes="80px"
                      />
                    </div>
                    <p className="mt-2 text-xs text-white/80">{avatar.label}</p>
                    <p className="text-sm text-cyan-100/80">
                      {isCurrent && isSelected
                        ? "Current"
                        : isCurrent
                          ? "Current"
                          : isSelected
                            ? "Selected"
                            : "\u00A0"}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:border-white/35 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || selected === currentAvatar}
                className="rounded-xl border border-indigo-200/65 bg-brand-indigo px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin inline mr-1" /> : null}
                Save avatar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
