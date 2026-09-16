"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { CheckoutProvider, useCheckout } from "@/components/checkout-context";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  return (
    <CheckoutProvider>
      <DashboardContent />
    </CheckoutProvider>
  );
}

interface UserLicenseData {
  key: string;
  tier: string;
  status: string;
  allowedDevices: number;
  createdAt?: string;
}

function DashboardContent() {
  const router = useRouter();
  const { openCheckout } = useCheckout();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // License state — NOT free for all users; must be purchased!
  const [license, setLicense] = useState<UserLicenseData | null>(null);
  const [licenseLoading, setLicenseLoading] = useState(true);

  const fetchUserLicense = useCallback(async (email: string) => {
    setLicenseLoading(true);
    try {
      const res = await fetch(`/api/license/my-license?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.hasLicense && Array.isArray(data.licenses) && data.licenses.length > 0) {
          setLicense(data.licenses[0]);
        } else {
          setLicense(null);
        }
      } else {
        setLicense(null);
      }
    } catch (err) {
      console.warn("Failed to fetch user license:", err);
      setLicense(null);
    } finally {
      setLicenseLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        if (session.user.email) {
          void fetchUserLicense(session.user.email);
        } else {
          setLicenseLoading(false);
        }
      } else {
        // Must be logged in to view dashboard
        router.push("/login?redirect=dashboard");
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (session.user.email) {
          void fetchUserLicense(session.user.email);
        }
      } else {
        setUser(null);
        setLicense(null);
        router.push("/login?redirect=dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, fetchUserLicense]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const copyLicense = (keyToCopy: string) => {
    navigator.clipboard.writeText(keyToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Icon name="sparkles" size={24} className="animate-spin text-brand" />
          <span className="font-semibold text-sm">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "CamVerse Creator";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 py-10 sm:py-16">
        <div className="container-page max-w-5xl">
          {/* Top Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                {license ? (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Pro Member Active
                    </span>
                  </>
                ) : (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                      Free Tier Account
                    </span>
                  </>
                )}
              </div>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Welcome, {displayName}!
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 font-mono">
                {user?.email}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/api/download?platform=windows"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-700 transition-colors"
              >
                <Icon name="download" size={15} />
                <span>Download Studio</span>
              </a>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>

          {/* License & Device Management Grid */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {/* Main Plan / License Card */}
            <div className="md:col-span-2 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              {licenseLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                  <Icon name="sparkles" size={24} className="animate-spin text-brand" />
                  <span className="text-xs font-medium">Checking license records...</span>
                </div>
              ) : license ? (
                /* USER HAS PURCHASED A LICENSE */
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                      <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Icon name="zap" size={18} className="text-brand" />
                        <span>Your CamVerse Pro License</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Use this license key inside CamVerse Desktop Studio to unlock Pro features.
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 uppercase">
                      {license.tier} Active
                    </span>
                  </div>

                  {/* License Key Box */}
                  <div className="mt-6">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      License Key
                    </label>
                    <div className="flex items-center gap-2 rounded-2xl bg-slate-900 p-3 sm:p-4 text-white font-mono text-xs sm:text-sm shadow-inner">
                      <span className="flex-1 select-all tracking-wider text-indigo-300 font-bold">
                        {license.key}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyLicense(license.key)}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Icon name="check" size={13} />
                        <span>{copied ? "Copied!" : "Copy Key"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Activation details */}
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block">Status</span>
                      <span className="font-bold text-emerald-600 mt-0.5 block">Active</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Recording Duration</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">Unlimited</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Allowed Devices</span>
                      <span className="font-bold text-slate-800 mt-0.5 block">
                        {license.allowedDevices} Computers
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* FREE USER — HAS NOT PURCHASED A LICENSE YET */
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                      <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Icon name="shield" size={18} className="text-slate-500" />
                        <span>CamVerse Free Plan</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        You have not purchased a Pro license key yet.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                      Free Tier
                    </span>
                  </div>

                  {/* Free Status Alert Card */}
                  <div className="mt-6 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/70 to-orange-50/40 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-amber-100 p-2 text-amber-700 shrink-0 mt-0.5">
                        <Icon name="lock" size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900">
                          Pro License Key Required
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                          Free tier allows up to <strong>5 minutes per recording</strong> with CamVerse watermark. To remove recording limits and unlock 4K 60FPS export, silky cursor smoothing, dynamic webcam bubble, and AI captions, please purchase a license key.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Free Plan Limits Breakdown */}
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                      <span className="text-slate-400 block text-[11px]">Recording Limit</span>
                      <span className="font-bold text-amber-700 mt-1 block">Max 5 Min / video</span>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                      <span className="text-slate-400 block text-[11px]">Watermark</span>
                      <span className="font-bold text-slate-700 mt-1 block">Included</span>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                      <span className="text-slate-400 block text-[11px]">Max Resolution</span>
                      <span className="font-bold text-slate-700 mt-1 block">1080p FHD</span>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                      <span className="text-slate-400 block text-[11px]">Pro License</span>
                      <span className="font-bold text-rose-600 mt-1 block">Not Purchased</span>
                    </div>
                  </div>

                  {/* Purchase CTA Buttons */}
                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openCheckout("pro")}
                      className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                    >
                      <Icon name="sparkles" size={16} />
                      <span>Buy Pro License — ৳499</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openCheckout("agency")}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      <span>Get Agency (5 Seats)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Icon name="monitor" size={17} className="text-brand" />
                  <span>Desktop App</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Download CamVerse Studio desktop application for your operating system:
                </p>

                <div className="mt-5 space-y-2">
                  <a
                    href="/api/download?platform=windows"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                  >
                    <span>Windows (x64) • v1.3.5</span>
                    <Icon name="download" size={14} className="text-brand" />
                  </a>

                  <a
                    href="/api/download?platform=mac"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                  >
                    <span>macOS (Universal)</span>
                    <Icon name="download" size={14} className="text-brand" />
                  </a>

                  <a
                    href="/api/download?platform=linux"
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                  >
                    <span>Linux (.AppImage)</span>
                    <Icon name="download" size={14} className="text-brand" />
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <Link
                  href="/"
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Visit CamVerse Website ➔
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
