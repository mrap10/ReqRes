import { ProblemFormData } from "@/lib/types/problem-form";
import { CheckCircle2, Settings } from "lucide-react";
import { InputGroup } from "./InputsAdmin";

interface ConfigurationSectionProps {
  formData: ProblemFormData;
  onFieldChange: <K extends keyof ProblemFormData>(field: K, value: ProblemFormData[K]) => void;
}

const DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD"] as const;

export default function ConfigurationSection({
  formData,
  onFieldChange,
}: ConfigurationSectionProps) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-indigo-400" />
        Configuration
      </h2>

      <div className="space-y-6">
        <InputGroup label="Difficulty" required>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => onFieldChange("difficulty", level)}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                  formData.difficulty === level
                    ? level === "EASY"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : level === "MEDIUM"
                        ? "bg-amber-500/20 border-amber-500 text-amber-400"
                        : "bg-rose-500/20 border-rose-500 text-rose-400"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </InputGroup>

        <InputGroup label="Publish Status">
          <div
            onClick={() => onFieldChange("isPublished", !formData.isPublished)}
            className={`cursor-pointer flex items-center justify-between p-3 rounded-lg transition-all ${
              formData.isPublished
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-zinc-950 border-zinc-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-4 rounded-full relative transition-colors ${
                  formData.isPublished ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              >
                <div
                  className="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all"
                  style={{ left: formData.isPublished ? "18px" : "2px" }}
                />
              </div>
              <span
                className={`text-sm font-medium ${
                  formData.isPublished ? "text-white" : "text-zinc-500"
                }`}
              >
                {formData.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            {formData.isPublished && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>
        </InputGroup>
      </div>
    </div>
  );
}
