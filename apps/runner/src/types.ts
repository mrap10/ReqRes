export type ExecutionRequest = {
  submissionId: string;
  problem: {
    id: string;
    slug: string;
    submissionType: "EXPRESS_API";
  };
  codeBundle: {
    files: Record<string, string>;
    entryPoint: string;
  };
  testConfig: {
    timeoutMs: number;
    memoryMb: number;
  };
};

export type TestResult = {
  name: string;
  passed: boolean;
  error?: string;
};

export type ExecuteResponse = {
  submissionId: string;
  status: "PASSED" | "FAILED" | "ERROR";
  results: TestResult[];
  durationMs: number;
  stderr?: string;
  stdout?: string;
};

export type JestJSON = {
  success: boolean;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  testResults: Array<{
    name: string;
    status: "passed" | "failed";
    assertionResults: Array<{
      ancestorTitles: string[];
      title: string;
      status: "passed" | "failed" | "pending" | "skipped";
      fullName: string;
      failureMessages: string[];
      duration?: number;
      location?: {
        line: number;
        column: number;
      };
    }>;
  }>;
};
