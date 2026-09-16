"use client";

import { Icon } from "./icons";
import { Reveal } from "./ui";

export function BentoGrid() {
  return (
    <section id="features" className="section bg-white scroll-mt-24">
      <div className="container-page">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              ভিডিওকে আকর্ষণীয় করার সব আধুনিক ফিচার
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              রেকর্ডিং থেকে এক্সপোর্ট — কোনো জটিল টাইমলাইন বা কি-ফ্রেম ছাড়াই।
            </p>
          </div>
        </Reveal>

        {/* Clean Bento Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Card 1: Auto-Zoom */}
          <Reveal delay={60} className="md:col-span-2">
            <div className="card h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between bg-slate-50/60 border-slate-200/70">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-brand">
                  <Icon name="zoom" size={18} />
                </div>
                <h3 className="mt-3.5 font-display text-lg sm:text-xl font-bold text-slate-900">
                  Automatic Cursor Follow &amp; Zoom
                </h3>
                <p className="mt-1 text-sm text-slate-600 max-w-lg">
                  মাউসের ক্লিক ও টাইপিং পয়েন্ট ট্র্যাক করে নিজে থেকেই পারফেক্ট জুম তৈরি করে।
                </p>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-950 aspect-[16/8]">
                <img
                  src="/media/feature1.gif"
                  alt="Auto-Zoom demo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          {/* Card 2: Silky Cursor Physics */}
          <Reveal delay={120}>
            <div className="card h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between bg-slate-50/60 border-slate-200/70">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Icon name="cursor" size={18} />
                </div>
                <h3 className="mt-3.5 font-display text-lg sm:text-xl font-bold text-slate-900">
                  Silky Cursor Motion
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  মোশন ব্লার ও স্মুথ সোয়ে ফিজিক্স দিয়ে কার্সারকে দেয় বাটার-স্মুথ ভাইব।
                </p>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-950 aspect-[4/3]">
                <img
                  src="/media/CursorSwayDemo.gif"
                  alt="Cursor motion demo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          {/* Card 3: Dynamic Webcam Bubble */}
          <Reveal delay={180}>
            <div className="card h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between bg-slate-50/60 border-slate-200/70">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                  <Icon name="camera" size={18} />
                </div>
                <h3 className="mt-3.5 font-display text-lg sm:text-xl font-bold text-slate-900">
                  Webcam Bubble Overlay
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  ফ্লোটিং রাউন্ড ক্যামেরা যা জুমের সাথে স্বয়ংক্রিয়ভাবে অ্যাডজাস্ট হয়।
                </p>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-950 aspect-[4/3]">
                <img
                  src="/media/feature2.gif"
                  alt="Webcam demo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          {/* Card 4: Studio Frames (Span 2) */}
          <Reveal delay={240} className="md:col-span-2">
            <div className="card h-full rounded-2xl p-6 sm:p-7 flex flex-col justify-between bg-slate-50/60 border-slate-200/70">
              <div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Icon name="frame" size={18} />
                </div>
                <h3 className="mt-3.5 font-display text-lg sm:text-xl font-bold text-slate-900">
                  Studio Gradient Frames &amp; 4K Export
                </h3>
                <p className="mt-1 text-sm text-slate-600 max-w-lg">
                  রেডিমেড গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড, উইন্ডো শ্যাডো ও কর্নার রাউন্ডিং।
                </p>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-6 text-center text-white aspect-[16/8] flex flex-col items-center justify-center">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                  4K 60FPS Lossless Rendering
                </span>
                <p className="mt-2 text-xs text-slate-300">
                  MP4, ProRes ও Looping GIF ফরম্যাটে সরাসরি এক্সপোর্ট করুন।
                </p>
              </div>
            </div>
          </Reveal>

          {/* Card 5: AI Subtitles (Span 3) */}
          <Reveal delay={300} className="md:col-span-2 lg:col-span-3">
            <div className="card rounded-2xl p-6 sm:p-7 bg-slate-900 text-white border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                    <Icon name="sparkles" size={12} /> AI Subtitles
                  </span>
                  <h3 className="mt-2 font-display text-lg sm:text-xl font-bold">
                    Bangla + English Auto Subtitles
                  </h3>
                  <p className="mt-1 text-sm text-slate-400 max-w-md">
                    এক ক্লিকে আপনার অডিও থেকে বাংলা ও ইংরেজি স্পষ্ট সাবটাইটেল তৈরি করুন।
                  </p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="rounded-lg bg-slate-800 px-3 py-2 text-slate-300">
                    ✓ &quot;সহজেই তৈরি করুন প্রফেশনাল ডেমো ভিডিও&quot;
                  </div>
                  <div className="rounded-lg bg-slate-800 px-3 py-2 text-slate-300">
                    ✓ &quot;Auto-zooms and cursor physics included&quot;
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}

