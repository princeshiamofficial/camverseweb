"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BILLING_PERIODS,
  LAUNCH_COUPON,
  PLANS,
  PLAN_ORDER,
  regularPrice,
  type BillingPeriod,
  type PlanId,
} from "@/data/plans";
import { COMPARISON_ROWS, type FeatureAvailability } from "@/data/features";
import { formatBDT } from "@/lib/format";
import { track } from "@/lib/analytics";
import { Icon } from "./icons";
import { Reveal } from "./ui";
import { useCheckout } from "./checkout-context";

function CellValue({ value }: { value: FeatureAvailability }) {
  if (value === true) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Icon name="check" size={12} strokeWidth={2.6} />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-300">
        <Icon name="close" size={11} strokeWidth={2.4} />
        <span className="sr-only">Not included</span>
      </span>
    );
  }
  return <span className="text-xs font-semibold text-slate-600">{value}</span>;
}

export function Pricing() {
  const [period, setPeriod] = useState<BillingPeriod>("1m");
  const { openCheckout } = useCheckout();
  const router = useRouter();

  const selectPeriod = (next: BillingPeriod) => {
    setPeriod(next);
    track("pricing_toggle", { period: next });
  };

  const openPlan = (planId: PlanId) => {
    if (planId === "free") {
      track("free_click");
      router.push("/signup");
      return;
    }
    track(planId === "pro" ? "pro_click" : "agency_click", { period });
    openCheckout(planId, period);
  };

  return (
    <section id="pricing" className="section bg-white scroll-mt-24">
      <div className="container-page">
        <Reveal>
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-0.5 text-xs font-semibold text-brand mb-3">
              <Icon name="zap" size={12} />
              <span>Coupon <strong className="font-mono">{LAUNCH_COUPON.code}</strong> available for 3-Month plans</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              সব plan-এ Bangla + English support। যেকোনো সময় upgrade করা যাবে।
            </p>
          </div>
        </Reveal>

        {/* Billing toggle */}
        <Reveal delay={70}>
          <div className="mt-8 flex justify-center px-2">
            <div
              role="radiogroup"
              aria-label="Billing period"
              className="relative grid w-full max-w-xs grid-cols-2 rounded-xl border border-slate-200 bg-slate-100/80 p-1"
            >
              {/* sliding indicator */}
              <span
                aria-hidden="true"
                className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow-xs transition-transform duration-200 ease-out ${
                  period === "3m" ? "translate-x-full" : "translate-x-0"
                }`}
              />
              {BILLING_PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={period === p.id}
                  onClick={() => selectPeriod(p.id)}
                  className={`relative z-10 flex items-center justify-center rounded-lg py-2 text-xs font-bold transition-colors ${
                    period === p.id ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Plan cards */}
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-3">
          {PLAN_ORDER.map((planId, i) => {
            const plan = PLANS[planId];
            const isPaid = planId !== "free";
            const regular = regularPrice(planId, period);
            const couponDiscount =
              isPaid && period === "3m" ? LAUNCH_COUPON.discount[planId] : 0;
            const total = regular - couponDiscount;
            const isPro = planId === "pro";

            return (
              <Reveal key={planId} delay={i * 80} className={isPro ? "lg:-mt-2" : ""}>
                <article
                  className={`card relative flex h-full flex-col rounded-2xl p-6 sm:p-7 ${
                    isPro
                      ? "border-2 border-brand shadow-lg bg-white"
                      : "bg-slate-50/50 border-slate-200/80"
                  }`}
                  aria-label={`${plan.name} plan`}
                >
                  {plan.popular ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                      Popular
                    </span>
                  ) : null}

                  <header>
                    <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                      {plan.name}
                    </h3>

                    {isPaid ? (
                      <>
                        <div className="mt-2.5 flex items-baseline gap-1">
                          <span className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                            {formatBDT(plan.monthlyPrice)}
                          </span>
                          <span className="text-xs font-medium text-slate-500">/mo</span>
                        </div>

                        {period === "3m" ? (
                          <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 text-xs">
                            <div className="flex items-center justify-between text-slate-500">
                              <span className="line-through">{formatBDT(regular)}</span>
                              <span className="font-bold text-emerald-600">Save {formatBDT(couponDiscount)}</span>
                            </div>
                            <p className="mt-0.5 font-display text-lg font-bold text-slate-900">
                              {formatBDT(total)} <span className="text-xs font-normal text-slate-500">total for 3 mo</span>
                            </p>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p className="mt-2.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                        ৳0
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-600">{plan.tagline}</p>

                    {planId === "agency" ? (
                      <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-brand">
                        <Icon name="users" size={13} /> Up to 5 Team Members
                      </p>
                    ) : null}
                  </header>

                  <ul className="mt-5 flex-1 space-y-2.5 text-xs sm:text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Icon name="check" size={10} strokeWidth={2.8} />
                        </span>
                        <span className="text-slate-700 leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    {isPaid ? (
                      <button
                        type="button"
                        onClick={() => openPlan(planId)}
                        className={`btn w-full ${isPro ? "btn-primary" : "btn-secondary"} btn-md text-xs sm:text-sm`}
                      >
                        {period === "3m"
                          ? `Get ${plan.name} (3 Mos)`
                          : `${plan.cta}`}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openPlan(planId)}
                        className="btn btn-secondary btn-md w-full text-xs sm:text-sm"
                      >
                        {plan.cta}
                      </button>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <ComparisonTable />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Comparison table                                                    */
/* ------------------------------------------------------------------ */
function ComparisonTable() {
  return (
    <Reveal delay={100}>
      <div className="mt-14 max-w-4xl mx-auto">
        <div className="text-center">
          <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            Feature Breakdown
          </h3>
          <p className="mt-1 text-xs text-slate-500 sm:hidden">
            👈 Swipe sideways to compare plans 👉
          </p>
        </div>

        <div className="card mt-4 overflow-hidden rounded-2xl p-0 border-slate-200/90 shadow-md">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full min-w-[520px] border-collapse text-left text-xs sm:text-sm">
              <caption className="sr-only">Feature comparison</caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90">
                  <th scope="col" className="sticky left-0 bg-slate-50/95 z-10 px-4 py-3.5 font-bold text-slate-900 shadow-[1px_0_0_0_#e2e8f0]">
                    Feature
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center font-bold text-slate-900">
                    Free
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center font-bold text-brand bg-indigo-50/50">
                    Pro
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-center font-bold text-slate-900">
                    Agency
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`border-b border-slate-100 ${i % 2 === 1 ? "bg-slate-50/40" : "bg-white"} hover:bg-indigo-50/20 transition-colors`}
                  >
                    <th scope="row" className={`sticky left-0 z-10 px-4 py-3 font-medium text-slate-800 shadow-[1px_0_0_0_#e2e8f0] ${i % 2 === 1 ? "bg-slate-50" : "bg-white"}`}>
                      {row.label}
                    </th>
                    <td className="px-4 py-3 text-center">
                      <CellValue value={row.free} />
                    </td>
                    <td className="bg-indigo-50/30 px-4 py-3 text-center font-medium">
                      <CellValue value={row.pro} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <CellValue value={row.agency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

