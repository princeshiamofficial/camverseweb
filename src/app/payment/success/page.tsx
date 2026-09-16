import type { Metadata } from "next";
import Link from "next/link";
import { PLANS, type PlanId } from "@/data/plans";
import { formatBDT } from "@/lib/format";
import { getSession } from "@/lib/payment-store";
import { ResendEmailButton } from "./resend-email-button";
import { Icon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Payment Successful",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface SearchParams {
  session?: string;
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { session: sessionId } = await searchParams;
  const session = sessionId ? getSession(sessionId) : undefined;

  // Unverified or unknown sessions get a neutral confirmation without plan data —
  // access is only ever granted through the webhook.
  const verified = session?.status === "paid";
  const plan = verified ? PLANS[session!.planId as PlanId] : null;
  const durationLabel =
    verified && session!.period === "3m" ? "3 Months" : "1 Month";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="card rounded-[1.75rem] p-8 text-center shadow-card">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Icon name="check" size={30} strokeWidth={2.4} />
          </span>

          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-slate-900">
            Welcome to CamVerse!
          </h1>
          <p className="mt-2 text-lg font-medium text-slate-600">
            {verified ? "Your payment was successful." : "Your payment is being confirmed."}
          </p>

          {verified && plan ? (
            <>
              <dl className="mt-7 space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-[15px]">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Plan</dt>
                  <dd className="font-bold text-slate-900">CamVerse {plan.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Duration</dt>
                  <dd className="font-bold text-slate-900">{durationLabel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Paid</dt>
                  <dd className="font-bold text-slate-900">{formatBDT(session!.amount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <span className="badge badge-success">PAID</span>
                  </dd>
                </div>
              </dl>

              <div className="mt-7 rounded-2xl border border-indigo-100 bg-brand-soft/60 p-5 text-left">
                <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                  <Icon name="mail" size={18} className="text-brand" />
                  Check Your Email
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  Your account access information has been sent to{" "}
                  <strong className="text-slate-800">{session!.email}</strong>.
                  Use the secure <strong>Set Your Password</strong> link inside —
                  it expires in 24 hours.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3">
                <Link href="/login" className="btn btn-primary btn-md w-full">
                  Open CamVerse →
                </Link>
                <ResendEmailButton sessionId={sessionId!} />
              </div>
            </>
          ) : (
            <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              আপনার payment verify হওয়ার সাথে সাথে email-এ account access পাঠানো
              হবে। কয়েক মিনিট অপেক্ষা করুন অথবা support-এ যোগাযোগ করুন।
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="font-semibold text-brand hover:underline">
            ← Back to CamVerse
          </Link>
        </p>
      </div>
    </main>
  );
}
