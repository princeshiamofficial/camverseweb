"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  BILLING_PERIODS,
  LAUNCH_COUPON,
  PLANS,
  regularPrice,
  type BillingPeriod,
  type PlanId,
} from "@/data/plans";
import { formatBDT } from "@/lib/format";
import { track } from "@/lib/analytics";
import { Icon } from "./icons";
import { useCheckout } from "./checkout-context";
import type { User } from "@supabase/supabase-js";

interface CouponState {
  status: "idle" | "checking" | "valid" | "invalid";
  discount: number;
  message?: string;
}

const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-[var(--primary-ring)]";

export function CheckoutModal() {
  const { open, planId, period, prefillCoupon, user, closeCheckout } = useCheckout();

  if (!open) return null;

  return (
    <CheckoutDialog
      key={`${planId}-${period}-${prefillCoupon ?? ""}-${user?.id ?? "anon"}`}
      planId={planId}
      initialPeriod={period}
      prefillCoupon={prefillCoupon}
      user={user}
      onClose={closeCheckout}
    />
  );
}

function CheckoutDialog({
  planId,
  initialPeriod,
  prefillCoupon,
  user,
  onClose,
}: {
  planId: PlanId;
  initialPeriod: BillingPeriod;
  prefillCoupon: string | null;
  user: User | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();

  const [selectedPlan, setSelectedPlan] = useState<PlanId>(planId);
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>(initialPeriod);
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [email] = useState(user?.email || "");
  const [coupon, setCoupon] = useState(prefillCoupon ?? "");
  const [couponState, setCouponState] = useState<CouponState>(
    prefillCoupon ? { status: "checking", discount: 0 } : { status: "idle", discount: 0 }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = PLANS[selectedPlan];
  const regular = regularPrice(selectedPlan, selectedPeriod);
  const discount = couponState.status === "valid" ? couponState.discount : 0;
  const total = Math.max(regular - discount, 0);

  // Debounced, server-side coupon validation
  const validateCouponNow = (code: string, currentPlan: PlanId, p: BillingPeriod) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = code.trim();
    if (!trimmed) {
      setCouponState({ status: "idle", discount: 0 });
      return;
    }
    setCouponState((s) => ({ ...s, status: "checking" }));
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/coupon/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: trimmed, planId: currentPlan, period: p }),
        });
        const data = (await res.json()) as {
          ok: boolean;
          discount: number;
          message?: string;
        };
        if (data.ok) {
          setCouponState({ status: "valid", discount: data.discount });
          track("coupon_apply", { code: trimmed.toUpperCase(), planId: currentPlan });
        } else {
          setCouponState({
            status: "invalid",
            discount: 0,
            message: data.message ?? "Invalid coupon code",
          });
        }
      } catch {
        setCouponState({
          status: "invalid",
          discount: 0,
          message: "Could not validate coupon",
        });
      }
    }, 300);
  };

  useEffect(() => {
    if (!prefillCoupon) return;

    let ignore = false;
    fetch("/api/coupon/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: prefillCoupon.trim(), planId, period: initialPeriod }),
    })
      .then((res) => res.json())
      .then((data: { ok: boolean; discount: number; message?: string }) => {
        if (ignore) return;
        if (data.ok) {
          setCouponState({ status: "valid", discount: data.discount });
          track("coupon_apply", { code: prefillCoupon.trim().toUpperCase(), planId });
        } else {
          setCouponState({
            status: "invalid",
            discount: 0,
            message: data.message ?? "Invalid coupon code",
          });
        }
      })
      .catch(() => {
        if (!ignore) {
          setCouponState({
            status: "invalid",
            discount: 0,
            message: "Could not validate coupon",
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [prefillCoupon, planId, initialPeriod]);

  const onPlanChange = (nextPlan: PlanId) => {
    setSelectedPlan(nextPlan);
    if (coupon.trim()) {
      validateCouponNow(coupon, nextPlan, selectedPeriod);
    }
  };

  const onPeriodChange = (p: BillingPeriod) => {
    setSelectedPeriod(p);
    if (coupon.trim()) {
      validateCouponNow(coupon, selectedPlan, p);
    }
  };

  const onCouponChange = (val: string) => {
    setCoupon(val);
    validateCouponNow(val, selectedPlan, selectedPeriod);
  };

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [onClose]);

  // If user is NOT logged in: Gate checkout with Account Required Screen
  if (!user) {
    const loginUrl = `/login?redirect=checkout&plan=${planId}&period=${initialPeriod}${
      prefillCoupon ? `&coupon=${prefillCoupon}` : ""
    }`;
    const signupUrl = `/signup?redirect=checkout&plan=${planId}&period=${initialPeriod}${
      prefillCoupon ? `&coupon=${prefillCoupon}` : ""
    }`;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-7 sm:p-9 shadow-2xl border border-slate-200/80 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100">
            <Icon name="lock" size={26} />
          </div>

          <h3 className="font-display text-2xl font-bold text-slate-900">
            Account Login Required
          </h3>

          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            CamVerse {plan.name} লাইসেন্স কেনার জন্য এবং লাইসেন্স কী আপনার অ্যাকাউন্টে সুরক্ষিতভাবে লিংক করার জন্য প্রথমে লগইন করা আবশ্যক।
          </p>

          <div className="mt-6 space-y-2.5">
            <Link
              href={loginUrl}
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Icon name="lock" size={16} />
              <span>Log In to Continue</span>
            </Link>

            <Link
              href={signupUrl}
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all"
            >
              <span>Create Free Account</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("আপনার পুরো নাম পূরণ করুন।");
      return;
    }

    setSubmitting(true);
    track("checkout_start", { planId: selectedPlan, period: selectedPeriod });
    track("payment_attempt", { planId: selectedPlan, period: selectedPeriod });

    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          period: selectedPeriod,
          fullName: fullName.trim(),
          email: user.email,
          userId: user.id,
          couponCode: coupon.trim() || null,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        redirectUrl?: string;
        error?: string;
      };
      if (data.ok && data.redirectUrl) {
        window.location.assign(data.redirectUrl);
      } else {
        setError(data.error ?? "Checkout session তৈরি করা যায়নি। আবার চেষ্টা করুন।");
        setSubmitting(false);
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-[1.5rem] bg-white shadow-2xl sm:rounded-[1.5rem]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <h2 id={titleId} className="font-display text-lg font-bold text-slate-900">
              Checkout — {plan.name} License
            </h2>
            <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              Verified Account
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-0 md:grid-cols-[1.15fr_1fr]">
          {/* Form column */}
          <div className="space-y-4 px-6 py-6">
            {/* Plan selector (Interactive Buttons) */}
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Plan</span>
              <div className="grid grid-cols-2 gap-2">
                {(["pro", "agency"] as PlanId[]).map((p) => {
                  const isSelected = selectedPlan === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onPlanChange(p)}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand bg-brand-soft text-brand-strong ring-2 ring-indigo-500/25 shadow-xs"
                          : "border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <span>{PLANS[p].name}</span>
                      <span>{formatBDT(PLANS[p].monthlyPrice)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Billing period select */}
            <div>
              <label htmlFor="billing-period" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Billing Period
              </label>
              <select
                id="billing-period"
                className={inputCls}
                value={selectedPeriod}
                onChange={(e) => onPeriodChange(e.target.value as BillingPeriod)}
              >
                {BILLING_PERIODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Verified Account Email (Bound to authenticated user) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="co-email" className="block text-sm font-semibold text-slate-700">
                  Licensed Account Email
                </label>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Icon name="check-circle" size={13} />
                  <span>Logged In</span>
                </span>
              </div>
              <input
                id="co-email"
                type="email"
                className={`${inputCls} bg-slate-50 text-slate-600 font-medium cursor-not-allowed`}
                value={user.email}
                readOnly
                required
              />
              <p className="mt-1 text-[11px] text-slate-500">
                লাইসেন্সটি এই একাউন্টে যুক্ত হবে এবং আপনার ড্যাশবোর্ডে থাকবে।
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="co-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                id="co-name"
                className={inputCls}
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Coupon input */}
            <div>
              <label htmlFor="co-coupon" className="mb-1.5 block text-sm font-semibold text-slate-700">
                Coupon Code
              </label>
              <div className="relative">
                <input
                  id="co-coupon"
                  className={`${inputCls} uppercase`}
                  placeholder="CAMVERSE3"
                  value={coupon}
                  onChange={(e) => onCouponChange(e.target.value)}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold">
                  {couponState.status === "checking" ? (
                    <span className="text-slate-400">Checking…</span>
                  ) : couponState.status === "valid" ? (
                    <span className="text-emerald-600">Applied</span>
                  ) : couponState.status === "invalid" ? (
                    <span className="text-red-600">Invalid</span>
                  ) : null}
                </span>
              </div>
              {couponState.status === "invalid" && couponState.message ? (
                <p className="mt-1.5 text-xs font-medium text-red-600">{couponState.message}</p>
              ) : null}
            </div>
          </div>

          {/* Summary column */}
          <aside className="rounded-b-[1.5rem] bg-slate-50 px-6 py-6 md:rounded-r-[1.5rem] md:rounded-bl-none flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                Order Summary
              </h3>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="font-display text-base font-bold text-slate-900">
                  CamVerse {plan.name}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedPeriod === "3m" ? "3 Months" : "1 Month"}
                  {selectedPlan === "agency" ? " • Up to 5 Team Members" : ""}
                </p>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Regular Price</dt>
                    <dd className="font-semibold text-slate-800">{formatBDT(regular)}</dd>
                  </div>
                  {discount > 0 ? (
                    <div className="flex justify-between text-emerald-600">
                      <dt>Coupon {LAUNCH_COUPON.code}</dt>
                      <dd className="font-semibold">-{formatBDT(discount)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-slate-100 pt-2.5 text-base">
                    <dt className="font-bold text-slate-900">Total</dt>
                    <dd className="font-display font-bold text-slate-900">{formatBDT(total)}</dd>
                  </div>
                </dl>
              </div>

              {error ? (
                <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-md w-full disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                {submitting ? (
                  "প্রসেসিং…"
                ) : (
                  <>
                    <Icon name="lock" size={15} />
                    <span>Pay {formatBDT(total)} Securely</span>
                  </>
                )}
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500 text-center">
                <Icon name="lock" size={13} />
                <span>Instant License delivery to {user.email}</span>
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
