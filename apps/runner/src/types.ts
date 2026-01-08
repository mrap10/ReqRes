export type ExecutionRequest = {
  submissionId: string;
  problem: {
    id: string;
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
