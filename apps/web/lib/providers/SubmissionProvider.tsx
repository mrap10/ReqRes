"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
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
  index?: number;
  location?: {
    line: number;
    column: number;
  };
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

interface SSEMessage {
  state?: string;
  progress?: number | object;
  result?: {
    submissionId: string;
    status: string;
    durationMs?: number;
  };
  error?: string;
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
  runCode: (problemId: string, code: string) => Promise<void>;
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
  const eventSourceRef = useRef<EventSource | null>(null);

  const mapStatusToSubmissionStatus = useCallback(
    (apiStatus: string): SubmissionState["status"] => {
      const lowerStatus = apiStatus.toLowerCase();
      if (lowerStatus === "wrong_answer") return "failed";
      if (lowerStatus === "runtime_error") return "error";
      if (lowerStatus === "pending") return "pending";
      if (lowerStatus === "running" || lowerStatus === "active") return "running";
      if (lowerStatus === "passed") return "passed";
      if (lowerStatus === "failed") return "failed";
      if (lowerStatus === "error") return "error";
      if (lowerStatus === "completed") return "passed"; // BullMQ completed state
      return "idle";
    },
    []
  );

  const fetchFinalSubmissionDetails = useCallback(
    async (submissionId: string) => {
      try {
        const [statusRes, logsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/submissions/${submissionId}`, {
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/submissions/${submissionId}/logs`, {
            credentials: "include",
          }),
        ]);

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
            toast.success(`${data.xpEarned} XP earned! 🎉`, {
              duration: 3000,
            });
          }
        }

        if (logsRes.ok) {
          const logsData: LogsResponse = await logsRes.json();
          setSubmission((prev) => ({
            ...prev,
            logs: logsData.logs.length > 0 ? logsData.logs : prev.logs,
          }));
        }
      } catch (error) {
        console.error("Error fetching final submission details:", error);
      }
    },
    [mapStatusToSubmissionStatus]
  );

  const streamSubmission = useCallback(
    (submissionId: string) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const streamUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/submissions/${submissionId}/stream`;
      const eventSource = new EventSource(streamUrl, { withCredentials: true });
      eventSourceRef.current = eventSource;

      setSubmission((prev) => ({
        ...prev,
        logs: [...prev.logs, { type: "info", message: "Connected to submission stream..." }],
      }));

      eventSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);

          if (data.error) {
            setSubmission((prev) => ({
              ...prev,
              status: "error",
              logs: [...prev.logs, { type: "error", message: data.error || "Unknown error" }],
            }));
            eventSource.close();
            return;
          }

          if (data.state) {
            const mappedStatus = mapStatusToSubmissionStatus(data.state);

            if (data.progress !== undefined) {
              const progressValue =
                typeof data.progress === "number" ? data.progress : JSON.stringify(data.progress);
              setSubmission((prev) => ({
                ...prev,
                status: mappedStatus,
                logs: prev.logs.some((log) => log.message.includes("Progress:"))
                  ? prev.logs.map((log) =>
                      log.message.includes("Progress:")
                        ? { ...log, message: `Progress: ${progressValue}%` }
                        : log
                    )
                  : [...prev.logs, { type: "info", message: `Progress: ${progressValue}%` }],
              }));
            } else {
              setSubmission((prev) => ({
                ...prev,
                status: mappedStatus,
              }));
            }

            if (data.state === "completed" || data.state === "failed") {
              eventSource.close();
              fetchFinalSubmissionDetails(submissionId);
            }
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        eventSource.close();

        // if sse fails, fallback to polling final status
        setSubmission((prev) => ({
          ...prev,
          logs: [
            ...prev.logs,
            { type: "warn", message: "Stream disconnected, checking status..." },
          ],
        }));

        fetchFinalSubmissionDetails(submissionId);
      };

      return () => {
        eventSource.close();
      };
    },
    [mapStatusToSubmissionStatus, fetchFinalSubmissionDetails]
  );

  const submitCode = useCallback(
    async (problemIdToUse: string, code: string, mode: "run" | "submit" = "submit") => {
      const isRunMode = mode === "run";

      setSubmission({
        submissionId: null,
        status: "pending",
        logs: [{ type: "info", message: isRunMode ? "Running code..." : "Submitting code..." }],
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
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          mode,
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

        streamSubmission(data.submissionId);
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
    [problemId, streamSubmission]
  );

  const clearSubmission = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setSubmission(initialState);
  }, []);

  const runCode = useCallback(
    async (problemIdToUse: string, code: string) => {
      return submitCode(problemIdToUse, code, "run");
    },
    [submitCode]
  );

  return (
    <SubmissionContext.Provider value={{ submission, submitCode, runCode, clearSubmission }}>
      {children}
    </SubmissionContext.Provider>
  );
}
