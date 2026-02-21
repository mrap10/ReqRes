"use client";

import AuthLeftSide from "@/components/AuthLeftSide";
import InputField from "@/components/InputField";
import SocialButton from "@/components/SocialButton";
import { signIn, signUp, sendVerificationEmail } from "@/lib/auth-client";
import { Github, Lock, Mail, Terminal, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

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
      {
        email,
        password,
        name: username,
        username,
        callbackURL: `${window.location.origin}/verify-email`,
      } as Parameters<typeof signUp.email>[0],
      {
        onSuccess: () => {
          setShowVerificationScreen(true);
          setIsLoading(false);
        },
        onError: (ctx) => {
          setError(ctx.error.message || "An unexpected error occurred while signing up.");
          setIsLoading(false);
        },
      }
    );
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage("");
    setError("");

    await sendVerificationEmail(
      { email, callbackURL: `${window.location.origin}/verify-email` },
      {
        onSuccess: () => {
          setResendMessage("Verification email sent! Check your inbox.");
          setResendLoading(false);
        },
        onError: (ctx: { error: { message?: string } }) => {
          setError(ctx.error.message || "Failed to resend verification email.");
          setResendLoading(false);
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

  if (showVerificationScreen) {
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

          <div className="w-full max-w-md text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-indigo-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Please verify your email</h2>
              <p className="text-zinc-400 text-sm">You&apos;re almost there! We sent an email to</p>
              <p className="text-indigo-400 font-medium mt-1">{email}</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-left">
              <p className="text-zinc-300 text-sm">
                Just click on the link in that email to complete your signup. If you don&apos;t see
                it, you may need to{" "}
                <span className="font-semibold text-white">check your spam</span> folder.
              </p>
            </div>

            {resendMessage && (
              <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                {resendMessage}
              </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}

            <div className="pt-2">
              <p className="text-zinc-500 text-sm mb-3">
                Still can&apos;t find the email? No problem.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full py-3.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Wrong email?{" "}
              <button
                onClick={() => setShowVerificationScreen(false)}
                className="text-indigo-400 hover:underline cursor-pointer"
              >
                Go back
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AuthLeftSide />

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <Link
          href={"/"}
          className="absolute top-8 left-8 lg:left-12 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="text-xl font-bold text-white tracking-tight">
            Req
            <span className="bg-linear-to-r from-indigo-300 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
              Res
            </span>
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
              className="w-full py-3.5 text-sm bg-white/85 hover:bg-white text-black cursor-pointer font-bold rounded-xl"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-zinc-400">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-zinc-300 font-bold hover:text-cyan-50 transition-colors"
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
