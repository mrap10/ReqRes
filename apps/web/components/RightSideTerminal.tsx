"use client";

import {
  Check,
  CheckCircle2,
  PanelBottomClose,
  PanelBottomOpen,
  Terminal,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSubmission } from "./SubmissionContext";

export default function RightSideTerminal() {
  const { submission } = useSubmission();
  const [activeTab, setActiveTab] = useState<"tests" | "console">("console");
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isRunning = submission.status === "pending" || submission.status === "running";
  const hasResults = submission.testResults.length > 0;
  const passedTests = submission.testResults.filter((t) => t.passed).length;
  const totalTests = submission.testResults.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hasResults) {
      setActiveTab("tests");
    }
  }, [hasResults]);

  useEffect(() => {
    if (!mounted) return;

    if (submission.status === "pending") {
      setActiveTab("console");
      setIsConsoleOpen(true);
    }
  }, [submission.status, mounted]);

  return (
    <div
      className={`border-t border-zinc-800 bg-zinc-900 flex flex-col transition-all duration-300 ${isConsoleOpen ? "basis-[35%]" : "basis-10"}`}
    >
      <div className="h-10 flex items-center justify-between px-2 bg-zinc-900 shrink-0">
        <div className="flex">
          <TabButton
            active={activeTab === "tests"}
            onClick={() => {
              setActiveTab("tests");
              setIsConsoleOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" />
              Test Results
              {hasResults && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${passedTests === totalTests ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
                >
                  {passedTests}/{totalTests}
                </span>
              )}
            </div>
          </TabButton>
          <TabButton
            active={activeTab === "console"}
            onClick={() => {
              setActiveTab("console");
              setIsConsoleOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              Console
              {isRunning && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              )}
            </div>
          </TabButton>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 cursor-pointer"
          >
            {isConsoleOpen ? (
              <PanelBottomClose className="w-4 h-4" />
            ) : (
              <PanelBottomOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {isConsoleOpen && (
        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-zinc-950/50">
          {activeTab === "tests" ? (
            <TestResultsView
              testResults={submission.testResults}
              isRunning={isRunning}
              status={submission.status}
            />
          ) : (
            <ConsoleView logs={submission.logs} isRunning={isRunning} status={submission.status} />
          )}
        </div>
      )}
    </div>
  );
}

function TestResultsView({
  testResults,
  isRunning,
  status,
}: {
  testResults: { name: string; passed: boolean; error?: string }[];
  isRunning: boolean;
  status: string;
}) {
  if (status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
        <CheckCircle2 className="w-8 h-8 opacity-50" />
        <span>Run your code to see test results</span>
      </div>
    );
  }

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        Running tests against your server...
      </div>
    );
  }

  if (testResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
        <XCircle className="w-8 h-8 opacity-50" />
        <span>No test results available</span>
      </div>
    );
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  const allPassed = passedCount === testResults.length;

  return (
    <div className="space-y-1">
      <div className="text-zinc-500 text-xs mb-3 flex justify-between uppercase font-bold tracking-wider">
        <span>Result</span>
        <span>Status</span>
      </div>
      {testResults.map((test, idx) => (
        <div key={idx} className="group">
          <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors">
            <div className="flex items-center gap-3">
              {test.passed ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
                  <XCircle className="w-3 h-3" />
                </div>
              )}
              <span className={`${test.passed ? "text-zinc-300" : "text-rose-400"}`}>
                {test.name}
              </span>
            </div>
            <span
              className={`text-xs font-mono ${test.passed ? "text-emerald-500" : "text-rose-500"}`}
            >
              {test.passed ? "PASS" : "FAIL"}
            </span>
          </div>
          {test.error && (
            <div className="ml-8 mt-1 mb-2 p-2 text-rose-400/80 text-xs bg-rose-500/10 rounded border border-rose-500/20">
              <pre className="whitespace-pre-wrap">{test.error}</pre>
            </div>
          )}
        </div>
      ))}

      <div
        className={`mt-6 pt-4 border-t border-zinc-800 flex items-center gap-2 ${allPassed ? "text-emerald-400" : "text-rose-400"}`}
      >
        {allPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        <span className="font-bold">
          {allPassed
            ? `All Tests Passed: ${passedCount}/${testResults.length}`
            : `Tests Failed: ${testResults.length - passedCount}/${testResults.length}`}
        </span>
      </div>
    </div>
  );
}

function ConsoleView({
  logs,
  isRunning,
  status,
}: {
  logs: { type: string; message: string; timestamp?: string }[];
  isRunning: boolean;
  status: string;
}) {
  if (status === "idle" && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
        <Terminal className="w-8 h-8 opacity-50" />
        <span>Console output will appear here</span>
      </div>
    );
  }

  return (
    <div className="text-zinc-400 space-y-1">
      {logs.map((log, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <span
            className={`
            ${log.type === "info" ? "text-indigo-400" : ""}
            ${log.type === "error" ? "text-rose-400" : ""}
            ${log.type === "warn" ? "text-amber-400" : ""}
          `}
          >
            [{log.type}]
          </span>
          <span className={log.type === "error" ? "text-rose-300" : "text-zinc-300"}>
            {log.message}
          </span>
        </div>
      ))}
      {isRunning && <div className="text-zinc-600 animate-pulse">_</div>}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`pl-4 py-2 text-xs font-medium border-t-2 transition-colors cursor-pointer ${
        active
          ? "border-indigo-500 text-white bg-zinc-900"
          : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
      }`}
    >
      {children}
    </button>
  );
}
