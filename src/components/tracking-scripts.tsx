"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { registerAnalyticsAdapter, type AnalyticsEvent, type AnalyticsPayload } from "@/lib/analytics";

interface TrackingState {
  gtmId: string;
  gtmEnabled: boolean;
  fbPixelId: string;
  fbPixelEnabled: boolean;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function TrackingScripts() {
  const [config, setConfig] = useState<TrackingState | null>(null);
  const registeredRef = useRef(false);

  useEffect(() => {
    fetch("/api/tracking")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setConfig({
            gtmId: data.gtmId || "",
            gtmEnabled: Boolean(data.gtmEnabled),
            fbPixelId: data.fbPixelId || "",
            fbPixelEnabled: Boolean(data.fbPixelEnabled),
          });
        }
      })
      .catch((err) => console.warn("[tracking-scripts] Config fetch warning:", err));
  }, []);

  // Register analytics adapter for automatic event dispatch
  useEffect(() => {
    if (!registeredRef.current) {
      registeredRef.current = true;

      registerAnalyticsAdapter((event: AnalyticsEvent, payload?: AnalyticsPayload) => {
        // 1. Google Tag Manager dataLayer dispatch
        if (typeof window !== "undefined" && window.dataLayer) {
          try {
            window.dataLayer.push({
              event,
              ...payload,
            });
          } catch (e) {
            console.warn("[GTM dispatch error]:", e);
          }
        }

        // 2. Facebook Pixel dispatch
        if (typeof window !== "undefined" && typeof window.fbq === "function") {
          try {
            if (event === "page_view") {
              window.fbq("track", "PageView");
            } else if (event === "purchase_success") {
              window.fbq("track", "Purchase", {
                currency: "BDT",
                value: payload?.amount || 0,
              });
            } else if (event === "checkout_start") {
              window.fbq("track", "InitiateCheckout");
            } else {
              window.fbq("trackCustom", event, payload);
            }
          } catch (e) {
            console.warn("[FB Pixel dispatch error]:", e);
          }
        }
      });
    }
  }, []);

  if (!config) return null;

  return (
    <>
      {/* ── Google Tag Manager Script ───────────────────────────── */}
      {config.gtmEnabled && config.gtmId && (
        <>
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${config.gtmId}');`,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${config.gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* ── Facebook (Meta) Pixel Script ────────────────────────── */}
      {config.fbPixelEnabled && config.fbPixelId && (
        <>
          <Script
            id="facebook-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${config.fbPixelId}');
fbq('track', 'PageView');`,
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${config.fbPixelId}&ev=PageView&noscript=1`}
              alt="Meta Pixel"
            />
          </noscript>
        </>
      )}
    </>
  );
}
