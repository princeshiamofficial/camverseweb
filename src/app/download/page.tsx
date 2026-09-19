"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { CheckoutProvider } from "@/components/checkout-context";

const subscribeNoop = () => () => {};

function getPlatformSnapshot(): "windows" | "mac" | "linux" {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("linux")) return "linux";
  return "windows";
}

export default function DownloadPage() {
  return (
    <CheckoutProvider>
      <DownloadContent />
    </CheckoutProvider>
  );
}

function DownloadContent() {
  const platform = useSyncExternalStore(subscribeNoop, getPlatformSnapshot, () => "windows");
  const [countdown, setCountdown] = useState(3);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    // Auto-trigger download after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setDownloadStarted(true);
          // Trigger file download
          const link = document.createElement("a");
          link.href = `/api/download?platform=${platform}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [platform]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="container-page max-w-3xl text-center">
          {/* Animated Success Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 animate-bounce">
            <Icon name="download" size={36} />
          </div>

          <h1 className="mt-8 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Thanks for downloading CamVerse!
          </h1>

          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            {downloadStarted
              ? "Your download has started. Follow the instructions below to get set up."
              : `Your download will start automatically in ${countdown} second${countdown === 1 ? "" : "s"}...`}
          </p>

          {/* Manual Download Button */}
          <div className="mt-6">
            <a
              href={`/api/download?platform=${platform}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Icon name="download" size={16} />
              <span>Click here if the download didn&apos;t start</span>
            </a>
          </div>

          {/* Quick Setup 3-Step Guide */}
          <div className="mt-14 rounded-3xl border border-slate-200/80 bg-white p-8 text-left shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Icon name="sparkles" size={20} className="text-indigo-600" />
              <span>Next steps to get started with CamVerse Studio</span>
            </h2>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white mb-3">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Run Installer</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Open <code>CamVerse-windows-x64.exe</code> from your browser downloads and complete setup.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white mb-3">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Pick Canvas &amp; Mic</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Select your screen or application window, turn on your webcam bubble, and test your audio.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white mb-3">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Record &amp; Export</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Hit Record! Enjoy automatic smart zooms, smooth cursor motion blur, and 4K 60FPS export.
                </p>
              </div>
            </div>
          </div>

          {/* Switch OS */}
          <div className="mt-10 text-xs text-slate-500">
            <span>Need a different version? </span>
            <Link href="/#download" className="font-semibold text-indigo-600 hover:underline">
              Download for macOS or Linux
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
