"use client";

import { Ban, Edit2, Plus, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface UserOverride {
  userId: string;
  limit: number;
  windowMs: number;
  reason?: string;
  createdAt: string;
}

interface BlockedIP {
  ip: string;
  reason: string;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminRateLimitTable() {
  const [activeTab, setActiveTab] = useState<"overrides" | "blocked">("overrides");
  const [searchTerm, setSearchTerm] = useState("");
  const [overrides, setOverrides] = useState<UserOverride[]>([]);
  const [blocked, setBlocked] = useState<BlockedIP[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddOverride, setShowAddOverride] = useState(false);
  const [showBlockIP, setShowBlockIP] = useState(false);
  const [editingOverride, setEditingOverride] = useState<UserOverride | null>(null);

  const [newOverride, setNewOverride] = useState({
    userId: "",
    limit: 100,
    windowMs: 60000,
    reason: "",
  });
  const [newBlock, setNewBlock] = useState({
    ip: "",
    reason: "",
    expiresInMinutes: "",
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overridesRes, blockedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/rate-limits/overrides`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/admin/rate-limits/blocked`, { credentials: "include" }),
      ]);

      if (overridesRes.ok) {
        const data = await overridesRes.json();
        setOverrides(data.overrides || []);
      }

      if (blockedRes.ok) {
        const data = await blockedRes.json();
        setBlocked(data.blocked || []);
      }
    } catch (error) {
      console.error("Failed to fetch rate limit data:", error);
      toast.error("Failed to fetch rate limit data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddOverride = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/rate-limits/overrides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newOverride),
      });

      if (response.ok) {
        setShowAddOverride(false);
        setNewOverride({ userId: "", limit: 100, windowMs: 60000, reason: "" });
        toast.success("Override added successfully!");
        fetchData();
      } else {
        toast.error("Failed to add override.");
      }
    } catch (error) {
      console.error("Failed to add override:", error);
      toast.error("Failed to add override.");
    }
  };

  const handleUpdateOverride = async () => {
    if (!editingOverride) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/rate-limits/overrides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: editingOverride.userId,
          limit: editingOverride.limit,
          windowMs: editingOverride.windowMs,
          reason: editingOverride.reason,
        }),
      });

      if (response.ok) {
        setEditingOverride(null);
        toast.success("Override updated successfully!");
        fetchData();
      } else {
        toast.error("Failed to update override.");
      }
    } catch (error) {
      console.error("Failed to update override:", error);
      toast.error("Failed to update override.");
    }
  };

  const handleDeleteOverride = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/rate-limits/overrides/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Override deleted successfully!");
        fetchData();
      } else {
        toast.error("Failed to delete override.");
      }
    } catch (error) {
      console.error("Failed to delete override:", error);
      toast.error("Failed to delete override.");
    }
  };

  const handleBlockIP = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/rate-limits/blocked`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ip: newBlock.ip,
          reason: newBlock.reason,
          expiresInMinutes: newBlock.expiresInMinutes ? parseInt(newBlock.expiresInMinutes) : null,
        }),
      });

      if (response.ok) {
        setShowBlockIP(false);
        setNewBlock({ ip: "", reason: "", expiresInMinutes: "" });
        toast.success("IP blocked successfully!");
        fetchData();
      } else {
        toast.error("Failed to block IP.");
      }
    } catch (error) {
      console.error("Failed to block IP:", error);
      toast.error("Failed to block IP.");
    }
  };

  const handleUnblockIP = async (ip: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/rate-limits/blocked/${encodeURIComponent(ip)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        toast.success("IP unblocked successfully!");
        fetchData();
      } else {
        toast.error("Failed to unblock IP.");
      }
    } catch (error) {
      console.error("Failed to unblock IP:", error);
      toast.error("Failed to unblock IP.");
    }
  };

  const filteredOverrides = overrides.filter(
    (o) =>
      o.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlocked = blocked.filter(
    (b) => b.ip.includes(searchTerm) || b.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (ms: number) => {
    if (ms >= 60000) return `${ms / 60000}m`;
    return `${ms / 1000}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${activeTab === "overrides" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
            onClick={() => setActiveTab("overrides")}
          >
            User Overrides ({overrides.length})
          </button>
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${activeTab === "blocked" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
            onClick={() => setActiveTab("blocked")}
          >
            Blocked IPs ({blocked.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
            <input
              type="text"
              placeholder={activeTab === "overrides" ? "Search users..." : "Search IPs..."}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white focus:border-indigo-800 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() =>
              activeTab === "overrides" ? setShowAddOverride(true) : setShowBlockIP(true)
            }
            className="p-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : activeTab === "overrides" ? (
          <table className="w-full text-left">
            <thead className="bg-zinc-950/50 text-sm font-mono text-zinc-500 border-b border-white/5">
              <tr>
                <th className="p-4 font-medium">User ID</th>
                <th className="p-4 font-medium">Custom Limit</th>
                <th className="p-4 font-medium">Window</th>
                <th className="p-4 font-medium">Reason</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {filteredOverrides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No user overrides found
                  </td>
                </tr>
              ) : (
                filteredOverrides.map((override) => (
                  <tr
                    key={override.userId}
                    className="hover:bg-zinc-800/20 transition-colors group"
                  >
                    <td className="p-4 font-mono text-white">{override.userId.slice(0, 12)}...</td>
                    <td className="p-4 font-mono text-zinc-400">{override.limit} req</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {formatTime(override.windowMs)}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500 text-xs max-w-50 truncate">
                      {override.reason || "—"}
                    </td>
                    <td className="p-4 text-zinc-500 text-xs">{formatDate(override.createdAt)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingOverride(override)}
                          className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteOverride(override.userId)}
                          className="p-1.5 hover:bg-rose-900/30 rounded text-zinc-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-950/50 text-sm font-mono text-zinc-500 border-b border-white/5">
              <tr>
                <th className="p-4 font-medium">IP Address</th>
                <th className="p-4 font-medium">Reason</th>
                <th className="p-4 font-medium">Expires</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {filteredBlocked.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No blocked IPs found
                  </td>
                </tr>
              ) : (
                filteredBlocked.map((item) => (
                  <tr key={item.ip} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="p-4 font-mono text-white flex items-center gap-2">
                      <Ban className="w-3 h-3 text-rose-500" />
                      {item.ip}
                    </td>
                    <td className="p-4 text-zinc-400 text-sm max-w-50 truncate">{item.reason}</td>
                    <td className="p-4 font-mono text-zinc-500 text-sm">
                      {item.expiresAt ? formatDate(item.expiresAt) : "Never"}
                    </td>
                    <td className="p-4 text-zinc-500 text-xs">{formatDate(item.createdAt)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleUnblockIP(item.ip)}
                        className="px-3 py-1 hover:bg-zinc-800 rounded text-xs cursor-pointer text-zinc-400 hover:text-white border border-transparent hover:border-zinc-700 transition-all opacity-0 group-hover:opacity-100"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAddOverride && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Add User Override</h3>
              <button
                onClick={() => setShowAddOverride(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">User ID</label>
                <input
                  type="text"
                  value={newOverride.userId}
                  onChange={(e) => setNewOverride({ ...newOverride, userId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter user ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Request Limit</label>
                  <input
                    type="number"
                    value={newOverride.limit}
                    onChange={(e) =>
                      setNewOverride({ ...newOverride, limit: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Window (ms)</label>
                  <input
                    type="number"
                    value={newOverride.windowMs}
                    onChange={(e) =>
                      setNewOverride({
                        ...newOverride,
                        windowMs: parseInt(e.target.value) || 60000,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={newOverride.reason}
                  onChange={(e) => setNewOverride({ ...newOverride, reason: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g., Premium user, API partner"
                />
              </div>
              <button
                onClick={handleAddOverride}
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Add Override
              </button>
            </div>
          </div>
        </div>
      )}

      {editingOverride && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Edit Override</h3>
              <button
                onClick={() => setEditingOverride(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">User ID</label>
                <input
                  type="text"
                  value={editingOverride.userId}
                  disabled
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Request Limit</label>
                  <input
                    type="number"
                    value={editingOverride.limit}
                    onChange={(e) =>
                      setEditingOverride({
                        ...editingOverride,
                        limit: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Window (ms)</label>
                  <input
                    type="number"
                    value={editingOverride.windowMs}
                    onChange={(e) =>
                      setEditingOverride({
                        ...editingOverride,
                        windowMs: parseInt(e.target.value) || 60000,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={editingOverride.reason || ""}
                  onChange={(e) =>
                    setEditingOverride({ ...editingOverride, reason: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleUpdateOverride}
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Update Override
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlockIP && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Block IP Address</h3>
              <button
                onClick={() => setShowBlockIP(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">IP Address</label>
                <input
                  type="text"
                  value={newBlock.ip}
                  onChange={(e) => setNewBlock({ ...newBlock, ip: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g., 192.168.1.1"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Reason</label>
                <input
                  type="text"
                  value={newBlock.reason}
                  onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g., Suspicious activity, DDoS attempt"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">
                  Expires in (minutes, leave empty for permanent)
                </label>
                <input
                  type="number"
                  value={newBlock.expiresInMinutes}
                  onChange={(e) => setNewBlock({ ...newBlock, expiresInMinutes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g., 60 for 1 hour"
                />
              </div>
              <button
                onClick={handleBlockIP}
                className="w-full bg-rose-500 hover:bg-rose-400 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Block IP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
