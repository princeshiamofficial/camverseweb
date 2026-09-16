import type { Metadata } from "next";
import { Suspense } from "react";
import { consumeSetupToken } from "@/lib/payment-store";
import { SetupPasswordForm } from "./setup-password-form";

export const metadata: Metadata = {
  title: "Set Your Password",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valid = token ? consumeSetupToken(token) : null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md">
        {valid ? (
          <div className="card rounded-[1.5rem] p-8 shadow-card">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Set Your Password
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Welcome to CamVerse! <strong>{valid.email}</strong> — choose a
              strong password to activate your{" "}
              <strong>CamVerse {valid.planId === "agency" ? "Agency" : "Pro"}</strong>{" "}
              account.
            </p>
            <Suspense fallback={null}>
              <SetupPasswordForm />
            </Suspense>
          </div>
        ) : (
          <div className="card rounded-[1.5rem] p-8 text-center shadow-card">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Link Invalid or Expired
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              এই setup link টি ইতিমধ্যে ব্যবহার হয়ে গেছে বা ২৪ ঘণ্টা পেরিয়ে
              গেছে। নতুন link-এর জন্য support-এ যোগাযোগ করুন অথবা আবার login
              করার চেষ্টা করুন।
            </p>
            <a href="/login" className="btn btn-primary btn-md mt-6 w-full">
              Go to Login
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
