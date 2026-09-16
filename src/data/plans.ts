/**
 * Pricing plans, billing periods and the launch coupon.
 * Single source of truth for the UI *and* server-side price validation.
 */

export type PlanId = "free" | "pro" | "agency";
export type BillingPeriod = "1m" | "3m";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Monthly price in BDT. Free plan price is 0. */
  monthlyPrice: number;
  teamLimit: number;
  features: string[];
  cta: string;
  popular?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "For testing & basic recordings.",
    monthlyPrice: 0,
    teamLimit: 1,
    features: [
      "Standard Screen & Window Recording",
      "Max 5 Minutes per Recording",
      "Basic Auto-Zoom Suggestions",
      "Basic Teleprompter",
      "Standard Web & Mic Audio",
      "Bangla + English Support",
      "CamVerse Watermark",
    ],
    cta: "Start Free",
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Creators, Developers & Solo Founders.",
    monthlyPrice: 499,
    teamLimit: 1,
    features: [
      "Unlimited Recording Duration (No 5-min limit)",
      "Native 4K 60FPS Screen Recording",
      "Full Auto-Zooms & Smart Framing",
      "Silky Cursor Smoothing & Motion Blur",
      "Dynamic Webcam Bubble Overlays",
      "Studio Gradient Frames & 4K Wallpapers",
      "Drag-and-Drop Timeline Editor",
      "Speed Ramps (Fast / Slow-Mo)",
      "Built-in Teleprompter Studio",
      "AI Script & Caption Generator",
      "Bangla + English Auto Subtitles",
      "AI Voice Denoise & Audio Polish",
      "Ultra 60FPS GIF & 4K MP4 Export",
      "Multi-Ratio (16:9, 9:16, 1:1)",
      "Custom Brand Kit & No Watermark",
      "Full Commercial License",
    ],
    cta: "Get Pro",
  },
  agency: {
    id: "agency",
    name: "Agency",
    tagline: "Teams, Studios & Fast-Growing Agencies.",
    monthlyPrice: 1499,
    teamLimit: 5,
    features: [
      "Everything in Pro",
      "Up to 5 Team Members",
      "Shared Projects & Cloud Sync",
      "Multiple Client Brand Kits",
      "Team Collaboration & Preset Sharing",
      "Priority 4K Rendering & Support",
      "Multi-Client Management",
      "Commercial & Client Resale Rights",
    ],
    cta: "Get Agency",
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "agency"];

export const BILLING_PERIODS: {
  id: BillingPeriod;
  label: string;
  months: number;
}[] = [
  { id: "1m", label: "1 Month", months: 1 },
  { id: "3m", label: "3 Months — Save More", months: 3 },
];

/** Total regular price for a plan over a billing period. */
export function regularPrice(planId: PlanId, period: BillingPeriod): number {
  return PLANS[planId].monthlyPrice * (period === "3m" ? 3 : 1);
}

/**
 * CAMVERSE3 — launch coupon.
 * Applicable to Pro & Agency 3-Month plans only.
 * Server-side validation lives in src/lib/coupon.ts.
 */
export const LAUNCH_COUPON = {
  code: "CAMVERSE3",
  label: "SPECIAL LAUNCH COUPON",
  applicablePlans: ["pro", "agency"] as PlanId[],
  applicablePeriods: ["3m"] as BillingPeriod[],
  /** Absolute discount in BDT, matching the coupon pricing tables. */
  discount: { pro: 298, agency: 898 } as Record<PlanId, number>,
};
