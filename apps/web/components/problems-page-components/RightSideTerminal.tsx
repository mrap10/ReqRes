"use client";

import {
  Check,
  CheckCircle2,
  PanelBottomClose,
  PanelBottomOpen,
  Terminal,
  XCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSubmission } from "../../lib/providers/SubmissionProvider";

const DEFAULT_HEIGHT = 200;
const HEADER_HEIGHT = 40;

export default function RightSideTerminal() {
  const { submission } = useSubmission();
  const [activeTab, setActiveTab] = useState<"tests" | "console">("console");
  const [mounted, setMounted] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState<number>(DEFAULT_HEIGHT);
  const [lastHeight, setLastHeight] = useState<number>(DEFAULT_HEIGHT);

  const isRunning = submission.status === "pending" || submission.status === "running";
  const hasResults = submission.testResults.length > 0;
  const passedTests = submission.testResults.filter((t) => t.passed).length;
  const totalTests = submission.testResults.length;

  const isResizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hasResults) {
      setActiveTab("tests");
      setTerminalHeight(DEFAULT_HEIGHT);
    }
  }, [hasResults]);

  useEffect(() => {
    if (!mounted) return;

    if (submission.status === "pending") {
      setActiveTab("console");
      setTerminalHeight(DEFAULT_HEIGHT);
    }
  }, [submission.status, mounted]);

  const onMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.classList.add("resizing");

    isResizingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = terminalHeight;

    window.addEventListener("mousemove", onMouseMoveResize);
    window.addEventListener("mouseup", onMouseUpResize);
  };

  const onMouseMoveResize = (e: MouseEvent) => {
    document.body.classList.add("resizing");
    if (!isResizingRef.current) return;

    const delta = startYRef.current - e.clientY;
    const newHeight = Math.min(500, Math.max(80, startHeightRef.current + delta));
    setTerminalHeight(newHeight);
  };

  const onMouseUpResize = () => {
    isResizingRef.current = false;
    setLastHeight(terminalHeight);

    window.removeEventListener("mousemove", onMouseMoveResize);
    window.removeEventListener("mouseup", onMouseUpResize);
  };

  return (
    <div
      className="border-t border-zinc-800 bg-zinc-900 flex flex-col shrink-0 min-h-10"
      style={{ height: HEADER_HEIGHT + terminalHeight }}
    >
      <div
        className="cursor-row-resize bg-zinc-800 hover:bg-zinc-700 transition-colors"
        style={{ height: 4 }}
        onMouseDown={onMouseDownResize}
      />
      <div className="h-10 flex items-center justify-between px-2 bg-zinc-900 shrink-0">
        <div className="flex h-full">
          <TabButton
            active={activeTab === "tests"}
            onClick={() => {
              setActiveTab("tests");
              setTerminalHeight(DEFAULT_HEIGHT);
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
              setTerminalHeight(DEFAULT_HEIGHT);
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
            onClick={() =>
              setTerminalHeight((h) => {
                if (h === 0) return lastHeight;
                setLastHeight(h);
                return 0;
              })
            }
            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 cursor-pointer"
          >
            {terminalHeight > 0 ? (
              <PanelBottomClose className="w-4 h-4" />
            ) : (
              <PanelBottomOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div
        className="overflow-y-auto p-4 font-mono text-sm bg-zinc-950/50 transition-[height] duration-200"
        style={{ height: terminalHeight }}
      >
        {terminalHeight > 0 &&
          (activeTab === "tests" ? (
            <TestResultsView
              testResults={submission.testResults}
              isRunning={isRunning}
              status={submission.status}
            />
          ) : (
            <ConsoleView logs={submission.logs} isRunning={isRunning} status={submission.status} />
          ))}
      </div>
    </div>
  );
}

interface TestResultItem {
  name: string;
  passed: boolean;
  error?: string;
  index?: number;
  location?: {
    line: number;
    column: number;
  };
}

const VISIBLE_TEST_LIMIT = 10;

function TestResultsView({
  testResults,
  isRunning,
  status,
}: {
  testResults: TestResultItem[];
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
        Hang tight! Running tests...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-rose-500 gap-2">
        <XCircle className="w-8 h-8" />
        <span className="font-bold">Execution Error</span>
        <span className="text-sm text-zinc-400">0 test cases passed due to error</span>
        <span className="text-xs text-zinc-500">Check console for details</span>
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
  const totalTests = testResults.length;
  const hasHiddenTests = totalTests > VISIBLE_TEST_LIMIT;

  let testsToDisplay: TestResultItem[] = [];
  let hiddenPassedCount = 0;
  let hiddenFailedTests: TestResultItem[] = [];

  if (hasHiddenTests) {
    const visibleTests = testResults.slice(0, VISIBLE_TEST_LIMIT);
    const hiddenTests = testResults.slice(VISIBLE_TEST_LIMIT);

    hiddenFailedTests = hiddenTests.filter((t) => !t.passed);
    hiddenPassedCount = hiddenTests.filter((t) => t.passed).length;

    testsToDisplay = [...visibleTests, ...hiddenFailedTests];
  } else {
    testsToDisplay = testResults;
  }

  return (
    <div className="space-y-1">
      <div className="text-zinc-500 text-xs mb-3 flex justify-between uppercase font-bold tracking-wider">
        <span>Result</span>
        <span>Status</span>
      </div>
      {testsToDisplay.map((test, idx) => {
        const isFromHiddenSection =
          hasHiddenTests && !test.passed && (test.index ?? idx) >= VISIBLE_TEST_LIMIT;

        return (
          <div key={test.index ?? idx} className="group">
            <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors">
              <div className="flex items-center gap-3">
                {test.passed ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-3" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
                    <XCircle className="w-3 h-3" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className={`${test.passed ? "text-zinc-300" : "text-rose-400"}`}>
                    {isFromHiddenSection && (
                      <span className="text-amber-500 text-xs mr-2">
                        [Hidden #{(test.index ?? idx) + 1}]
                      </span>
                    )}
                    {test.name}
                  </span>
                  {test.location && !test.passed && (
                    <span className="text-xs text-zinc-500">
                      Line {test.location.line}, Column {test.location.column}
                    </span>
                  )}
                </div>
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
        );
      })}

      {hasHiddenTests && hiddenPassedCount > 0 && (
        <div className="mt-3 p-3 rounded bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              +{hiddenPassedCount} hidden test{hiddenPassedCount > 1 ? "s" : ""} passed
            </span>
          </div>
        </div>
      )}

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
      className={`px-4 min-w-30 h-full text-xs font-medium border-t-2 transition-colors cursor-pointer ${
        active
          ? "border-indigo-500 text-white bg-zinc-950"
          : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
      }`}
    >
      {children}
    </button>
  );
}
