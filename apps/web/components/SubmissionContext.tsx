"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";

export interface ExecutionLog {
  type: "info" | "error" | "warn";
  message: string;
  timestamp?: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface SubmissionState {
  submissionId: string | null;
  status: "idle" | "pending" | "running" | "passed" | "failed" | "error";
  logs: ExecutionLog[];
  testResults: TestResult[];
  output: string | null;
  durationMs: number | null;
  score: number | null;
  xpEarned?: number;
}

interface SubmissionResponse {
  submissionId: string;
}

interface SubmissionStatusResponse {
  status: string;
  results?: TestResult[];
  output?: string;
  durationMs?: number;
  xpEarned?: number;
}

interface LogsResponse {
  logs: ExecutionLog[];
}

interface ErrorResponse {
  error?: string;
  message?: string;
}

interface SubmissionContextType {
  submission: SubmissionState;
  submitCode: (problemId: string, code: string) => Promise<void>;
  clearSubmission: () => void;
}

const initialState: SubmissionState = {
  submissionId: null,
  status: "idle",
  logs: [],
  testResults: [],
  output: null,
  durationMs: null,
  score: null,
};

const SubmissionContext = createContext<SubmissionContextType | null>(null);

export function useSubmission() {
  const context = useContext(SubmissionContext);
  if (!context) {
    throw new Error("useSubmission must be used within a SubmissionProvider");
  }
  return context;
}

interface SubmissionProviderProps {
  children: ReactNode;
  problemId: string;
}

export function SubmissionProvider({ children, problemId }: SubmissionProviderProps) {
  const [submission, setSubmission] = useState<SubmissionState>(initialState);

  const mapStatusToSubmissionStatus = useCallback(
    (apiStatus: string): SubmissionState["status"] => {
      const lowerStatus = apiStatus.toLowerCase();
      if (lowerStatus === "wrong_answer") return "failed";
      if (lowerStatus === "runtime_error") return "error";
      if (lowerStatus === "pending") return "pending";
      if (lowerStatus === "running") return "running";
      if (lowerStatus === "passed") return "passed";
      if (lowerStatus === "failed") return "failed";
      if (lowerStatus === "error") return "error";
      return "idle";
    },
    []
  );

  const pollSubmission = useCallback(
    async (submissionId: string) => {
      const maxAttempts = 60;
      let attempts = 0;

      const poll = async () => {
        if (attempts >= maxAttempts) {
          setSubmission((prev) => ({
            ...prev,
            status: "error",
            logs: [...prev.logs, { type: "error", message: "Polling timeout reached" }],
          }));
          return;
        }

        attempts++;

        try {
          const logsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/submissions/${submissionId}/logs`,
            {
              credentials: "include",
            }
          );

          if (logsRes.ok) {
            const logsData: LogsResponse = await logsRes.json();
            setSubmission((prev) => ({
              ...prev,
              logs: logsData.logs,
            }));
          }

          const statusRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/submissions/${submissionId}`,
            {
              credentials: "include",
            }
          );

          if (statusRes.ok) {
            const data: SubmissionStatusResponse = await statusRes.json();
            const mappedStatus = mapStatusToSubmissionStatus(data.status);

            setSubmission((prev) => ({
              ...prev,
              status: mappedStatus,
              testResults: data.results || [],
              output: data.output ?? null,
              durationMs: data.durationMs ?? null,
              xpEarned: data.xpEarned,
            }));

            if (mappedStatus === "passed" && data.xpEarned && data.xpEarned > 0) {
              toast.success(`${data.xpEarned} XP gained! 🎉`, {
                duration: 3000,
              });
            }

            if (mappedStatus === "pending" || mappedStatus === "running") {
              setTimeout(poll, 1000);
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
          setTimeout(poll, 2000);
        }
      };

      poll();
    },
    [mapStatusToSubmissionStatus]
  );

  const submitCode = useCallback(
    async (problemIdToUse: string, code: string) => {
      setSubmission({
        submissionId: null,
        status: "pending",
        logs: [{ type: "info", message: "Submitting code..." }],
        testResults: [],
        output: null,
        durationMs: null,
        score: null,
      });

      try {
        const payload = {
          problemId: problemIdToUse || problemId,
          code: {
            files: {
              "index.js": code,
            },
            entryPoint: "index.js",
          },
        };

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/submissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const error: ErrorResponse = await res.json();
          setSubmission((prev) => ({
            ...prev,
            status: "error",
            logs: [...prev.logs, { type: "error", message: error.error || "Submission failed" }],
          }));
          return;
        }

        const data: SubmissionResponse = await res.json();

        setSubmission((prev) => ({
          ...prev,
          submissionId: data.submissionId,
          status: "running",
          logs: [...prev.logs, { type: "info", message: "Code submitted successfully" }],
        }));

        pollSubmission(data.submissionId);
      } catch (error) {
        setSubmission((prev) => ({
          ...prev,
          status: "error",
          logs: [
            ...prev.logs,
            {
              type: "error",
              message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        }));
      }
    },
    [problemId, pollSubmission]
  );

  const clearSubmission = useCallback(() => {
    setSubmission(initialState);
  }, []);

  return (
    <SubmissionContext.Provider value={{ submission, submitCode, clearSubmission }}>
      {children}
    </SubmissionContext.Provider>
  );
}
