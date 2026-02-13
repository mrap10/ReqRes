import { KeyRound, Trash2 } from "lucide-react";

export default function ProfileActions() {
  return (
    <div className="mt-6 rounded-3xl border border-white/15 bg-[#0e0e15] p-5 sm:p-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 p-3">
          <p className="text-sm text-white/70">Protect your account with a password update.</p>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-400 bg-brand-indigo px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 cursor-pointer"
          >
            <KeyRound className="h-4 w-4" />
            Change password
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 p-3">
          <p className="text-sm text-white/70">
            Need to leave? You can permanently delete this account.
          </p>
          <button
            type="button"
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
