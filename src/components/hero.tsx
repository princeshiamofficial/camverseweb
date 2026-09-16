"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { Icon } from "./icons";
import { useCheckout } from "./checkout-context";

/** Clean desktop studio preview window */
function StudioPreview() {
  const [activeTab, setActiveTab] = useState<"demo" | "zoom" | "webcam" | "cursor">("demo");

  const previews = {
    demo: {
      src: "/media/demo.gif",
      title: "Studio Canvas & Auto-Zoom",
      badge: "4K 60FPS",
    },
    zoom: {
      src: "/media/feature1.gif",
      title: "Smart Auto-Zooms",
      badge: "Auto-Focus",
    },
    webcam: {
      src: "/media/feature2.gif",
      title: "Dynamic Webcam Bubble",
      badge: "Picture-in-Picture",
    },
    cursor: {
      src: "/media/CursorSwayDemo.gif",
      title: "Silky Cursor Motion",
      badge: "Smooth Physics",
    },
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Ambient Lighting Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-4 sm:-inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-pink-500/10 blur-2xl sm:blur-3xl opacity-70"
      />

      {/* Studio Window Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.18)] backdrop-blur-sm transition-all">
        
        {/* macOS Window Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            <span className="ml-2 text-xs font-semibold text-slate-600 hidden sm:inline">
              CamVerse Studio • 4K 60FPS Lossless
            </span>
          </div>

          {/* Clean Segmented Tab Switcher with Mobile Horizontal Scroll */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 text-xs font-semibold text-slate-600 overflow-x-auto max-w-[200px] xs:max-w-xs sm:max-w-none no-scrollbar">
            {(
              [
                { id: "demo", label: "Overview" },
                { id: "zoom", label: "Auto-Zoom" },
                { id: "webcam", label: "Webcam" },
                { id: "cursor", label: "Cursor" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-indigo-950 shadow-sm font-bold scale-[1.02]"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Screen Viewport */}
        <div className="relative aspect-[16/10] bg-slate-950">
          <img
            src={previews[activeTab].src}
            alt={previews[activeTab].title}
            className="h-full w-full object-cover"
          />
          
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2 rounded-full bg-slate-950/75 border border-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{previews[activeTab].badge}</span>
          </div>
        </div>

        {/* Minimal Footer Status Strip */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{previews[activeTab].title}</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-medium">Active Engine</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Zero-Lag Native Rendering</span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const { openCheckout } = useCheckout();

  const handlePrimary = () => {
    track("hero_cta_click", { location: "hero_primary" });
    openCheckout("pro", "1m");
  };

  return (
    <section id="top" className="relative w-full max-w-full overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white pb-16 pt-10 sm:pb-24 sm:pt-16">
      <div className="container-page text-center">
        {/* Top Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-brand mb-6 shadow-2xs">
          <Icon name="sparkles" size={14} className="text-brand animate-pulse" />
          <span>Next-Gen Screen Recorder &amp; Video Studio</span>
        </div>

        {/* Main Headline */}
        <h1 className="mx-auto max-w-4xl font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.14]">
          মিনিটেই সিনেমাটিক ডেমো ও স্ক্রিন রেকর্ডিং —{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
            এডিটর ছাড়াই
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          স্মার্ট <strong>Auto-Zooms</strong>, বাটার-স্মুথ <strong>Cursor Physics</strong>,
          ডাইনামিক <strong>Webcam Bubble</strong> এবং <strong>AI Subtitles</strong> দিয়ে
          মুহূর্তেই তৈরি করুন বিশ্বমানের প্রোডাক্ট ডেমো ও টিউটোরিয়াল।
        </p>

        {/* CTA Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/api/download?platform=windows"
            onClick={() => track("hero_download_click", { platform: "windows" })}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-7 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 shadow-xl shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Icon name="download" size={20} />
            <div className="flex flex-col text-left">
              <span className="text-sm sm:text-base font-bold leading-tight">Download for Windows</span>
              <span className="text-[11px] text-indigo-200 font-normal leading-tight">v1.3.5 Free Installer (x64)</span>
            </div>
          </a>

          <button
            type="button"
            onClick={handlePrimary}
            className="btn btn-secondary btn-lg w-full sm:w-auto rounded-2xl"
          >
            <Icon name="sparkles" size={17} className="text-brand" />
            Get CamVerse Pro
          </button>
        </div>

        {/* Sub CTA links */}
        <div className="mt-3 flex items-center justify-center gap-3 text-xs text-slate-500">
          <span>Also available for:</span>
          <a href="#download" className="font-semibold text-slate-700 hover:text-indigo-600 underline underline-offset-2">
            macOS &amp; Linux
          </a>
          <span>•</span>
          <a href="#comparison" className="font-semibold text-slate-700 hover:text-indigo-600 underline underline-offset-2">
            See Live Demo
          </a>
        </div>

        {/* Compatibility Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <Icon name="check" size={13} className="text-emerald-600" strokeWidth={2.5} />
            macOS, Windows &amp; Linux
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="check" size={13} className="text-emerald-600" strokeWidth={2.5} />
            4K 60FPS Lossless Export
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="check" size={13} className="text-emerald-600" strokeWidth={2.5} />
            Bangla + English AI Captions
          </span>
        </div>

        {/* Studio Window Preview */}
        <div className="mt-12 sm:mt-16">
          <StudioPreview />
        </div>
      </div>
    </section>
  );
}


