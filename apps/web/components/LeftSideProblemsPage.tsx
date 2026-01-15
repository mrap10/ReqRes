"use client";

import { AlertCircle, Check, Copy, Terminal } from "lucide-react";
import { ProblemDetailDTO } from "@reqres/types";
import InstructionsRenderer from "./InstructionsRenderer";
import { useState } from "react";

interface LeftSideProblemsPageProps {
  problemDetails: ProblemDetailDTO;
}

interface ExampleData {
  request?: {
    method?: string;
    url?: string;
    curl?: string;
    body?: unknown;
    headers?: Record<string, string>;
    note?: string;
  };
  response?: {
    status?: string;
    body?: unknown;
  };
}

export default function LeftSideProblemsPage({ problemDetails }: LeftSideProblemsPageProps) {
  const examples = problemDetails.examples as Record<string, ExampleData> | undefined;
  const firstExample = examples
    ? examples.request
      ? { request: examples.request, response: examples.response }
      : Object.values(examples)[0]
    : null;

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText((firstExample as ExampleData).request?.curl || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };
  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">{problemDetails.title}</h2>
        <p className="text-zinc-400 leading-relaxed">{problemDetails.description}</p>
      </div>

      <div className="mb-8">
        <h3 className="font-bold text-white tracking-wider mb-4 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          Task
        </h3>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
          <InstructionsRenderer instructions={problemDetails.instructions} />
        </div>
      </div>

      {problemDetails.constraints && problemDetails.constraints.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-white tracking-wider mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Constraints
          </h3>
          <ul className="space-y-2">
            {problemDetails.constraints.map((constraint, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-2 shrink-0" />
                {constraint}
              </li>
            ))}
          </ul>
        </div>
      )}

      {firstExample && (
        <div>
          <h3 className="font-bold text-white tracking-wider mb-4">Example Usage</h3>
          <div className="font-mono text-xs">
            {(firstExample as ExampleData).request?.curl && (
              <>
                <div className="flex justify-between items-center text-zinc-500 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-t-lg border-b-0">
                  <span>cURL Request</span>
                  <button onClick={handleCopy}>
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-400 cursor-pointer" />
                    ) : (
                      <Copy className="w-3 h-3 hover:text-white cursor-pointer" />
                    )}
                  </button>
                </div>
                <div className="bg-black p-4 rounded-b-lg border border-zinc-800 text-zinc-300 mb-4 overflow-x-auto">
                  <span className="text-indigo-400">$</span>{" "}
                  {(firstExample as ExampleData).request?.curl}
                </div>
              </>
            )}

            {(firstExample as ExampleData).response && (
              <>
                <div className="flex justify-between items-center text-zinc-500 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-t-lg border-b-0">
                  <span>Response</span>
                </div>
                <div className="bg-black p-4 rounded-b-lg border border-zinc-800 text-emerald-400 overflow-x-auto">
                  <span className="opacity-50 text-zinc-300">
                    {(firstExample as ExampleData).response?.status}
                  </span>
                  <pre className="mt-2 text-zinc-300">
                    {JSON.stringify((firstExample as ExampleData).response?.body, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
