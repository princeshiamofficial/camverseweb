"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Icon, Logo } from "@/components/icons";
import { isDisposableByPattern, DISPOSABLE_EMAIL_ERROR_MESSAGE } from "@/lib/disposable-email-shared";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center bg-slate-50 text-slate-500">Loading signup...</div>}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTarget = searchParams.get("redirect");
  const plan = searchParams.get("plan") || "pro";
  const period = searchParams.get("period") || "1m";
  const coupon = searchParams.get("coupon");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loginUrl = `/login?${searchParams.toString()}`;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isDisposableByPattern(email)) {
      setError(DISPOSABLE_EMAIL_ERROR_MESSAGE);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1. Live dynamic email validation without hardcoded lists
      try {
        const checkRes = await fetch("/api/auth/validate-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const checkData = await checkRes.json();
        if (checkData.disposable) {
          setError(checkData.error || DISPOSABLE_EMAIL_ERROR_MESSAGE);
          setLoading(false);
          return;
        }
        if (checkData.error && checkData.valid === false) {
          setError(checkData.error);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback gracefully if network drops
      }
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        if (data.session) {
          // Logged in directly
          setSuccess("Account created successfully! Redirecting...");
          setTimeout(() => {
            if (redirectTarget === "checkout") {
              router.push(`/?checkout=true&plan=${plan}&period=${period}${coupon ? `&coupon=${coupon}` : ""}`);
            } else {
              router.push("/dashboard");
            }
          }, 800);
        } else {
          // Confirmation email sent
          setSuccess(
            "Account created! We have sent a confirmation link to your email. Please verify your email to continue."
          );
        }
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create account. Please try again.";
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
            Create Free Account
          </h1>
          <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-600">
            ফ্রি একাউন্ট দিয়ে CamVerse এক্সপ্লোর করুন — কোনো কার্ড লাগবে না।
          </p>

          {/* Prompt if redirected for license purchase */}
          {redirectTarget === "checkout" && (
            <div className="mt-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 p-3.5 text-xs text-indigo-900 flex items-start gap-2.5">
              <Icon name="lock" size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">লাইসেন্স কেনার জন্য অ্যাকাউন্ট আবশ্যক</p>
                <p className="mt-0.5 text-indigo-700">
                  অ্যাকাউন্ট তৈরি সম্পন্ন হলে সরাসরি চেকআউট এবং লাইসেন্স এক্টিভেশনে চলে যাবেন।
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-emerald-800 flex items-start gap-2.5">
              <Icon name="check-circle" size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Congratulations!</p>
                <p className="mt-0.5">{success}</p>
                <Link
                  href={loginUrl}
                  className="mt-2 inline-block font-bold text-emerald-700 underline"
                >
                  Proceed to Login ➔
                </Link>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs sm:text-sm text-rose-700 flex items-center gap-2">
              <Icon name="alert-circle" size={16} className="text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!success && (
            <form className="mt-6 space-y-4" onSubmit={handleSignup}>
              <div>
                <label
                  htmlFor="signup-name"
                  className="mb-1.5 block text-xs sm:text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-[var(--primary-ring)]"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="mb-1.5 block text-xs sm:text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>
                <input
                  id="signup-email"
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
                  htmlFor="signup-password"
                  className="mb-1.5 block text-xs sm:text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
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
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <Icon name="sparkles" size={15} />
                    <span>Create Free Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs sm:text-sm text-slate-600">
            Already have an account?{" "}
            <Link href={loginUrl} className="font-bold text-brand hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
