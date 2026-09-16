"use client";

import { useState } from "react";
import { Icon } from "./icons";
import { Reveal } from "./ui";

export function InteractiveComparison() {
  const [mode, setMode] = useState<"after" | "before">("after");

  return (
    <section id="comparison" className="section relative overflow-hidden bg-slate-950 text-white scroll-mt-24">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-indigo-600/15 blur-[130px]"
      />

      <div className="container-page relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-4 backdrop-blur-md">
              <Icon name="sparkles" size={13} className="text-indigo-400" />
              <span>Side-by-Side Comparison</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">
              সাধারণ রেকর্ডিং বনাম <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">CamVerse Studio</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-400">
              টগল করে দেখুন কিভাবে একটি সাধারণ স্ক্রিন রেকর্ড পলিশড সিনেমাটিক ভিডিওতে রূপান্তরিত হয়।
            </p>

            {/* Clean Responsive Segmented Toggle */}
            <div className="mt-7 inline-flex max-w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-1 shadow-xl">
              <button
                type="button"
                onClick={() => setMode("before")}
                className={`rounded-xl px-2.5 xs:px-3.5 sm:px-5 py-2 sm:py-2.5 text-[11px] xs:text-xs sm:text-sm font-semibold transition-all ${
                  mode === "before"
                    ? "bg-slate-800 text-white shadow-sm font-bold scale-[1.02]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Raw Recording
              </button>
              <button
                type="button"
                onClick={() => setMode("after")}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 xs:px-3.5 sm:px-5 py-2 sm:py-2.5 text-[11px] xs:text-xs sm:text-sm font-semibold transition-all ${
                  mode === "after"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40 font-bold scale-[1.02]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon name="sparkles" size={14} />
                <span>CamVerse Studio</span>
              </button>
            </div>
          </div>
        </Reveal>

        {/* Responsive Video Display Window */}
        <Reveal delay={100}>
          <div className="mt-8 sm:mt-12 mx-auto max-w-4xl">
            {mode === "after" ? (
              <div className="overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-900 shadow-2xl shadow-indigo-500/15 transition-all">
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 py-3 text-xs text-slate-300">
                  <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    CamVerse Studio Active
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="hidden sm:inline">Auto Cursor Tracking</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">Smooth Sway Physics</span>
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-indigo-300 font-bold">4K 60FPS</span>
                  </div>
                </div>

                {/* Video / GIF Canvas */}
                <div className="relative aspect-[16/10] bg-slate-950">
                  <img
                    src="/media/feature1.gif"
                    alt="CamVerse Auto-Zoom and Studio Polish"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex flex-wrap gap-2">
                    <div className="rounded-lg bg-black/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/10">
                      ✓ Smart Click-to-Zoom
                    </div>
                    <div className="rounded-lg bg-black/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/10 hidden sm:block">
                      ✓ Zero Shaky Jitter
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl transition-all">
                {/* Header Strip */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 py-3 text-xs text-slate-400">
                  <span className="flex items-center gap-2 text-amber-400 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Standard Raw Screen Recording
                  </span>
                  <span className="text-[11px] text-slate-500">No Auto-Zoom • Flat Window</span>
                </div>

                {/* Video Canvas for Raw */}
                <div className="relative aspect-[16/10] bg-slate-950 flex items-center justify-center">
                  <img
                    src="/media/CursorLoop.gif"
                    alt="Standard Raw Screen Recording without zoom"
                    className="h-full w-full object-cover opacity-60 grayscale-[30%]"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/90 text-amber-400 mb-3 border border-slate-700">
                      <Icon name="alert-circle" size={24} />
                    </div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                      Small Unreadable Text &amp; Shaky Cursor
                    </h3>
                    <p className="mt-1 max-w-md text-xs sm:text-sm text-slate-300">
                      কোনো স্মার্ট অটো-জুম নেই, ফ্রেম স্টাইলিং নেই এবং ভিউয়ারদের জুম করে দেখতে কষ্ট হয়।
                    </p>
                    <button
                      type="button"
                      onClick={() => setMode("after")}
                      className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
                    >
                      <Icon name="sparkles" size={14} />
                      <span>Switch to CamVerse Studio</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* Feature Comparison Grid */}
        <Reveal delay={180}>
          <div className="mt-10 sm:mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto text-xs sm:text-sm">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-slate-400 font-medium">Smart Auto-Zoom</div>
              <div className="mt-1 font-bold text-white flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Instant AI Focus
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Never manually cut keyframes</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-slate-400 font-medium">Cursor Physics</div>
              <div className="mt-1 font-bold text-white flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Butter-Smooth Motion
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Eliminates jerky mouse jitters</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-slate-400 font-medium">Studio Wallpaper</div>
              <div className="mt-1 font-bold text-white flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> Gradient &amp; 3D Shadow
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Apple-like product presentation</div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-slate-400 font-medium">Export Performance</div>
              <div className="mt-1 font-bold text-white flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> GPU Accelerated 4K
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Export in seconds, not hours</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
