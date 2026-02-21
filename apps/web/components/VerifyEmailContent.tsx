"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import AuthLeftSide from "@/components/AuthLeftSide";

export default function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [countdown, setCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");

    if (error === "invalid_token") {
      setStatus("error");
      setErrorMessage("The verification link is invalid or has expired.");
    } else {
      setStatus("success");
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0) {
      router.push("/problems");
    }
  }, [status, countdown, router]);

  return (
    <div className="h-screen bg-zinc-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex">
      <AuthLeftSide />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
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

        <div className="w-full max-w-md">
          {status === "loading" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-zinc-800 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white">Verifying your email...</h2>
              <p className="text-zinc-400 text-sm">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
              <p className="text-zinc-400 text-sm">
                Your email has been successfully verified. You can now access all features.
              </p>
              <div className="pt-4">
                <p className="text-zinc-500 text-sm">
                  Redirecting in <span className="text-white font-bold">{countdown}</span>{" "}
                  seconds...
                </p>
                <div className="w-full bg-zinc-800 rounded-full h-2 mt-3">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
              <Link
                href="/problems"
                className="inline-block mt-4 text-sm text-white/85 hover:text-white transition-colors"
              >
                Go to Problems now →
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
              <p className="text-zinc-400 text-sm">{errorMessage}</p>
              <div className="pt-4 space-y-3">
                <Link
                  href="/signin"
                  className="block w-full py-3.5 text-sm bg-white/85 hover:bg-white text-black font-bold rounded-xl transition-all text-center"
                >
                  Go to Sign In
                </Link>
                <p className="text-xs text-zinc-500">
                  Need help?{" "}
                  <Link href="/feedback" className="text-cyan-400 hover:underline">
                    Contact support
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
