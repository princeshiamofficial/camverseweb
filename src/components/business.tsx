import { AUDIENCES, BUSINESS_TEMPLATES } from "@/data/audience";
import { Icon, type IconName } from "./icons";
import { Reveal, SectionHeading } from "./ui";

/** CSS-painted mini template mockup — looks like a CamVerse template card, not a stock illustration. */
function TemplateMockup({ index }: { index: number }) {
  const t = BUSINESS_TEMPLATES[index];
  return (
    <article className="card card-hover w-60 shrink-0 overflow-hidden rounded-[1.25rem] p-0">
      {/* preview */}
      <div
        className="relative flex aspect-4/3 flex-col justify-between p-4"
        style={{
          background: `linear-gradient(135deg, ${t.tone}22 0%, ${t.tone}0d 55%, #ffffff 100%)`,
        }}
      >
        {/* brand header strip */}
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-700"
            style={{ backgroundColor: `${t.tone}26`, color: t.tone }}
            aria-hidden="true"
          >
            <Icon name={t.icon as IconName} size={14} />
          </span>
          <div>
            <div className="h-1.5 w-14 rounded-full" style={{ backgroundColor: t.tone }} />
            <div className="mt-1 h-1 w-9 rounded-full bg-slate-200" />
          </div>
        </div>
        {/* headline lines */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-4/5 rounded-full bg-slate-800/80" />
          <div className="h-2.5 w-3/5 rounded-full" style={{ backgroundColor: t.tone }} />
          <div className="h-1.5 w-2/5 rounded-full bg-slate-300" />
        </div>
        {/* CTA pill + QR hint */}
        <div className="flex items-center justify-between">
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: t.tone }}
          >
            {t.category}
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-[10px] text-slate-400">
            ▦
          </span>
        </div>
        {/* ratio chip */}
        <span className="absolute right-3 top-3 rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 backdrop-blur-sm">
          9:16
        </span>
      </div>
      <div className="border-t border-slate-100 px-4 py-3">
        <h3 className="text-[14px] font-bold leading-snug text-slate-800">{t.title}</h3>
        <p className="mt-0.5 text-xs text-slate-400">CamVerse Template</p>
      </div>
    </article>
  );
}

export function BusinessTemplates() {
  // Duplicate the list so the marquee loops seamlessly.
  const doubled = [...BUSINESS_TEMPLATES, ...BUSINESS_TEMPLATES];

  return (
    <section id="for-business" className="section overflow-hidden bg-slate-950 text-white scroll-mt-24">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow" style={{ color: "#a5b4fc" }}>
              Ready-to-Use Demo &amp; Video Templates
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.18] tracking-tight md:text-4xl lg:text-[2.6rem]">
              আপনার প্রোডাক্ট। আপনার ব্র্যান্ড। সিনেমাটিক ডেমো।
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300 md:text-lg">
              SaaS ওয়াকথ্রু, সফটওয়্যার লঞ্চ, কোডিং টিউটোরিয়াল, সোশ্যাল রিল কিংবা ক্লায়েন্ট পিচ—প্রতিটি
              ভিডিওর জন্য এডিটরের অপেক্ষা না করে প্রস্তুত টেমপ্লেট দিয়ে মুহূর্তেই তৈরি করুন আকর্ষণীয় প্রেজেন্টেশন।
            </p>
          </div>
        </Reveal>
      </div>

      {/* auto-scrolling template carousel */}
      <Reveal delay={120}>
        <div
          className="relative mt-12"
          role="region"
          aria-label="Business template previews"
        >
          {/* edge fades */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-slate-950 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-slate-950 to-transparent"
          />
          <div className="overflow-hidden py-2">
            <ul className="marquee-track flex w-max gap-5 px-5">
              {doubled.map((t, i) => (
                <li key={`${t.id}-${i}`}>
                  <div className="[&_.card]:bg-white">
                    <TemplateMockup index={i % BUSINESS_TEMPLATES.length} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <div className="container-page mt-9 text-center">
        <Reveal delay={180}>
          <a href="#pricing" className="btn btn-primary btn-md inline-flex">
            Explore Studio Templates <span aria-hidden="true">→</span>
          </a>
          <p className="mt-3 text-sm text-slate-400">
            Pro ও Agency plan-এ সব Premium SaaS, Launch &amp; Social Templates আনলক হয়ে যায়।
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function AudienceCards() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            as="h2"
            title="CamVerse কাদের জন্য?"
            description="আপনি যেই কাজই করুন — CamVerse-এর workflow আপনার content-কে দ্রুত ও professional করে তোলে।"
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.id} delay={(i % 5) * 60}>
              <article className="card card-hover flex h-full flex-col rounded-[1.25rem] p-5">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-brand"
                >
                  <Icon name={a.icon as IconName} size={20} />
                </span>
                <h3 className="mt-3.5 font-display text-[16px] font-bold leading-snug text-slate-900">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.useCase}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
