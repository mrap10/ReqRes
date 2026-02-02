"use client";

import { ProblemFormData } from "@/lib/types/problem-form";
import { AlertCircle, CheckCircle2, Code2 } from "lucide-react";
import { useState, useEffect } from "react";
import { InputGroup } from "./InputsAdmin";

interface ExamplesSectionProps {
  formData: ProblemFormData;
  onFieldChange: <K extends keyof ProblemFormData>(field: K, value: ProblemFormData[K]) => void;
}

export default function ExamplesSection({ formData, onFieldChange }: ExamplesSectionProps) {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState(formData.examples || "");

  // to sync local value when formData changes externally (e.g. reset)
  useEffect(() => {
    setLocalValue(formData.examples || "");
  }, [formData.examples]);

  const validateAndUpdateJson = (value: string) => {
    setLocalValue(value);

    if (!value.trim()) {
      setJsonError(null);
      onFieldChange("examples", "");
      return;
    }

    try {
      JSON.parse(value);
      setJsonError(null);
      onFieldChange("examples", value);
    } catch {
      setJsonError("Invalid JSON format");
    }
  };

  const formatJson = () => {
    if (!localValue.trim()) return;
    try {
      const parsed = JSON.parse(localValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setLocalValue(formatted);
      onFieldChange("examples", formatted);
      setJsonError(null);
    } catch {
      setJsonError("Cannot format - Invalid JSON");
    }
  };

  const isValidJson = !jsonError && localValue.trim();

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-400" />
          Examples
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={formatJson}
            className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-2 py-1 rounded border border-zinc-700 font-mono transition-colors"
          >
            Format JSON
          </button>
          {localValue.trim() && (
            <span
              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border font-mono ${
                isValidJson
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              {isValidJson ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" /> Invalid
                </>
              )}
            </span>
          )}
        </div>
      </div>

      <InputGroup
        label="Request/Response Schema"
        description="Define example requests and responses (see seed data for format)"
      >
        <textarea
          value={localValue}
          onChange={(e) => validateAndUpdateJson(e.target.value)}
          placeholder={`{
  "success": {
    "request": {
      "method": "GET",
      "url": "http://localhost:3000/",
      "curl": "curl -X GET http://localhost:3000/"
    },
    "response": {
      "status": "HTTP/1.1 200 OK",
      "body": "Hello, world!"
    }
  }
}`}
          rows={14}
          className={`w-full bg-zinc-950 border rounded-lg px-4 py-3 text-sm text-zinc-300 font-mono focus:outline-none transition-colors resize-y ${
            jsonError
              ? "border-rose-500/50 focus:border-rose-500"
              : "border-zinc-800 focus:border-indigo-500"
          }`}
        />
      </InputGroup>

      {jsonError && (
        <p className="mt-2 text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {jsonError}
        </p>
      )}
    </div>
  );
}
