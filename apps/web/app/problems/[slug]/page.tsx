import ProblemHeader from "../../../components/ProblemHeader";
import LeftSideProblemsPage from "../../../components/LeftSideProblemsPage";
import { getProblemDetail } from "../../../actions";
import Link from "next/link";
import ProblemWorkspace from "../../../components/ProblemWorkspace";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const problemDetail = await getProblemDetail(slug);

  if (!problemDetail) {
    return (
      <div className="flex flex-col h-screen bg-zinc-950 text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
        <ProblemHeader title="Problem not found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Problem not found</h3>
            <p className="text-zinc-500 mb-4">
              The problem you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/problems" className="text-indigo-400 hover:text-indigo-300 font-medium">
              ← Back to problems
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      <ProblemHeader title={problemDetail.title} />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 min-w-100 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
          <LeftSideProblemsPage problemDetails={problemDetail} />
        </div>

        <ProblemWorkspace problemId={problemDetail.id} starterCode={problemDetail.starterCode} />
      </div>
    </div>
  );
}
