import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-zinc-950 py-10 space-y-2 border-t border-zinc-900 text-center text-zinc-500 text-sm">
      <p className="flex items-center justify-center gap-1 flex-wrap">
        &copy; {year}{" "}
        <span className="font-semibold text-white">
          Req<span className="text-indigo-400">Res</span>
        </span>{" "}
        <span className="mx-1">•</span>
        All rights reserved.
      </p>
      <p className="flex items-center gap-2 justify-center">
        Built with ❤️ by{" "}
        <Link href={"https://github.com/mrap10"} className="text-indigo-400 hover:underline">
          mrap10
        </Link>
      </p>
    </footer>
  );
}
