import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface InstructionsRendererProps {
  instructions: string;
}

export default function InstructionsRenderer({ instructions }: InstructionsRendererProps) {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h3: ({ children }) => (
            <h4 className="text-sm font-bold text-white tracking-wider mt-6 mb-3 -ml-2 first:mt-0">
              {children}:
            </h4>
          ),
          h4: ({ children }) => (
            <h5 className="text-sm font-semibold text-zinc-200 mt-4">{children}</h5>
          ),
          p: ({ children }) => (
            <p className="text-sm text-zinc-400 leading-relaxed mb-1">{children}</p>
          ),
          ul: ({ children }) => <ul className="space-y-2 list-none pl-0 mb-4">{children}</ul>,
          li: ({ children }) => (
            <li className="flex items-start gap-3 text-sm text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <span>{children}</span>
            </li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-300 text-xs font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-zinc-900 p-4 rounded-lg text-zinc-300 text-xs font-mono overflow-x-auto">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 overflow-x-auto mb-4">
              {children}
            </pre>
          ),
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
