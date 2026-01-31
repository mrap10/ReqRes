export type ProblemDifficulty = "EASY" | "MEDIUM" | "HARD";
export type ProblemTrack = "ROUTING" | "MIDDLEWARE" | "SECURITY" | "DATABASE";
export type SubmissionStatus =
  | "PENDING"
  | "RUNNING"
  | "PASSED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT"
  | "MEMORY_LIMIT"
  | "RUNTIME_ERROR"
  | "COMPILE_ERROR";

export interface ProblemListDTO {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  difficulty: ProblemDifficulty;
  tags: string[];
  track: ProblemTrack;
}

export interface ProblemDetailDTO {
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
}

export interface LeaderboardDTO {
  userId: string;
  username: string;
  globalRank: number;
  totalScore: number;
  problemsSolved: number;
}

export interface SubmissionListDTO {
  id: string;
  problemId: string;
  problemTitle: string;
  userId: string;
  status: SubmissionStatus;
  track: ProblemTrack;
  difficulty: ProblemDifficulty;
  isFirstTryBonus: boolean;
  durationMs: number;
  xpEarned: number;
  createdAt: string;
}
