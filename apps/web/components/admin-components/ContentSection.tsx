import { ProblemFormData, StarterCodeFile } from "@/lib/types/problem-form";
import { Code2 } from "lucide-react";
import { InputGroup, TextArea } from "./InputsAdmin";
import StarterCodeEditor from "./StarterCodeEditor";

interface ContentSectionProps {
  formData: ProblemFormData;
  onFieldChange: <K extends keyof ProblemFormData>(field: K, value: ProblemFormData[K]) => void;
  onStarterCodeChange: (files: StarterCodeFile[]) => void;
}

export default function ContentSection({
  formData,
  onFieldChange,
  onStarterCodeChange,
}: ContentSectionProps) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-400" />
          Content & Instructions
        </h2>
        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-zinc-700">
          Markdown Supported
        </span>
      </div>

      <div className="space-y-6">
        <InputGroup label="Full Description" required>
          <TextArea
            placeholder="Detailed explanation of the problem context..."
            value={formData.description}
            onchange={(val) => onFieldChange("description", val)}
            rows={3}
          />
        </InputGroup>

        <InputGroup label="Instructions" required>
          <TextArea
            placeholder="### Requirements\n- Step 1...\n- Step 2..."
            value={formData.instructions}
            onchange={(val) => onFieldChange("instructions", val)}
            rows={8}
          />
        </InputGroup>

        <InputGroup label="Starter Code" description="Add multiple files for complex problems">
          <StarterCodeEditor files={formData.starterCode} onChange={onStarterCodeChange} />
        </InputGroup>
      </div>
    </div>
  );
}
