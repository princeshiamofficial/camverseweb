"use client";

import { Icon, type IconName } from "./icons";
import { Reveal } from "./ui";

const THREE_STEPS: Array<{
  step: string;
  icon: IconName;
  title: string;
  desc: string;
}> = [
  {
    step: "01",
    icon: "video",
    title: "Record Screen",
    desc: "যেকোনো উইন্ডো বা পুরো ডিসপ্লে নির্বাচন করে 60FPS-এ সহজে রেকর্ড করুন।",
  },
  {
    step: "02",
    icon: "sparkles",
    title: "Instant Auto-Polish",
    desc: "AI নিজে থেকেই মাউস ক্লিক জুম, কার্সার সোয়ে এবং বাংলা/ইংরেজি সাবটাইটেল বসিয়ে দেয়।",
  },
  {
    step: "03",
    icon: "download",
    title: "Export & Share",
    desc: "কোনো রেন্ডার ল্যাগ ছাড়াই 4K MP4, ProRes বা Looping GIF হিসেবে এক্সপোর্ট করুন।",
  },
];

export function Workflow() {
  return (
    <section id="how-it-works" className="section bg-slate-50/70 scroll-mt-24">
      <div className="container-page">
        <Reveal>
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              সহজ ৩টি ধাপে প্রিমিয়াম ভিডিও
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              জটিল ভিডিও এডিটিং সফটওয়্যার ছাড়াই মাত্র কয়েক মিনিটে প্রস্তুত।
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {THREE_STEPS.map((item, i) => (
            <Reveal key={item.step} delay={i * 90}>
              <div className="card h-full rounded-2xl bg-white p-6 sm:p-7 flex flex-col justify-between border-slate-200/80">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-brand font-bold">
                      <Icon name={item.icon} size={20} />
                    </span>
                    <span className="font-mono text-xs font-bold tracking-wider text-slate-400">
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {item.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

