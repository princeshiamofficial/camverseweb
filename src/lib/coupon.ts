/**
 * Server-side coupon validation.
 * The client may *display* coupon math, but the server is the source of truth
 * for what discount actually gets applied at payment time.
 */
import {
  LAUNCH_COUPON,
  regularPrice,
  type BillingPeriod,
  type PlanId,
} from "@/data/plans";

export interface CouponResult {
  ok: boolean;
  code: string;
  discount: number;
  regular: number;
  total: number;
  message?: string;
}

export function validateCoupon(
  rawCode: string | null | undefined,
  planId: PlanId,
  period: BillingPeriod
): CouponResult {
  const regular = regularPrice(planId, period);
  const code = (rawCode ?? "").trim().toUpperCase();

  if (!code) {
    return { ok: false, code: "", discount: 0, regular, total: regular };
  }

  if (code !== LAUNCH_COUPON.code) {
    return {
      ok: false,
      code,
      discount: 0,
      regular,
      total: regular,
      message: "কুপন কোডটি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।",
    };
  }

  const planEligible = LAUNCH_COUPON.applicablePlans.includes(planId);
  const periodEligible = LAUNCH_COUPON.applicablePeriods.includes(period);

  if (!planEligible || !periodEligible) {
    return {
      ok: false,
      code,
      discount: 0,
      regular,
      total: regular,
      message:
        "CAMVERSE3 শুধুমাত্র Pro ও Agency-র 3 Months plan-এ প্রযোজ্য।",
    };
  }

  const discount = LAUNCH_COUPON.discount[planId];
  return {
    ok: true,
    code,
    discount,
    regular,
    total: Math.max(regular - discount, 0),
  };
}
