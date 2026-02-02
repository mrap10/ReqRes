import { ProblemFormData } from "@/lib/types/problem-form";
import { FileText } from "lucide-react";
import { InputGroup, SelectInput, TextInput } from "./InputsAdmin";

interface MetadataSectionProps {
  formData: ProblemFormData;
  onTitleChange: (title: string) => void;
  onFieldChange: <K extends keyof ProblemFormData>(field: K, value: ProblemFormData[K]) => void;
}

const TRACK_OPTIONS = [
  { label: "Routing & API", value: "ROUTING" },
  { label: "Middleware", value: "MIDDLEWARE" },
  { label: "Security", value: "SECURITY" },
  { label: "Database", value: "DATABASE" },
];

export default function MetadataSection({
  formData,
  onTitleChange,
  onFieldChange,
}: MetadataSectionProps) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
      <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <FileText className="w-5 h-5 text-indigo-400" />
        Problem Metadata
      </h2>

      <div className="grid gap-6">
        <InputGroup label="Problem Title" required>
          <TextInput
            placeholder="e.g. Rate Limiting Middleware"
            value={formData.title}
            onchange={onTitleChange}
          />
        </InputGroup>

        <div className="grid sm:grid-cols-2 gap-6">
          <InputGroup label="Slug (Auto-generated)" required description="URL-friendly identifier">
            <TextInput
              placeholder="rate-limiting-middleware"
              value={formData.slug}
              onchange={(val) => onFieldChange("slug", val)}
              className="font-mono text-zinc-400"
            />
          </InputGroup>
          <InputGroup label="Track" required>
            <SelectInput
              value={formData.track}
              onchange={(val) => onFieldChange("track", val as typeof formData.track)}
              options={TRACK_OPTIONS}
            />
          </InputGroup>
        </div>

        <InputGroup
          label="Short Description"
          required
          description="Appears in the problem list card (max 120 chars)"
        >
          <TextInput
            placeholder="Implement a rate limiter to prevent abuse..."
            value={formData.shortDescription}
            onchange={(val) => onFieldChange("shortDescription", val)}
          />
        </InputGroup>
      </div>
    </div>
  );
}
