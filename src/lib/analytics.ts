/**
 * Analytics abstraction.
 *
 * Components call `track("hero_cta_click")` — never a concrete vendor API.
 * To integrate Google Analytics, Meta Pixel, etc., register adapters below.
 * No external vendor is bundled by default.
 */

export type AnalyticsEvent =
  | "page_view"
  | "hero_cta_click"
  | "demo_play"
  | "feature_view"
  | "feature_tab_click"
  | "pricing_view"
  | "pricing_toggle"
  | "free_click"
  | "pro_click"
  | "agency_click"
  | "coupon_apply"
  | "checkout_start"
  | "payment_attempt"
  | "purchase_success"
  | "purchase_failed"
  | "account_email_sent"
  | "account_setup_complete"
  | "app_download_click"
  | "hero_download_click";

export interface AnalyticsPayload {
  [key: string]: string | number | boolean | undefined;
}

export type AnalyticsAdapter = (
  event: AnalyticsEvent,
  payload?: AnalyticsPayload
) => void;

const adapters: AnalyticsAdapter[] = [];
let debug = false;

export function registerAnalyticsAdapter(adapter: AnalyticsAdapter) {
  adapters.push(adapter);
}

/** Turn on console logging (useful in development). */
export function enableAnalyticsDebug() {
  debug = true;
}

export function track(
  event: AnalyticsEvent,
  payload?: AnalyticsPayload
): void {
  if (debug) {
    console.info(`[analytics] ${event}`, payload ?? {});
  }
  for (const adapter of adapters) {
    try {
      adapter(event, payload);
    } catch {
      // A broken analytics adapter must never break the UI.
    }
  }
}

declare global {
  interface Window {
    __camverseAnalyticsDebug?: boolean;
  }
}

if (typeof window !== "undefined" && window.__camverseAnalyticsDebug) {
  enableAnalyticsDebug();
}
