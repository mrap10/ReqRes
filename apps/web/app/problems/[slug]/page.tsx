export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
        Problem Page
      </h1>
      <p className="text-lg text-zinc-400 mb-8 max-w-lg leading-relaxed">Problem {slug}</p>
    </div>
  );
}
