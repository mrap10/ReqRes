import { signOut } from "@/lib/auth-client";
import { LogOut, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileActionsProps {
  onDeleteAccount: () => void;
}

export default function ProfileActions({ onDeleteAccount }: ProfileActionsProps) {
  const router = useRouter();
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
    <div className="mt-6 rounded-3xl border border-white/15 bg-[#0e0e15] p-5 sm:p-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 p-3">
          <p className="text-sm text-white/70">Log out of your account</p>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-400 bg-brand-indigo px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 p-3">
          <p className="text-sm text-white/70">
            Need to leave? You can permanently delete this account.
          </p>
          <button
            type="button"
            onClick={onDeleteAccount}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-red-400 bg-red-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
