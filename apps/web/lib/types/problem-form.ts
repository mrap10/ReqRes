import type { CreateProblemDTO, StarterCodeFile } from "@reqres/types";

export type { CreateProblemDTO, StarterCodeFile };

export interface ProblemFormData {
  title: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  track: "ROUTING" | "MIDDLEWARE" | "SECURITY" | "DATABASE";
  shortDescription: string;
  description: string;
  instructions: string;
  starterCode: StarterCodeFile[];
  constraints: string[];
  tags: string[];
  testConfig: {
    timeoutMs: number;
    memoryMb: number;
  };
  examples?: string;
  isPublished: boolean;
}

export const DEFAULT_PROBLEM_FORM: ProblemFormData = {
  title: "",
  slug: "",
  difficulty: "EASY",
  track: "ROUTING",
  shortDescription: "",
  description: "",
  instructions: "",
  starterCode: [{ filename: "index.js", content: "" }],
  constraints: [],
  tags: [],
  testConfig: {
    timeoutMs: 3000,
    memoryMb: 256,
  },
  examples: "",
  isPublished: false,
};

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
