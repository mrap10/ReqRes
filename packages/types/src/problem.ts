import type { Language, TestCase } from "./runner.js";

export type Difficulty = "easy" | "medium" | "hard";

export interface Problem {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  supportedLanguages: Language[];
  testCases: TestCase[];
  starterCode: Record<Language, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProblemSummary {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  acceptanceRate: number;
  totalSubmissions: number;
}

export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  code: string;
  language: Language;
  status: "pending" | "accepted" | "rejected";
  score: number;
  executionTime: number;
  memoryUsed: number;
  createdAt: Date;
}

// API DTOs
export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD";
export type ProblemTrack = "ROUTING" | "MIDDLEWARE" | "SECURITY" | "DATABASE";

export type ProblemListDTO = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  track: ProblemTrack;
};

export type ProblemDetailDTO = {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  instructions: string;
  constraints: string[];
  examples?: Record<string, unknown>;
  starterCode?: string;
  difficulty: ProblemDifficulty;
  track: ProblemTrack;
  tags: string[];
};
