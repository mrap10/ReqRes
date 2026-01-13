import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="mb-12 flex flex-row justify-between items-center gap-6">
          <div className="max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              View <span className="text-indigo-400">Problem</span>
            </h1>
            <p className="text-zinc-400 text-lg">Problem details for slug: {slug}</p>
          </div>
        </div>
        <div>{/* Other components for a problem goes here */}</div>
      </main>
      <Footer />
    </div>
  );
}

// maintaining layout consistency with other pages for now, but this page will have diff layout to other parent pages in future.
