"use client";

import { Icon } from "./icons";
import { LAUNCH_COUPON } from "@/data/plans";
import { track } from "@/lib/analytics";
import { Reveal } from "./ui";
import { useCheckout } from "./checkout-context";

export function BlastSale() {
  const { openCheckout } = useCheckout();

  const claim = () => {
    track("hero_cta_click", { location: "blast_sale" });
    // Opens checkout with the coupon pre-applied (server still validates it).
    openCheckout("pro", "3m", LAUNCH_COUPON.code);
  };

  return (
    <section aria-label="CamVerse Blast Sale" className="section bg-white">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900 px-6 py-12 text-white shadow-card sm:px-10 md:py-14">
            {/* decorative glow */}
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] [background-size:26px_26px]"
            />

            <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-300/30 px-3 py-1 text-xs font-bold text-amber-300 mb-3">
                  <Icon name="zap" size={13} />
                  SPECIAL LAUNCH EVENT
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  CAMVERSE BLAST SALE
                </h2>
                <p className="mt-3 font-display text-xl font-semibold text-indigo-200">
                  Get 3 Months. Pay Less. Create More.
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
                  3-Month Pro ও Agency plan-এ checkout-এ{" "}
                  <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">CAMVERSE3</strong> apply করলেই
                  সাথে সাথে discount।
                </p>
              </div>

              {/* coupon card */}
              <div className="shine w-full max-w-xs rounded-2xl border border-amber-300/40 bg-gradient-to-b from-amber-400/15 to-amber-400/5 p-5 backdrop-blur-sm">
                <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">
                  Special Launch Coupon
                </p>
                <p className="mt-2 text-center font-display text-4xl font-bold tracking-[0.12em] text-white font-mono">
                  {LAUNCH_COUPON.code}
                </p>
                <p className="mt-2 text-center text-[13px] font-semibold text-amber-200">
                  3-Month Plans Only
                </p>
                <button
                  type="button"
                  onClick={claim}
                  className="btn btn-md mt-4 w-full bg-amber-400 font-bold text-indigo-950 hover:bg-amber-300 shadow-lg"
                >
                  <Icon name="zap" size={16} />
                  Claim 3-Month Offer
                </button>
              </div>
            </div>

            <p className="relative mt-8 text-center text-xs text-slate-400">
              Limited-time promotional offer. Campaign availability এবং terms
              পরিবর্তিত হতে পারে।
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
