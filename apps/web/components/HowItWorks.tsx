import { Play } from "lucide-react";
import WorkflowStep from "./WorkflowStep";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Pick a Problem",
      description:
        "Choose from 15+ challenges ranging from 'Hello, Express!' to 'Implement GraphQL like Query API'.",
    },
    {
      number: 2,
      title: "Write Your Code",
      description:
        "No setup required. Our VS Code-like Editor comes pre-configured with Express and necessary dependencies.",
    },
    {
      number: 3,
      title: "Run & Validate",
      description:
        "Instantly run your code and see results. Our test suite fires requests at your server and validates the response headers, body, and status codes.",
    },
  ];
  return (
    <div className="py-24 bg-zinc-900 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-l from-zinc-800/20 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-12">
            The Flow is <span className="text-indigo-400">Simple</span>.
          </h2>
          <div className="space-y-2">
            {steps.map((step) => (
              <WorkflowStep
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-8 shadow-2xl relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-4">
                <div className="px-4 py-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-mono">
                  GET /api/users
                </div>
                <div className="px-4 py-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-mono">
                  Headers: Auth
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center cursor-pointer hover:bg-indigo-400 transition-colors shadow-lg shadow-indigo-500/20">
                <Play className="w-4 h-4 text-white fill-current" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-zinc-500 text-sm font-mono">
                <span>Request</span>
                <div className="h-px flex-1 bg-zinc-800 relative">
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-[shimmer_2s_infinite]" />
                </div>
              </div>

              <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="text-xs text-zinc-500 mb-2 font-bold tracking-wider">
                  Server Logs
                </div>
                <div className="font-mono text-sm text-emerald-400">
                  {`> listening on port 3000`} <br />
                  {`> GET /api/users 200 30ms`} <br />
                  <span className="text-zinc-400">{`> Verifying JSON structure... OK`}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-zinc-500 text-sm font-mono">
                <span className="w-16">Response</span>
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-emerald-400">200 OK</span>
              </div>
            </div>
          </div>
          {/* <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10" /> */}
        </div>
      </div>
    </div>
  );
}
// TODO: add animation for request to response flow
