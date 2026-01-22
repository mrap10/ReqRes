"use client";

import AuthLeftSide from "@/components/AuthLeftSide";
import InputField from "@/components/InputField";
import SocialButton from "@/components/SocialButton";
import { signIn, signUp } from "@/lib/auth-client";
import { Github, Lock, Mail, Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password || !username) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    await signUp.email(
      { email, password, name: username, username } as Parameters<typeof signUp.email>[0],
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx) => {
          setError(ctx.error.message || "An unexpected error occurred while signing up.");
          setIsLoading(false);
        },
      }
    );
  };

  const handleSocialLogin = async (provider: "github") => {
    setIsLoading(true);
    await signIn.social(
      {
        provider,
        callbackURL: "http://localhost:3000/problems",
        errorCallbackURL: "http://localhost:3000/signup",
      },
      {
        onError: (ctx) => {
          setError(ctx.error.message || "An unexpected error occurred.");
          setIsLoading(false);
        },
      }
    );
  };
  return (
    <div className="h-screen bg-zinc-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AuthLeftSide />

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
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
            <h2 className="text-2xl font-bold text-white mb-2">Create account</h2>
            <p className="text-zinc-400 text-sm">Start your journey to backend mastery today.</p>
          </div>

          <div className="space-y-4">
            <SocialButton
              onclick={() => handleSocialLogin("github")}
              disabled={isLoading}
              icon={Github}
              label="Continue with Github"
            />
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

          <form action="" onSubmit={handleSignup} className="space-y-4">
            <InputField
              type="text"
              label="Username"
              inputValue={username}
              onchange={(e) => setUsername(e.target.value)}
              icon={Terminal}
              placeholder="andrew45"
            />
            <InputField
              type="email"
              label="Email Address"
              inputValue={email}
              onchange={(e) => setEmail(e.target.value)}
              icon={Mail}
              placeholder="youremail@example.com"
            />
            <InputField
              type="password"
              label="Password"
              inputValue={password}
              onchange={(e) => setPassword(e.target.value)}
              icon={Lock}
              placeholder="********"
            />
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 text-sm bg-indigo-500 hover:bg-indigo-600 cursor-pointer text-white font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.5)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-zinc-300 font-bold hover:text-indigo-400 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
