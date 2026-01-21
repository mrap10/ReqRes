import AuthLeftSide from "@/components/AuthLeftSide";
import InputField from "@/components/InputField";
import SocialButton from "@/components/SocialButton";
import { Github, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function SigninPage() {
  return (
    <div className="h-screen bg-zinc-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AuthLeftSide />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Link
          href={"/"}
          className="absolute top-8 left-8 lg:left-12 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-xl font-bold text-white tracking-tight">
            Req<span className="text-indigo-400">Res</span>
          </div>
        </Link>

        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-zinc-400 text-sm">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <div className="space-y-4">
            <SocialButton icon={Github} label="Continue with Github" />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-zinc-950 px-2 text-zinc-500 font-mono">
                  Or continue with email
                </span>
              </div>
            </div>
          </div>

          <form action="" className="space-y-6">
            <InputField
              label="Email Address"
              type="email"
              placeholder="youremail@example.com"
              icon={Mail}
            />
            <div className="space-y-2">
              <InputField label="Password" type="password" placeholder="********" icon={Lock} />
              <div className="flex justify-end">
                <Link href="#" className="text-xs text-indigo-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 text-sm bg-indigo-500 hover:bg-indigo-600 cursor-pointer text-white font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.5)] transition-all transform hover:scale-[1.02]"
            >
              Sign In
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-zinc-400">
              New to ReqRes?{" "}
              <Link
                href="/signup"
                className="text-zinc-300 font-bold hover:text-indigo-400 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
