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

  const pollSubmission = useCallback(async (submissionId: string) => {
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/submissions/${submissionId}/logs`
        );

        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setSubmission((prev) => ({
            ...prev,
            logs: logsData.logs,
          }));
        }

        const statusRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/submissions/${submissionId}`
        );

        if (statusRes.ok) {
          const data = await statusRes.json();
          const status = data.status.toLowerCase();

          setSubmission((prev) => ({
            ...prev,
            status:
              status === "wrong_answer" ? "failed" : status === "runtime_error" ? "error" : status,
            testResults: data.results || [],
            output: data.output,
            durationMs: data.durationMs,
            xpEarned: data.xpEarned || 0,
          }));

          if (status === "passed" && data.xpEarned && data.xpEarned > 0) {
            toast.success(`${data.xpEarned} XP gained! 🎉`, {
              duration: 3000,
            });
          }

          if (status === "pending" || status === "running") {
            setTimeout(poll, 1000);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        setTimeout(poll, 2000);
      }
    };

    poll();
  }, []);

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
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const error = await res.json();
          setSubmission((prev) => ({
            ...prev,
            status: "error",
            logs: [...prev.logs, { type: "error", message: error.error || "Submission failed" }],
          }));
          return;
        }

        const data = await res.json();

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
