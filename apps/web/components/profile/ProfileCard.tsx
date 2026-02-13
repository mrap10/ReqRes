import { Check } from "lucide-react";
import Image from "next/image";

export default function ProfileCard() {
  return (
    <div className="rounded-3xl border border-white/15 bg-[#0e0e15] p-5 sm:p-6">
      <div className="flex flex-col md:flex-row justify-around md:items-start items-center gap-5">
        <div className="flex flex-col items-center">
          <button
            type="button"
            className="group relative h-36 w-36 overflow-hidden rounded-full border-2 cursor-pointer border-white/65 bg-white/5 transition hover:border-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/75"
          >
            <Image
              src="/avatar1.svg"
              alt="User avatar"
              fill
              className="mt-2 object-cover transition duration-200 group-hover:scale-105"
              sizes="144px"
            />
          </button>
          <p className="mt-3 text-xs text-white/65">Tap avatar to change</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm tracking-wider text-white/50">Name</p>
            <div className="flex flex-wrap mt-2">
              <input
                id="name"
                type="text"
                className="min-w-0 flex-1 rounded-l-xl border border-white/20 bg-black/45 px-3 py-2.5 text-sm text-white outline-none transition focus:border-(--brand-cyan)/85"
              />
              <button
                type="button"
                className="inline-flex items-center cursor-pointer gap-1 rounded-r-xl border border-indigo-200/55 bg-indigo-300/25 px-3 py-2.5 text-sm font-medium text-indigo-50 transition hover:border-indigo-100/80 hover:bg-indigo-300/35"
              >
                <Check className="size-4" />
                Save
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm tracking-wider text-white/50">Username</p>
              <p className="mt-1 text-lg text-white">@username_placeholder</p>
            </div>
            <div>
              <p className="text-sm tracking-wider text-white/50">Email</p>
              <p className="mt-1 text-lg text-white">email_placeholder</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl w-full md:w-auto md:place-self-center place-items-center border border-white/20 bg-black/40 p-4">
          <p className="text-sm font-medium text-white">Current Streak: 12</p>
          <p className="mt-2 text-sm font-medium text-white">Longeset Streak: 15</p>
        </div>
      </div>
    </div>
  );
}
