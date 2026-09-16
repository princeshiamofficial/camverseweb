"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FAQ_ITEMS } from "@/data/audience";
import { LAUNCH_COUPON, PLANS } from "@/data/plans";
import { formatBDT } from "@/lib/format";
import { track } from "@/lib/analytics";
import { Icon } from "./icons";
import { Reveal, SectionHeading } from "./ui";
import { useCheckout } from "./checkout-context";

/* ------------------------------------------------------------------ */
/* Payment process                                                     */
/* ------------------------------------------------------------------ */
const PAYMENT_STEPS = [
  { step: "STEP 01", text: "Select Pro or Agency Plan." },
  { step: "STEP 02", text: "Select 1 Month or 3 Months." },
  { step: "STEP 03", text: "For 3 Months apply CAMVERSE3." },
  { step: "STEP 04", text: "Complete secure payment." },
  { step: "STEP 05", text: "Receive account access by email." },
];

const EMAIL_CONTENTS = [
  "CamVerse Login URL",
  "Username / Email",
  "Secure Account Setup Link",
  "Selected Plan",
  "Subscription Expiry Date",
  "Getting Started Instructions",
];

export function PaymentProcess() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            as="h2"
            title="Payment করার পর কী হবে?"
            description="Payment থেকে account access — পুরো process টি transparent এবং secure।"
          />
        </Reveal>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PAYMENT_STEPS.map((item, i) => (
            <Reveal key={item.step} delay={i * 80}>
              <li className="card card-hover relative h-full rounded-[1.25rem] p-5">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
                  {item.step}
                </span>
                <p className="mt-2 text-[15px] font-medium leading-relaxed text-slate-700">
                  {item.text}
                </p>
                {i < PAYMENT_STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm lg:flex"
                  >
                    <Icon name="arrow-right" size={12} />
                  </span>
                ) : null}
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={120}>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {/* visual flow */}
            <div className="card flex flex-col justify-center rounded-[1.4rem] bg-slate-50/70 p-7">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Visual flow
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {["Payment", "Email", "Login", "Create"].map((node, i) => (
                  <span key={node} className="flex items-center gap-2.5">
                    <span
                      className={`rounded-xl px-4 py-2 text-sm font-bold ${
                        i === 0
                          ? "bg-brand text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {node}
                    </span>
                    {i < 3 ? (
                      <span aria-hidden="true" className="text-slate-400">
                        →
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>
              <ul className="mt-6 space-y-2.5">
                {EMAIL_CONTENTS.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[15px] text-slate-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Icon name="check" size={12} strokeWidth={2.6} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* security note */}
            <div className="card flex flex-col justify-center rounded-[1.4rem] border-amber-200 bg-amber-50/60 p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Icon name="shield" size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                Security first
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
                আমরা কখনোই email-এ permanent plaintext password পাঠাই না।
                পরিবর্তে একটি secure, expiring{" "}
                <strong>&ldquo;Set Your Password&rdquo;</strong> link পাঠানো হয় —
                যেটি শুধু আপনি এবং শুধু একবার ব্যবহার করতে পারবেন।
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Icon name="lock" size={15} className="text-amber-700" />
                  One-time, expiring setup token
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="shield" size={15} className="text-amber-700" />
                  Password কখনো email-এ যায় না
                </li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* FAQ accordion                                                       */
/* ------------------------------------------------------------------ */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="section bg-slate-50/70 scroll-mt-24">
      <div className="container-page">
        <Reveal>
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              সচরাচর জিজ্ঞাসা
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              যেকোনো প্রয়োজনে আমাদের সাপোর্ট টিম আপনার পাশে আছে।
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-9 max-w-2xl space-y-2.5">
          {FAQ_ITEMS.map((item, i) => {
            const open = openIndex === i;
            return (
              <Reveal key={item.question} delay={i * 35}>
                <div className="card overflow-hidden rounded-xl border-slate-200/80 bg-white">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      onClick={() => setOpenIndex(open ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-sm sm:text-base font-bold text-slate-900 transition-colors hover:bg-slate-50/60"
                    >
                      <span>{item.question}</span>
                      <span
                        aria-hidden="true"
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 ${
                          open ? "rotate-180 bg-indigo-50 text-brand" : ""
                        }`}
                      >
                        <Icon name="chevron-down" size={13} />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    hidden={!open}
                    className="px-5 pb-4 text-xs sm:text-sm leading-relaxed text-slate-600"
                  >
                    {item.answer}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */
export function FinalCta() {
  const { openCheckout } = useCheckout();
  const router = useRouter();

  return (
    <section className="section bg-slate-950 text-white">
      <div className="container-page text-center max-w-2xl mx-auto">
        <Reveal>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300 mb-4">
            <Icon name="sparkles" size={12} className="text-indigo-400" />
            <span>Ready to upgrade your videos?</span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">
            Start Creating Studio-Quality Demos
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base text-slate-400 leading-relaxed">
            Record, auto-zoom, silky cursor physics, dynamic frames এবং AI captions এক অ্যাপেই।
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                track("pro_click", { location: "final_cta" });
                openCheckout("pro", "3m", LAUNCH_COUPON.code);
              }}
              className="btn btn-primary btn-lg w-full sm:w-auto shadow-md"
            >
              <Icon name="sparkles" size={16} />
              Get CamVerse Pro
            </button>
            <button
              type="button"
              onClick={() => {
                track("agency_click", { location: "final_cta" });
                openCheckout("agency", "3m", LAUNCH_COUPON.code);
              }}
              className="btn btn-secondary btn-lg w-full sm:w-auto bg-slate-900 text-white border-slate-800 hover:bg-slate-800"
            >
              <Icon name="building-2" size={16} />
              CamVerse Agency
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              track("free_click", { location: "final_cta" });
              router.push("/signup");
            }}
            className="mt-4 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors"
          >
            Start Free Plan →
          </button>
        </Reveal>
      </div>
    </section>
  );
}

