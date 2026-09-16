"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Icon, Logo } from "@/components/icons";
import { isDisposableByPattern, DISPOSABLE_EMAIL_ERROR_MESSAGE } from "@/lib/disposable-email-shared";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center bg-slate-50 text-slate-500">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTarget = searchParams.get("redirect");
  const plan = searchParams.get("plan") || "pro";
  const period = searchParams.get("period") || "1m";
  const coupon = searchParams.get("coupon");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const signupUrl = `/signup?${searchParams.toString()}`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isDisposableByPattern(email)) {
      setError(DISPOSABLE_EMAIL_ERROR_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.session) {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          if (redirectTarget === "checkout") {
            router.push(`/?checkout=true&plan=${plan}&period=${period}${coupon ? `&coupon=${coupon}` : ""}`);
          } else {
            router.push("/dashboard");
          }
        }, 600);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to log in. Please check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <Icon name="arrow-right" size={14} className="rotate-180" />
          <span>Back to CamVerse Home</span>
        </Link>

        <div className="card rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-9 shadow-xl">
          {/* Brand Logo */}
          <div className="flex items-center justify-center gap-2.5 font-display text-xl font-bold text-slate-900">
            <Logo />
            <span>
              Cam<span className="text-brand">Verse</span>
            </span>
          </div>

          <h1 className="mt-5 text-center font-display text-2xl font-bold text-slate-900">
            Welcome Back
          </h1>
          <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-600">
            আপনার CamVerse একাউন্টে লগইন করুন।
          </p>

          {/* Prompt if redirected for license purchase */}
          {redirectTarget === "checkout" && (
            <div className="mt-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 p-3.5 text-xs text-indigo-900 flex items-start gap-2.5">
              <Icon name="lock" size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">লাইসেন্স কেনার জন্য লগইন আবশ্যক</p>
                <p className="mt-0.5 text-indigo-700">
                  লগইন সম্পন্ন হওয়ার সাথে সাথে আপনি স্বয়ংক্রিয়ভাবে চেকআউট পেজে ফিরে যাবেন।
                </p>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {success && (
            <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs sm:text-sm text-emerald-800 flex items-center gap-2">
              <Icon name="check-circle" size={16} className="text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="mt-5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs sm:text-sm text-rose-700 flex items-center gap-2">
              <Icon name="alert-circle" size={16} className="text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="mt-5 space-y-4" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs sm:text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-[var(--primary-ring)]"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs sm:text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-[var(--primary-ring)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-md w-full text-sm font-bold shadow-md shadow-indigo-600/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <Icon name="lock" size={15} />
                  <span>Log In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs sm:text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href={signupUrl} className="font-bold text-brand hover:underline">
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
