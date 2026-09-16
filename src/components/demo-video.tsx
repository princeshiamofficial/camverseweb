"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { Icon } from "./icons";
import { Reveal, SectionHeading } from "./ui";

const WORKFLOW_CHIPS = [
  "Native 4K Record",
  "Auto-Zooms",
  "Cursor Smoothing",
  "Webcam Bubble",
  "Studio Framing",
  "AI Subtitle",
  "4K / 60FPS GIF Export",
];

const FEATURE_SPOTLIGHTS = [
  {
    id: "auto-zoom",
    badge: "Auto-Zooms & Framing",
    title: "কার্সার ফলো করে স্বয়ংক্রিয় স্মার্ট জুম",
    description:
      "ম্যানুয়াল কি-ফ্রেম বা জটিল ভিডিও এডিটিং ছাড়া স্বয়ংক্রিয়ভাবে আপনার অ্যাকশন ও ক্লিকে স্মুথ জুম ইন/আউট করে।",
    media: "/media/feature1.gif",
    tag: "Smart Focus",
  },
  {
    id: "webcam",
    badge: "Dynamic Webcam Bubble",
    title: "ইন্টারেক্টিভ ফ্লোটিং ওয়েবক্যাম বাবল",
    description:
      "যেকোনো পজিশনে ওয়েবক্যাম সেট করুন, মিরর করুন, ড্রপ শ্যাডো ও রাউন্ডনেস কন্ট্রোল করুন। জুমের সাথে ওয়েবক্যাম অটো-ব্যালান্স হয়।",
    media: "/media/feature2.gif",
    tag: "Picture-in-Picture",
  },
  {
    id: "cursor",
    badge: "Silky Cursor Physics",
    title: "স্মুথ কার্সার মোশন ও ক্লিক অ্যানিমেশন",
    description:
      "কার্সার জার্ক দূর করে রিয়েল-টাইম মোশন ব্লার, ক্লিক বাউন্স, স্মুথ সোয়ে এবং লুপ মোড দিয়ে প্রফেশনাল ফিল তৈরি করে।",
    media: "/media/CursorSwayDemo.gif",
    tag: "60 FPS Motion",
  },
  {
    id: "timeline",
    badge: "Demo-Focused Timeline",
    title: "সহজ ড্র্যাগ-অ্যান্ড-ড্রপ টাইমলাইন এডিটর",
    description:
      "ক্লিপ ট্রিম, স্পিড র‍্যাম্প (ফাস্ট/স্লো মোশন), অডিও লেয়ার এবং অ্যানোটেশন যোগ করুন নিমেষেই।",
    media: "/media/feature3.png",
    tag: "Timeline Control",
  },
];

export function DemoVideo() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section id="demo" className="section scroll-mt-24 bg-white">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            as="h2"
            title="একটি প্ল্যাটফর্মেই সম্পূর্ণ স্ক্রিন রেকর্ডিং ও স্টুডিও ওয়ার্কফ্লো"
            description="স্ক্রিন ও ওয়েবক্যাম রেকর্ড থেকে শুরু করে অটো-জুম, কার্সার পলিশ ও ফ্রেম স্টাইলিং — সব কিছু এক অ্যাপে।"
          />
        </Reveal>

        {/* workflow chips */}
        <Reveal delay={80}>
          <ol className="mx-auto mt-7 flex max-w-4xl flex-wrap items-center justify-center gap-2">
            {WORKFLOW_CHIPS.map((chip, i) => (
              <li key={chip} className="flex items-center gap-2">
                <span className="rounded-full border border-indigo-100 bg-indigo-50/70 px-3.5 py-1.5 text-[13px] font-semibold text-brand-strong">
                  {chip}
                </span>
                {i < WORKFLOW_CHIPS.length - 1 ? (
                  <span aria-hidden="true" className="text-slate-300 font-bold">
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Feature Showcase Grid */}
        <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Feature List (Left side) */}
          <div className="space-y-4 lg:col-span-5">
            {FEATURE_SPOTLIGHTS.map((f, index) => {
              const isSelected = activeFeature === index;
              return (
                <Reveal key={f.id} delay={index * 60}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFeature(index);
                      track("feature_tab_click", { feature: f.id });
                    }}
                    className={`w-full text-left rounded-2xl p-5 transition-all duration-300 border ${
                      isSelected
                        ? "border-brand bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20"
                        : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isSelected
                            ? "bg-brand text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {f.badge}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className="mt-2.5 font-display text-base font-bold text-slate-900">
                      {f.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {f.description}
                    </p>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* Feature Screen Media Preview (Right side) */}
          <div className="lg:col-span-7">
            <Reveal delay={120}>
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-2 sm:p-3 shadow-2xl">
                {/* Window Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 px-3 pb-2.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {FEATURE_SPOTLIGHTS[activeFeature].badge} — CamVerse Studio
                  </span>
                  <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-800/50">
                    60 FPS
                  </span>
                </div>

                {/* Media Container */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black">
                  <img
                    key={FEATURE_SPOTLIGHTS[activeFeature].media}
                    src={FEATURE_SPOTLIGHTS[activeFeature].media}
                    alt={FEATURE_SPOTLIGHTS[activeFeature].title}
                    className="h-full w-full object-contain animate-fadeIn"
                  />
                  <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    {FEATURE_SPOTLIGHTS[activeFeature].badge}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
