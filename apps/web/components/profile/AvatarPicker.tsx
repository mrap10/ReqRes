"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";

export default function AvatarPicker({ isOpen }: { isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
        >
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0d0d13] p-5 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-white">Choose your avatar</h3>
            <p className="mt-1 text-sm text-white/65">Select one of the available avatars.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <button
                type="button"
                className="rounded-2xl border p-2 transition border-white/15 bg-white/5 hover:border-white/35"
              >
                <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-white/25">
                  <Image
                    src="avatar2.svg"
                    alt="Avatar"
                    fill
                    className="object-cover mt-2"
                    sizes="80px"
                  />
                </div>
                <p className="mt-2 text-xs text-white/80">Avatar label</p>
                <p className="text-sm text-cyan-100/80">Current || Selected || </p>
              </button>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/85 transition hover:border-white/35 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl border border-indigo-200/65 bg-brand-indigo px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 cursor-pointer"
              >
                Save avatar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
