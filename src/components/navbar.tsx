"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "@/data/audience";
import { track } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import { Icon, Logo } from "./icons";
import { useCheckout } from "./checkout-context";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { openCheckout } = useCheckout();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleGetCamVerse = () => {
    setMenuOpen(false);
    track("hero_cta_click", { location: "navbar" });
    openCheckout("pro", "1m");
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 w-full border-b bg-white/90 backdrop-blur-md transition-all duration-200 ${
          scrolled
            ? "border-slate-200/90 shadow-[0_4px_20px_-8px_rgba(15,23,42,0.12)] bg-white/95"
            : "border-slate-100/60"
        }`}
      >
        <nav
          aria-label="Main navigation"
          className="container-page flex h-16 items-center justify-between gap-2 sm:gap-4"
        >
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 group"
              aria-label="CamVerse home"
            >
              <span className="transition-transform group-hover:scale-105">
                <Logo />
              </span>
              <span>
                Cam<span className="text-brand">Verse</span>
              </span>
            </Link>
          </div>

          {/* Desktop Center Links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop & Tablet Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/api/download?platform=windows"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-750 shadow-2xs hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-brand transition-all"
            >
              <Icon name="download" size={15} className="text-brand" />
              <span>Download</span>
            </a>

            {user ? (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs sm:text-sm font-semibold text-brand hover:bg-indigo-100/60 transition-colors"
              >
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-650 hover:text-brand hover:bg-slate-50 transition-colors"
              >
                Login
              </Link>
            )}

            <button
              type="button"
              onClick={handleGetCamVerse}
              className="btn btn-primary btn-sm px-3.5 py-2 text-xs sm:text-sm shadow-sm shadow-indigo-600/20"
            >
              Get Pro
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden transition-colors"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Icon name={menuOpen ? "close" : "menu"} size={22} />
            </button>
          </div>
        </nav>
      </header>

      {/* Spacer to prevent page content jump under fixed navbar */}
      <div className="h-16 w-full shrink-0" aria-hidden="true" />

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        id="mobile-menu"
        className={`fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur-xl transition-all duration-200 lg:hidden ${
          menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-slate-800 hover:bg-indigo-50/60 hover:text-brand transition-colors"
              >
                <span>{item.label}</span>
                <Icon name="arrow-right" size={14} className="text-slate-400" />
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Auth & Download Actions Box */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
          {user ? (
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2.5 text-sm font-bold text-brand"
            >
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          <a
            href="/api/download?platform=windows"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-slate-800"
          >
            <Icon name="download" size={16} />
            <span>Download Free Installer</span>
          </a>

          <button
            type="button"
            onClick={handleGetCamVerse}
            className="btn btn-primary btn-md w-full text-sm font-bold"
          >
            <Icon name="sparkles" size={16} />
            <span>Get CamVerse Pro (৳499)</span>
          </button>
        </div>
      </div>
    </>
  );
}
