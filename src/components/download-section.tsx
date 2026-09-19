"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "./icons";
import { track } from "@/lib/analytics";

interface PlatformInfo {
  id: "windows" | "mac" | "linux";
  name: string;
  badge: string;
  filename: string;
  version: string;
  size: string;
  downloadUrl: string;
  requirements: string;
  sha512: string;
  isPrimary?: boolean;
}

const PLATFORMS: PlatformInfo[] = [
  {
    id: "windows",
    name: "Windows",
    badge: "Official Release",
    filename: "CamVerse-windows-x64.exe",
    version: "v1.3.5",
    size: "213 MB",
    downloadUrl: "/api/download?platform=windows",
    requirements: "Windows 10 / 11 (64-bit), 4GB+ RAM, GPU Acceleration",
    sha512: "nyAX12Qn9asPa/gyQjKZ1U9gFLRrwddGHWtBuraM76WPa45gSFP2h/2ipKoOB0ikhoqF0yDErq97sKMbYB2vcA==",
    isPrimary: true,
  },
  {
    id: "mac",
    name: "macOS",
    badge: "Universal (M-Series & Intel)",
    filename: "CamVerse-mac-universal.dmg",
    version: "v1.3.5",
    size: "198 MB",
    downloadUrl: "/api/download?platform=mac",
    requirements: "macOS 12.0 Monterey or newer (Apple Silicon M1/M2/M3/M4 & Intel)",
    sha512: "Automated direct download from official build server",
  },
  {
    id: "linux",
    name: "Linux",
    badge: "AppImage / .deb",
    filename: "CamVerse-linux-x86_64.AppImage",
    version: "v1.3.5",
    size: "185 MB",
    downloadUrl: "/api/download?platform=linux",
    requirements: "Ubuntu 20.04+, Debian, Fedora, Arch Linux (64-bit)",
    sha512: "Automated direct download from official build server",
  },
];

const subscribeNoop = () => () => {};

