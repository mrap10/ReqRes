"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { Braces, Eye, Save, X } from "lucide-react";
import { useState } from "react";

export default function AddProblemsPage() {
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AdminSidebar />
      <main className="flex-1 ml-16 lg:ml-64 p-6 lg:p-10 max-w-[1600px]">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Add New Problem</h1>
            <p className="text-zinc-500 text-sm">Create a new challenge for the users.</p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="px-4 py-2 flex items-center gap-2 font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 cursor-pointer border border-zinc-800 transition-colors rounded-lg"
            >
              {showJsonPreview ? <Eye className="w-4 h-4" /> : <Braces className="w-4 h-4" />}
              {showJsonPreview ? "Hide JSON" : "Show JSON"}
            </button>

            <button className="px-4 py-2 flex items-center gap-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95 transition-colors rounded-lg">
              <Save className="w-4 h-4" />
              Save Problem
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">basic info</div>
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">detailed info</div>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
              settings and status
            </div>
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
              tags and constraints
            </div>
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">test config</div>
          </div>
        </div>

        {showJsonPreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center p-4 border-b border-white/5">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Braces className="w-4 h-4 text-indigo-400" /> JSON Preview
                </h3>
                <button
                  onClick={() => setShowJsonPreview(false)}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-zinc-950 font-mono text-xs text-emerald-400">
                <pre>formData here</pre>
              </div>
              <div className="p-4 border-t border-white/5 bg-zinc-900 flex justify-end">
                <button
                  onClick={() => alert("Copied!")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer text-sm font-bold rounded-lg"
                >
                  Copy & Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
