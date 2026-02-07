interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
}

export default function WorkflowStep({ number, title, description }: WorkflowStepProps) {
  return (
    <div className="relative pl-12 pb-12 border-l border-zinc-800 last:border-0">
      <div className="absolute -left-5 top-0 w-10 h-10 rounded-full bg-zinc-900 border-4 border-zinc-950 flex items-center justify-center z-10">
        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
          {number}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}
