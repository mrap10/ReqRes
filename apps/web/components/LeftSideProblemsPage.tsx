"use client";

import { AlertCircle, Check, Copy, Terminal, Code2 } from "lucide-react";
import { ProblemDetailDTO } from "@reqres/types";
import InstructionsRenderer from "./InstructionsRenderer";
import { useState, useMemo } from "react";
import DifficultyTag from "./DifficultyTag";

interface LeftSideProblemsPageProps {
  problemDetails: ProblemDetailDTO;
}

interface RequestData {
  method?: string;
  url?: string;
  curl?: string;
  body?: unknown;
  headers?: Record<string, string>;
  note?: string;
}

interface ResponseData {
  status?: string;
  body?: Record<string, unknown> | unknown[];
  headers?: Record<string, string>;
}

interface ParsedExample {
  name: string;
  request?: RequestData;
  response?: ResponseData;
}

function parseExamples(examples: unknown): ParsedExample[] {
  if (!examples) return [];

  let parsed = examples;
  if (typeof examples === "string") {
    try {
      parsed = JSON.parse(examples);
    } catch {
      return [];
    }
  }

  if (typeof parsed !== "object" || parsed === null) return [];

  const exampleObj = parsed as Record<string, unknown>;
  const results: ParsedExample[] = [];

  const requestObj = exampleObj.request as Record<string, unknown> | undefined;
  const responseObj = exampleObj.response as Record<string, unknown> | undefined;

  if (!requestObj) return [];

  if ("method" in requestObj || "curl" in requestObj) {
    // Single request/response format
    const successResponse = responseObj?.success as ResponseData | undefined;
    const errorResponse = responseObj?.error as ResponseData | undefined;

    results.push({
      name: "Request",
      request: requestObj as RequestData,
      response: successResponse || (responseObj as ResponseData | undefined),
    });

    if (errorResponse) {
      results.push({
        name: "Error Case",
        response: errorResponse,
      });
    }
  } else {
    // Multiple named examples (simple/nested, success/error, create/getAll/etc.)
    const requestKeys = Object.keys(requestObj);

    for (const key of requestKeys) {
      const req = requestObj[key] as RequestData | undefined;
      const res = responseObj?.[key] as ResponseData | undefined;

      if (req) {
        results.push({
          name: formatExampleName(key),
          request: req,
          response: res,
        });
      }
    }

    // for response-only entries (like notFound, error)
    if (responseObj) {
      const responseKeys = Object.keys(responseObj);
      for (const key of responseKeys) {
        if (!requestKeys.includes(key)) {
          const res = responseObj[key] as ResponseData | undefined;
          if (res) {
            results.push({
              name: formatExampleName(key),
              response: res,
            });
          }
        }
      }
    }
  }

  return results;
}

function formatExampleName(key: string): string {
  // camelCase/kebab-case to Title Case
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/-/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export default function LeftSideProblemsPage({ problemDetails }: LeftSideProblemsPageProps) {
  const parsedExamples = useMemo(
    () => parseExamples(problemDetails.examples),
    [problemDetails.examples]
  );

  const [copied, setCopied] = useState<string | null>(null);
  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  const isErrorResponse = (name: string): boolean => {
    const lowerName = name.toLowerCase();
    return lowerName.includes("error") || lowerName.includes("not found");
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          {problemDetails.title}
          {problemDetails.difficulty && <DifficultyTag level={problemDetails.difficulty} />}
        </h2>
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

      {parsedExamples.length > 0 && (
        <div>
          <h3 className="font-bold text-white tracking-wider mb-4 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            Example Usage
          </h3>
          <div className="space-y-6">
            {parsedExamples.map((example, idx) => (
              <div key={idx} className="space-y-3">
                {parsedExamples.length > 1 && (
                  <div className="text-sm font-semibold text-zinc-400 underline tracking-wider">
                    {example.name}
                  </div>
                )}

                <div className="font-mono text-xs space-y-3">
                  {example.request?.curl && (
                    <div>
                      <div className="flex justify-between items-center text-zinc-500 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-t-lg border-b-0">
                        <span>cURL Request</span>
                        <button onClick={() => handleCopy(example.request!.curl!, `curl-${idx}`)}>
                          {copied === `curl-${idx}` ? (
                            <Check className="w-3 h-3 text-emerald-400 cursor-pointer" />
                          ) : (
                            <Copy className="w-3 h-3 hover:text-white cursor-pointer" />
                          )}
                        </button>
                      </div>
                      <div className="bg-black p-4 rounded-b-lg border border-zinc-800 text-zinc-300 overflow-x-auto">
                        <pre className="whitespace-pre-wrap">
                          <span className="text-indigo-400">$</span> {example.request.curl}
                        </pre>
                      </div>
                    </div>
                  )}

                  {example.response && (
                    <div>
                      <div className="flex justify-between items-center text-zinc-500 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-t-lg border-b-0">
                        <span>Response</span>
                      </div>
                      <div className="bg-black p-4 rounded-b-lg border border-zinc-800 overflow-x-auto">
                        {example.response.status && (
                          <span
                            className={
                              isErrorResponse(example.name) ? "text-rose-400" : "text-emerald-400"
                            }
                          >
                            {example.response.status}
                          </span>
                        )}
                        {example.response.body !== undefined && (
                          <pre className="mt-2 text-zinc-300 whitespace-pre-wrap">
                            {String(JSON.stringify(example.response.body, null, 2))}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
