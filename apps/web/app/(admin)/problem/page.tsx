"use client";

import AdminSidebar from "@/components/admin-components/AdminSidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2, Pencil, Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AdminProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  track: string;
  isPublished: boolean;
}

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<AdminProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  async function fetchProblems() {
    try {
      const res = await fetch(`${API_BASE_URL}/problems/admin/all`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProblems(data.problems);
      }
    } catch (err) {
      console.error("Failed to fetch problems", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this problem?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/problems/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setProblems((prev) => prev.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete problem");
      }
    } catch {
      alert("Failed to delete problem");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AdminSidebar />

      <main className="flex-1 ml-16 lg:ml-64 p-6 lg:p-10 max-w-400">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Manage Problems</h1>
          <Link
            href="/add-problems"
            className="text-white border bg-indigo-600 hover:bg-indigo-700 font-medium px-4 py-2 rounded-md transition-colors"
          >
            Add New Problem
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        ) : problems.length === 0 ? (
          <p className="text-slate-400 text-center py-20">No problems found.</p>
        ) : (
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-slate-400 border-b border-zinc-800">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium">Slug</th>
                  <th className="text-left px-4 py-3 font-medium">Difficulty</th>
                  <th className="text-left px-4 py-3 font-medium">Published</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {problems.map((problem) => (
                  <tr key={problem.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{problem.title}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{problem.slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          problem.difficulty === "EASY"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : problem.difficulty === "MEDIUM"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${problem.isPublished ? "text-emerald-400" : "text-slate-500"}`}
                      >
                        {problem.isPublished ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/add-problems?edit=${problem.id}`}
                          className="p-1.5 rounded hover:bg-zinc-800 text-slate-400 hover:text-indigo-400 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(problem.id)}
                          disabled={deletingId === problem.id}
                          className="p-1.5 rounded hover:bg-zinc-800 text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === problem.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
