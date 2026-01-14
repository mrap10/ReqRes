import { Database, Server, ShieldCheck, Terminal, Zap } from "lucide-react";

interface FiltersProps {
  currentFilter: string;
  setFilter: (filter: string) => void;
}

export default function Filters({ currentFilter, setFilter }: FiltersProps) {
  const categories = [
    { id: "all", label: "All Problems", icon: Terminal },
    { id: "routing", label: "Routing", icon: Server },
    { id: "middleware", label: "Middleware", icon: Zap },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "database", label: "Database", icon: Database },
  ];

  return (
    <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = currentFilter === category.id;
        return (
          <button
            key={category.id}
            onClick={() => setFilter(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${isActive ? "bg-indigo-500 border-none text-white shadow-lg shadow-indigo-500/20" : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"}`}
          >
            <Icon className="size-4" />
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
