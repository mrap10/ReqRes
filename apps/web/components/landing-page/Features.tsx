import FeatureCard, { IconKey } from "../FeatureCard";

export default function Features() {
  const features: {
    icon: IconKey;
    title: string;
    desc: string;
  }[] = [
    {
      icon: "Code2",
      title: "Express.js Challenges",
      desc: "Solve real-world backend problems. Build REST APIs, middleware chains, authentication systems, and more.",
    },
    {
      icon: "PlayCircle",
      title: "Instant Execution",
      desc: "Write, run, and test your code in seconds. Real-time feedback via SSE as your code executes.",
    },
    {
      icon: "Gamepad2",
      title: "Gamified Learning",
      desc: "Earn XP, level up, and track your progress as you conquer challenges. Compete on leaderboards and unlock achievements.",
    },
    {
      icon: "ShieldCheck",
      title: "Production Patterns",
      desc: "Master JWT authentication, rate limiting, CORS, input validation, error handling, and caching strategies.",
    },
    {
      icon: "CheckCircle2",
      title: "Automated Testing",
      desc: "Every submission runs against comprehensive test suites. Get detailed results with pass/fail status.",
    },
    {
      icon: "Container",
      title: "Sandboxed Execution",
      desc: "Your code runs in isolated Docker containers. Safe, secure, and scalable execution environment for all submissions.",
    },
  ];
  return (
    <div className="mt-24 mx-auto w-full max-w-6xl px-4">
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Not just syntax.{" "}
            <span className="bg-linear-to-r from-indigo-300 to-cyan-200 bg-clip-text text-transparent">
              Architecture
            </span>
          </h2>
          <p className="text-zinc-400">
            ReqRes focuses on the hard parts of backend development. Leave the &quot;Hello
            World&quot; tutorials behind.
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            index={index}
            title={feature.title}
            desc={feature.desc}
            icon={feature.icon}
          />
        ))}
      </div>
    </div>
  );
}
