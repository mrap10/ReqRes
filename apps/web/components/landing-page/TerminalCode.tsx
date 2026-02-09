"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

type CodeToken = {
  text: string;
  className: string;
};

const codeLines: CodeToken[][] = [
  [
    { text: "app", className: "text-cyan-300" },
    { text: ".", className: "text-white/70" },
    { text: "get", className: "text-indigo-300" },
    { text: "(", className: "text-white/70" },
    { text: "'/orders/:id'", className: "text-emerald-300" },
    { text: ", ", className: "text-white/70" },
    { text: "authenticate", className: "text-cyan-200" },
    { text: ", ", className: "text-white/70" },
    { text: "async", className: "text-indigo-300" },
    { text: " (", className: "text-white/70" },
    { text: "req", className: "text-amber-200" },
    { text: ", ", className: "text-white/70" },
    { text: "res", className: "text-amber-200" },
    { text: ") => {", className: "text-white/70" },
  ],
  [
    { text: "  ", className: "text-white/70" },
    { text: "const", className: "text-indigo-300" },
    { text: " order = ", className: "text-white/70" },
    { text: "await", className: "text-indigo-300" },
    { text: " db.orders.", className: "text-white/70" },
    { text: "findById", className: "text-cyan-300" },
    { text: "(req.params.id);", className: "text-white/70" },
  ],
  [
    { text: "  ", className: "text-white/70" },
    { text: "if", className: "text-indigo-300" },
    { text: " (!order) ", className: "text-white/70" },
    { text: "return", className: "text-indigo-300" },
    { text: " res.status(", className: "text-white/70" },
    { text: "404", className: "text-rose-300" },
    { text: ").json({ error: ", className: "text-white/70" },
    { text: "'Not found'", className: "text-emerald-300" },
    { text: " });", className: "text-white/70" },
  ],
  [
    { text: "  ", className: "text-white/70" },
    { text: "return", className: "text-indigo-300" },
    { text: " res.status(", className: "text-white/70" },
    { text: "200", className: "text-emerald-300" },
    { text: ").json({ data: order, source: ", className: "text-white/70" },
    { text: "'cache'", className: "text-emerald-300" },
    { text: " });", className: "text-white/70" },
  ],
  [{ text: "});", className: "text-white/70" }],
];

function lineLength(tokens: CodeToken[]) {
  return tokens.reduce((sum, token) => sum + token.text.length, 0);
}

function renderTypedTokens(tokens: CodeToken[], charsVisible: number) {
  let remainingChars = charsVisible;

  return tokens.map((token, index) => {
    if (remainingChars <= 0) {
      return null;
    }

    const chunk = token.text.slice(0, remainingChars);

    if (!chunk) {
      return null;
    }

    remainingChars -= chunk.length;

    return (
      <span key={`${index}-${token.text}`} className={token.className}>
        {chunk}
      </span>
    );
  });
}

export default function TerminalCode({
  typingComplete,
  setTypingComplete,
}: {
  typingComplete: boolean;
  setTypingComplete: (value: boolean) => void;
}) {
  const [activeLine, setActiveLine] = useState(0);
  const [typedChars, setTypedChars] = useState<number[]>(() => new Array(codeLines.length).fill(0));

  useEffect(() => {
    if (typingComplete) {
      return;
    }

    const currentLine = codeLines[activeLine];
    if (!currentLine) return;

    const currentLineLength = lineLength(currentLine);
    const currentChars = typedChars[activeLine] ?? 0;
    let timer: ReturnType<typeof setTimeout>;

    if (currentChars < currentLineLength) {
      timer = setTimeout(() => {
        setTypedChars((prev) => {
          const next = [...prev];
          next[activeLine] = Math.min(currentLineLength, (prev[activeLine] ?? 0) + 1);
          return next;
        });
      }, 14);
    } else if (activeLine < codeLines.length - 1) {
      timer = setTimeout(() => {
        setActiveLine((prev) => prev + 1);
      }, 180);
    } else {
      timer = setTimeout(() => {
        setTypingComplete(true);
      }, 220);
    }

    return () => clearTimeout(timer);
  }, [activeLine, typedChars, typingComplete, setTypingComplete]);

  return (
    <>
      {codeLines.map((line, index) => {
        const isCurrentLine = index === activeLine && !typingComplete;
        const visibleChars = typedChars[index] ?? 0;

        return (
          <div key={`line-${index}`} className="min-h-5 leading-5">
            <span className="mr-3 text-white/35">{index + 1}</span>
            {renderTypedTokens(line, visibleChars)}
            {isCurrentLine && (
              <motion.span
                aria-hidden
                className="ml-0.5 inline-block h-3 w-px bg-cyan-200 align-middle"
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
