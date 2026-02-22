import problemsJson from "./problems.json" with { type: "json" };

interface ProblemSeedData {
  title: string;
  slug: string;
  difficulty: string;
  track: string;
  shortDescription: string;
  description: string;
  instructions: string;
  starterCode: string;
  constraints: string[];
  tags: string[];
  testConfig: { timeoutMs: number; memoryMb: number };
  examples: Record<string, unknown>;
  isPublished: boolean;
  submissionType: string;
}

const PUBLISHED_SLUGS = new Set([
  "hello-express-api",
  "query-parameter-parser",
  "request-body-parser",
  "custom-error-handler",
  "path-parameters",
  "request-logger-middleware",
  "in-memory-crud-api",
  "jwt-authentication-middleware",
  "input-validation-middleware",
  "file-upload-handler",
  "api-versioning",
  "cors-configuration",
  "jwt-with-refresh-tokens",
  "graphql-like-query-api",
]);

export const problems: ProblemSeedData[] = problemsJson
  .filter((p) => PUBLISHED_SLUGS.has(p.slug))
  .map((p) => ({
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    track: p.track,
    shortDescription: p.shortDescription,
    description: p.description,
    instructions: p.instructions,
    starterCode: JSON.stringify(p.starterCode),
    constraints: p.constraints,
    tags: p.tags,
    testConfig: p.testConfig,
    examples: typeof p.examples === "string" ? JSON.parse(p.examples) : p.examples,
    isPublished: true,
    submissionType: "EXPRESS_API",
  }));
