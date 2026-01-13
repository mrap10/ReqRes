import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-zinc-950 pt-10 pb-10 border-t border-zinc-900 text-center text-zinc-500 text-sm">
      <p>
        &copy; {year} Reqres. <span className="mx-2">•</span> Built with ❤️ by{" "}
        <Link href={"https://github.com/mrap10"} className="text-indigo-400 hover:underline">
          mrap10
        </Link>
      </p>
    </footer>
  );
}
