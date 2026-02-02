import { ProblemFormData } from "@/lib/types/problem-form";
import { Braces, X } from "lucide-react";

interface JsonPreviewModalProps {
  formData: ProblemFormData;
  onClose: () => void;
}

export default function JsonPreviewModal({ formData, onClose }: JsonPreviewModalProps) {
  const handleCopyAndClose = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-white/5">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Braces className="w-4 h-4 text-indigo-400" /> JSON Preview
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-zinc-950 font-mono text-xs text-emerald-400">
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
        <div className="p-4 border-t border-white/5 bg-zinc-900 flex justify-end">
          <button
            onClick={handleCopyAndClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer text-sm font-bold rounded-lg"
          >
            Copy & Close
          </button>
        </div>
      </div>
    </div>
  );
}
