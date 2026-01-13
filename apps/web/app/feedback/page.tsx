import Navbar from "../../components/Navbar";

export default function FeedbackPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="mb-12 flex flex-row justify-between items-center gap-6">
          <div className="max-w-5xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Submit <span className="text-indigo-400">Feedback</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              We value your input! Please share your thoughts, suggestions, or issues you have
              encountered while using ReqRes. Your feedback helps us improve and provide a better
              experience for all users.
            </p>
          </div>
        </div>
        <div>{/* Feedback content goes here */}</div>
      </main>
    </div>
  );
}
