import { Code2, PlayCircle, CheckCircle2, ShieldCheck, Container, Zap } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function Features() {
  const features = [
    {
      icon: Code2,
      title: "Express.js Challenges",
      desc: "Solve real-world backend problems. Build REST APIs, middleware chains, authentication systems, and more.",
    },
    {
      icon: PlayCircle,
      title: "Instant Execution",
      desc: "Write, run, and test your code in seconds. Real-time feedback via Server-Sent Events as your code executes.",
    },
    {
      icon: CheckCircle2,
      title: "Automated Testing",
      desc: "Every submission runs against comprehensive test suites. Get detailed results with pass/fail status for each test case.",
    },
    {
      icon: ShieldCheck,
      title: "Production Patterns",
      desc: "Master JWT authentication, rate limiting, CORS, input validation, error handling, and caching strategies.",
    },
    {
      icon: Container,
      title: "Sandboxed Execution",
      desc: "Your code runs in isolated Docker containers. Safe, secure, and scalable execution environment for all submissions.",
    },
    {
      icon: Zap,
      title: "Queue-Based Processing",
      desc: "BullMQ + Redis handle submission spikes gracefully. Scale to 100+ concurrent users without breaking a sweat.",
    },
  ];
  return (
    <div className="py-24 bg-zinc-950 border-t border-white/5">
      <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-l from-zinc-800/20 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Not just syntax. <br />
            <span className="text-indigo-400">Architecture.</span>
          </h2>
          <p className="text-zinc-400 text-lg">
            ReqRes focuses on the hard parts of backend development. Leave the &quot;Hello
            World&quot; tutorials behind.
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mx-5">
        {features.map((feature, index) => (
          <FeatureCard key={index} title={feature.title} desc={feature.desc} icon={feature.icon} />
        ))}
      </div>
    </div>
  );
}
