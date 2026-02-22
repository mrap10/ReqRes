"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isConfirmed = confirmation === "DELETE";

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/user/account`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data.error || "Failed to delete account.";
        setError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Account deleted. Goodbye! ☹️");
      await signOut({
        fetchOptions: {
          onSuccess: () => router.push("/"),
        },
      });
    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmation("");
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0d0d13] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-7 w-7 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-white">Delete account</h3>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  This action is permanent and cannot be undone. Type &quot;DELETE&quot; to confirm.
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Type DELETE"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              className="mt-4 w-full rounded-xl border border-white/15 bg-black/45 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-500"
            />
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-white/15 px-3 py-2 text-sm text-white/85 transition cursor-pointer hover:border-white/35 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isConfirmed || isDeleting}
                className="rounded-xl border border-red-400 bg-red-500 px-3 py-2 text-sm font-semibold text-white transform hover:bg-red-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isDeleting ? <Loader2 className="size-4 animate-spin inline mr-1" /> : null}
                Confirm deletion
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
