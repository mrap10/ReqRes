import { Braces, Eye, Loader2, Save } from "lucide-react";

interface PageHeaderProps {
  showJsonPreview: boolean;
  setShowJsonPreview: (show: boolean) => void;
  onSave: () => void;
  isSubmitting: boolean;
  isEditMode?: boolean;
}

export default function PageHeader({
  showJsonPreview,
  setShowJsonPreview,
  onSave,
  isSubmitting,
  isEditMode = false,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {isEditMode ? "Update Problem" : "Add New Problem"}
        </h1>
        <p className="text-zinc-500 text-sm">
          {isEditMode ? "Edit the problem details below." : "Create a new challenge for the users."}
        </p>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <button
          onClick={() => setShowJsonPreview(!showJsonPreview)}
          className="px-4 py-2 flex items-center gap-2 font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 cursor-pointer border border-zinc-800 transition-colors rounded-lg"
        >
          {showJsonPreview ? <Eye className="w-4 h-4" /> : <Braces className="w-4 h-4" />}
          {showJsonPreview ? "Hide JSON" : "Show JSON"}
        </button>

        <button
          onClick={onSave}
          disabled={isSubmitting}
          className="px-4 py-2 flex items-center gap-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting ? "Saving..." : isEditMode ? "Update Problem" : "Save Problem"}
        </button>
      </div>
    </header>
  );
}
