"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface InstructionsRendererProps {
  instructions: string;
}

export default function InstructionsRenderer({ instructions }: InstructionsRendererProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  let codeBlockIndex = 0;

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({ children }) => (
            <h4 className="text-sm font-bold text-white tracking-wider mt-6 mb-3 first:mt-0">
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h5 className="text-sm font-semibold text-zinc-200 mt-4">{children}</h5>
          ),
          p: ({ children }) => (
            <p className="text-sm text-zinc-400 leading-relaxed mb-2">{children}</p>
          ),
          ul: ({ children }) => <ul className="space-y-2 list-none pl-0 mb-4">{children}</ul>,
          ol: ({ children }) => (
            <ol className="space-y-2 list-decimal pl-5 mb-4 text-sm text-zinc-300">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-3 text-sm text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <span>{children}</span>
            </li>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            const language = className?.replace("language-", "") || "";

            if (!isBlock) {
              // Inline code
              return (
                <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-300 text-xs font-mono">
                  {children}
                </code>
              );
            }

            // Block code
            // const currentIndex = codeBlockIndex++;
            const codeText = String(children).replace(/\n$/, "");

            return (
              <code className="block text-zinc-300 text-xs font-mono" data-language={language}>
                {codeText}
              </code>
            );
          },
          pre: ({ children }) => {
            const currentIndex = codeBlockIndex++;
            const codeElement = children as React.ReactElement<{
              children: string;
              "data-language"?: string;
            }>;
            const codeContent = codeElement?.props?.children || "";
            const language = codeElement?.props?.["data-language"] || "";

            return (
              <div className="relative group mb-4">
                <div className="flex justify-between items-center text-zinc-500 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-t-lg border-b-0 text-xs">
                  <span className="uppercase tracking-wider">{language || "code"}</span>
                  <button
                    onClick={() => handleCopy(String(codeContent), currentIndex)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedIndex === currentIndex ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 hover:text-white cursor-pointer" />
                    )}
                  </button>
                </div>
                <pre className="bg-black/80 border border-zinc-800 rounded-b-lg p-4 overflow-x-auto">
                  {children}
                </pre>
              </div>
            );
          },
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-indigo-400 hover:text-indigo-300 underline">
              {children}
            </a>
          ),
        }}
      >
        {instructions}
      </ReactMarkdown>
    </div>
  );
}
