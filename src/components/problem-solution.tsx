import { FEATURES } from "@/data/features";
import { Reveal, SectionHeading } from "./ui";
import { Icon, type IconName } from "./icons";

export function ProblemSolution() {
  const without = [
    "কাঁচা স্ক্রিন রেকর্ড নিয়ে ভিডিও এডিটরে ঘণ্টার পর ঘণ্টা কি-ফ্রেম করা",
    "ম্যানুয়াল জুম ও প্যান করতে গিয়ে পুরো দিন নষ্ট",
    "কার্সারের ঝাঁকুনি ও অগোছালো ড্র্যাগিং",
    "ডিভাইস ফ্রেম, শ্যাডো ও ব্যাকগ্রাউন্ডের জন্য গ্রাফিক ডিজাইনারের সাহায্য নেওয়া",
    "ওয়েবক্যাম ও স্ক্রিন আলাদাভাবে সিঙ্ক করতে ভোগান্তি",
    "সোশ্যাল মিডিয়ার জন্য আলাদা আলাদা সাইজে রি-এডিট করা",
  ];

  const withCamVerse = [
    "নেটিভ 4K 60FPS স্ক্রিন ক্যাপচার (Zero Lag)",
    "অটো-জুম ও স্মার্ট কার্সার ট্র্যাকিং (AI Focus)",
    "সিল্কি স্মুথ কার্সার ফিজিক্স, মোশন ব্লার ও ক্লিক অ্যানিমেশন",
    "স্টুডিও গ্রেড ডাইনামিক ব্যাকগ্রাউন্ড, শ্যাডো ও ফ্রেম প্যাডিং",
    "পিকচার-ইন-পিকচার ডাইনামিক ওয়েবক্যাম বাবল",
    "বাংলা + ইংলিশ অটো সাবটাইটেল ও ইনস্ট্যান্ট 4K MP4 / GIF এক্সপোর্ট",
  ];

  return (
    <section id="features" className="section bg-slate-50 scroll-mt-24">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            as="h2"
            title="স্ক্রিন রেকর্ড ও প্রোডাক্ট ডেমো বানাতে কি অনেক সময় চলে যাচ্ছে?"
            description="সাধারণ ভিডিও এডিটরে ঘণ্টার পর ঘণ্টা নষ্ট না করে CamVerse-এর স্মার্ট অটোমেশন দিয়ে মিনিটেই স্টুডিও-কোয়ালিটি ভিডিও তৈরি করুন।"
          />
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Without */}
          <Reveal delay={60}>
            <div className="card h-full rounded-[1.4rem] border-slate-200 bg-white p-7 md:p-9">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Traditional Recording &amp; Editing
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                ম্যানুয়াল এডিটিং, প্রচুর সময় নষ্ট
              </h3>
              <ul className="mt-6 space-y-3.5">
                {without.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <svg
                        viewBox="0 0 24 24"
                        width="12"
                        height="12"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M6 6l12 12M18 6 6 18" />
                      </svg>
                    </span>
                    <span className="text-[15px] leading-snug text-slate-500">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* With */}
          <Reveal delay={140}>
            <div className="relative h-full rounded-[1.4rem] border-2 border-brand bg-white p-7 shadow-card md:p-9">
              <span className="absolute right-5 top-5 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-strong">
                All-in-One Studio
              </span>
              <p className="text-sm font-bold uppercase tracking-widest text-brand">
                With CamVerse Studio
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                একটি অ্যাপেই সম্পূর্ণ প্রো-লেভেল আউটপুট
              </h3>
              <ul className="mt-6 space-y-3.5">
                {withCamVerse.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <svg
                        viewBox="0 0 24 24"
                        width="12"
                        height="12"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m4.5 12.5 5 5L19.5 7" />
                      </svg>
                    </span>
                    <span className="text-[15px] font-medium leading-snug text-slate-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="mt-10 text-center">
            <p className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              One Platform. One Workflow.{" "}
              <span className="text-brand">More Content.</span>
            </p>
            <a
              href="#feature-grid"
              className="btn btn-primary btn-md mt-7 inline-flex"
            >
              Explore CamVerse Features <span aria-hidden="true">→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FeatureGrid() {
  return (
    <section id="feature-grid" className="section bg-white scroll-mt-24">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            as="h2"
            title="আপনার পুরো Content Studio — এক জায়গায়"
            description="Recording থেকে Publishing — CamVerse-এর প্রতিটি ফিচার একটি সম্পূর্ণ workflow তৈরি করে।"
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.id} delay={(i % 3) * 70}>
              <article className="card card-hover group h-full rounded-[1.25rem] p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon name={feature.icon as IconName} size={22} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
