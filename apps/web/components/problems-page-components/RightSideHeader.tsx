"use client";

import { FileCode, Play, Send } from "lucide-react";
import { useSubmission } from "../../lib/providers/SubmissionProvider";

interface RightSideHeaderProps {
  onRun: () => void;
  onSubmit: () => void;
}

export default function RightSideHeader({ onRun, onSubmit }: RightSideHeaderProps) {
  const { submission } = useSubmission();
  const isRunning = submission.status === "pending" || submission.status === "running";

  return (
    <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between pl-0 pr-4">
      <div className="flex h-full">
        <div className="px-4 h-full bg-zinc-950 border-r border-t-2 border-t-indigo-500 border-zinc-800 flex items-center gap-2 text-sm text-white font-medium min-w-30">
          <div className="text-yellow-400">
            <FileCode className="w-4 h-4" />
          </div>
          index.js
        </div>
      </div>

      <div className="flex items-center gap-2 py-1">
        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all disabled:opacity-50"
        >
          {isRunning ? (
            <span className="animate-spin w-3 h-3 border-2 border-white/20 border-t-white rounded-full"></span>
          ) : (
            <Play className="w-3 h-3 fill-current" />
          )}
          Run Code
        </button>
        <button
          onClick={onSubmit}
          disabled={isRunning}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-[0_0_10px_rgba(99,102,241,0.4)] transition-all transform active:scale-95 disabled:opacity-50"
        >
          <Send className="w-3 h-3" />
          Submit
        </button>
      </div>
    </div>
  );
}
