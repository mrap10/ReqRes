interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function FeatureCard({ title, desc, icon: Icon }: FeatureCardProps) {
  return (
    <div className="group p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 hover:bg-zinc-900 transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
        <Icon className="w-6 h-6 text-zinc-300 group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
