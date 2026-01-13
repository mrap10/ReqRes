export default async function SubmissionPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
        Submission Page
      </h1>
      <p>{id}</p>
    </div>
  );
}