export function DownloadSection() {
  const detectedPlatform = useSyncExternalStore(
    subscribeNoop,
    () => {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes("mac")) return "mac";
      if (ua.includes("linux")) return "linux";
      return "windows";
    },
    () => "windows"
  );
  const [userPlatform, setUserPlatform] = useState<"windows" | "mac" | "linux" | null>(null);
  const selectedPlatform = userPlatform ?? detectedPlatform;
  const setSelectedPlatform = setUserPlatform;
  const [showChecksum, setShowChecksum] = useState(false);
  const [copied, setCopied] = useState(false);

  const active = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  const handleDownload = (platform: PlatformInfo) => {
    track("app_download_click", { platform: platform.id, version: platform.version });
  };

  const copyChecksum = () => {
    if (active.sha512) {
      navigator.clipboard.writeText(active.sha512);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="download" className="relative w-full overflow-hidden bg-slate-900 py-16 text-white sm:py-28 scroll-mt-24">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-175 h-125 bg-indigo-600/20 blur-[150px] rounded-full" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-100 h-100 bg-violet-600/15 blur-[120px] rounded-full" />

      <div className="container-page relative z-10 text-center">
        {/* Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-6 backdrop-blur-md">
          <Icon name="download" size={14} className="text-indigo-400" />
          <span>Latest Desktop Release • v1.3.5</span>
        </div>

        {/* Headline */}
        <h2 className="mx-auto max-w-3xl font-display text-2xl font-bold tracking-tight text-white sm:text-5xl">
          Download CamVerse for Desktop
        </h2>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-300 sm:text-lg">
          Zero latency, offline-first recording with native GPU acceleration. Record crystal-clear 4K 60FPS demos directly on your computer.
        </p>

        {/* Platform Selector Tabs */}
        <div className="mt-8 sm:mt-10 inline-flex flex-wrap justify-center rounded-2xl bg-slate-800/80 p-1.5 border border-slate-700/60 backdrop-blur-md max-w-full">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => setSelectedPlatform(platform.id)}
              className={`flex items-center gap-2 rounded-xl px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                selectedPlatform === platform.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon name="monitor" size={16} />
              <span>{platform.name}</span>
            </button>
          ))}
        </div>

        {/* Active Download Main Card */}
        <div className="mx-auto mt-6 sm:mt-8 max-w-2xl rounded-3xl border border-slate-700/70 bg-slate-850/90 p-5 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-750 pb-5 text-left">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">CamVerse Studio for {active.name}</h3>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  {active.badge}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400 font-mono">
                {active.filename} • {active.size} • {active.version}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
                100% Free Installer
              </span>
            </div>
          </div>

          {/* Primary & Portable Download Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <a
              href={active.downloadUrl}
              onClick={() => handleDownload(active)}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm sm:text-base text-white bg-linear-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Icon name="download" size={19} />
              <span>Direct Download for {active.name} ({active.size})</span>
            </a>

            {active.id === "windows" && (
              <a
                href="/api/download?platform=portable"
                onClick={() => track("app_download_click", { platform: "windows-portable", version: active.version })}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-xs sm:text-sm text-slate-300 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition-all hover:text-white"
                title="No installation needed - Extract and run directly"
              >
                <Icon name="extension" size={16} className="text-indigo-400" />
                <span>Portable (.zip)</span>
              </a>
            )}
          </div>

          {/* Windows SmartScreen Quick Tip Banner */}
          {active.id === "windows" && (
            <div className="mt-5 rounded-2xl border border-indigo-500/20 bg-indigo-950/40 p-3.5 sm:p-4 text-left backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-bold">
                  i
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white">First-time Windows Installation:</span> If Windows Defender SmartScreen shows a protection prompt, simply click <span className="text-indigo-300 font-semibold underline underline-offset-2">More info</span> &rarr; <span className="text-emerald-400 font-semibold underline underline-offset-2">Run anyway</span>. CamVerse is 100% verified, clean, and adware-free.
                </div>
              </div>
            </div>
          )}

          {/* System Requirements */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Icon name="check" size={14} className="text-emerald-400 shrink-0" />
            <span className="text-left sm:text-center">Requirements: {active.requirements}</span>
          </div>

          {/* Checksum & Security */}
          <div className="mt-5 border-t border-slate-800 pt-4 text-center">
            <button
              type="button"
              onClick={() => setShowChecksum(!showChecksum)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 cursor-pointer"
            >
              {showChecksum ? "Hide SHA-512 Verification Checksum" : "Verify SHA-512 Checksum"}
            </button>

            {showChecksum && (
              <div className="mt-3 rounded-xl bg-slate-950/90 p-3 text-left font-mono text-[11px] text-slate-300 break-all border border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-slate-500 select-none">SHA-512 Checksum:</span>
                  <button
                    type="button"
                    onClick={copyChecksum}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors font-sans"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                {active.sha512}
              </div>
            )}
          </div>
        </div>

        {/* Feature Badges Strip */}
        <div className="mx-auto mt-10 sm:mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4 text-slate-300 text-xs sm:text-sm">
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-800/80 bg-slate-850/50 p-3.5 sm:p-4 text-center">
            <Icon name="shield" size={18} className="text-emerald-400" />
            <span className="font-semibold text-white">100% Offline Privacy</span>
            <span className="text-slate-400 text-[11px]">Zero tracking</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-800/80 bg-slate-850/50 p-3.5 sm:p-4 text-center">
            <Icon name="cpu" size={18} className="text-indigo-400" />
            <span className="font-semibold text-white">GPU Turbo</span>
            <span className="text-slate-400 text-[11px]">Hardware encoder</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-800/80 bg-slate-850/50 p-3.5 sm:p-4 text-center">
            <Icon name="zoom" size={18} className="text-amber-400" />
            <span className="font-semibold text-white">Smart Auto-Zoom</span>
            <span className="text-slate-400 text-[11px]">Click tracking</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-slate-800/80 bg-slate-850/50 p-3.5 sm:p-4 text-center">
            <Icon name="monitor" size={18} className="text-cyan-400" />
            <span className="font-semibold text-white">Multi-Display 4K</span>
            <span className="text-slate-400 text-[11px]">60 FPS Lossless</span>
          </div>
        </div>
      </div>
    </section>
  );
}
