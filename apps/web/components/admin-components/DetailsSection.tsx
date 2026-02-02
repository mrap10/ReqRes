import { ProblemFormData } from "@/lib/types/problem-form";
import { InputGroup } from "./InputsAdmin";
import ListBuilder from "./ListBuilder";

interface DetailsSectionProps {
  formData: ProblemFormData;
  onAddToList: (field: "constraints" | "tags", value: string) => void;
  onRemoveFromList: (field: "constraints" | "tags", index: number) => void;
}

export default function DetailsSection({
  formData,
  onAddToList,
  onRemoveFromList,
}: DetailsSectionProps) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
      <h2 className="text-lg font-bold text-white mb-6">Details</h2>
      <div className="space-y-6">
        <InputGroup
          label="Constraints"
          description="Add technical constraints (e.g. 'No external libs')"
        >
          <ListBuilder
            items={formData.constraints}
            onAdd={(val) => onAddToList("constraints", val)}
            onRemove={(idx) => onRemoveFromList("constraints", idx)}
            placeholder="Add constraint..."
          />
        </InputGroup>
        <InputGroup label="Tags" description="Keywords for search filtering">
          <ListBuilder
            items={formData.tags}
            onAdd={(val) => onAddToList("tags", val)}
            onRemove={(idx) => onRemoveFromList("tags", idx)}
            placeholder="Add tag..."
          />
        </InputGroup>
      </div>
    </div>
  );
}
