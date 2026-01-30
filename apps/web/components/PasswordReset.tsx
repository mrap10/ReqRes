"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, KeyRound, Lock, ChevronLeft } from "lucide-react";
import AuthLeftSide from "@/components/AuthLeftSide";
import InputField from "@/components/InputField";
import { requestPasswordReset, resetPassword } from "@/lib/auth-client";

export default function PasswordReset() {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for token in URL (user clicked link in email)
  useEffect(() => {
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam === "INVALID_TOKEN") {
      setError("The reset link is invalid or has expired. Please request a new one.");
      setStep("email");
    } else if (token) {
      setStep("password");
    }
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email) {
      setError("Email is required");
      setIsLoading(false);
      return;
    }

    await requestPasswordReset(
      { email, redirectTo: `${window.location.origin}/reset-password` },
      {
        onSuccess: () => {
          setEmailSent(true);
          setIsLoading(false);
        },
        onError: (ctx: { error: { message?: string } }) => {
          setError(ctx.error.message || "Failed to send reset email. Please try again.");
          setIsLoading(false);
        },
      }
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      setError("Invalid reset token. Please request a new password reset.");
      return;
    }

    setIsLoading(true);

    await resetPassword(
      { newPassword, token },
      {
        onSuccess: () => {
          router.push("/signin");
        },
        onError: (ctx: { error: { message?: string } }) => {
          setError(ctx.error.message || "Password reset failed. Please try again.");
          setIsLoading(false);
        },
      }
    );
  };

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
          <Link
            href="/signin"
            className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-indigo-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {step === "email" && !emailSent && (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-zinc-400 text-sm">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-6">
                <InputField
                  type="email"
                  label="Email Address"
                  inputValue={email}
                  onchange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  disabled={isLoading}
                  placeholder="name@example.com"
                />

                {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 text-sm bg-indigo-500 hover:bg-indigo-600 cursor-pointer text-white font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.5)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          {step === "email" && emailSent && (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Check your inbox</h2>
                <p className="text-zinc-400 text-sm">
                  We sent a password reset link to{" "}
                  <span className="text-indigo-400 font-medium">{email}</span>
                </p>
                <p className="text-zinc-500 text-xs">
                  Click the link in the email to reset your password. If you don&apos;t see it,
                  check your spam folder.
                </p>
              </div>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEmailSent(false);
                    setError(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
                >
                  Didn&apos;t receive email? <span className="text-indigo-400">Try again</span>
                </button>
              </div>
            </>
          )}

          {step === "password" && (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">Set new password</h2>
                <p className="text-zinc-400 text-sm">
                  Choose a strong password to secure your account.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <InputField
                  type="password"
                  label="New Password"
                  inputValue={newPassword}
                  onchange={(e) => setNewPassword(e.target.value)}
                  icon={KeyRound}
                  disabled={isLoading}
                  placeholder="••••••••"
                />

                <InputField
                  type="password"
                  label="Confirm Password"
                  inputValue={confirmNewPassword}
                  onchange={(e) => setConfirmNewPassword(e.target.value)}
                  icon={Lock}
                  disabled={isLoading}
                  placeholder="********"
                />

                {error && <p className="text-xs text-red-500 text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 text-sm bg-indigo-500 hover:bg-indigo-600 cursor-pointer text-white font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.5)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
