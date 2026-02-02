"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface ListBuilderProps {
  items: string[];
  onAdd: (item: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
}

export default function ListBuilder({ items, onAdd, onRemove, placeholder }: ListBuilderProps) {
  const [newItem, setNewItem] = useState("");

  const handleAdd = () => {
    if (newItem.trim() !== "") {
      onAdd(newItem.trim());
      setNewItem("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={placeholder}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleAdd}
          type="button"
          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="group flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border-zinc-800 rounded-md text-shadow-xs text-zinc-300"
          >
            <span>{item}</span>
            <button
              onClick={() => onRemove(index)}
              className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-zinc-500 text-sm italic">No items added yet.</p>}
      </div>
    </div>
  );
}
