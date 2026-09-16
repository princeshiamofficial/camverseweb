"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { useCheckout } from "./checkout-context";
import { Icon } from "./icons";

export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);
  const { openCheckout } = useCheckout();

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling past roughly one viewport.
      setVisible(window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
        <a
          href="/api/download?platform=windows"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-100 transition-colors"
        >
          <Icon name="download" size={15} className="text-brand" />
          <span>Download Free</span>
        </a>

        <button
          type="button"
          className="btn btn-primary btn-md text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5"
          onClick={() => {
            track("hero_cta_click", { location: "sticky_mobile" });
            openCheckout("pro", "1m");
          }}
        >
          <Icon name="sparkles" size={14} />
          <span>Get Pro ৳499</span>
        </button>
      </div>
    </div>
  );
}
