import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupon";
import type { BillingPeriod, PlanId } from "@/data/plans";

const PLAN_IDS: PlanId[] = ["free", "pro", "agency"];
const PERIODS: BillingPeriod[] = ["1m", "3m"];

export async function POST(request: Request) {
  let body: { code?: unknown; planId?: unknown; period?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const planId = PLAN_IDS.includes(body.planId as PlanId)
    ? (body.planId as PlanId)
    : null;
  const period = PERIODS.includes(body.period as BillingPeriod)
    ? (body.period as BillingPeriod)
    : null;

  if (!planId || !period || typeof body.code !== "string") {
    return NextResponse.json(
      { ok: false, message: "Invalid plan, period or coupon code." },
      { status: 400 }
    );
  }

  const result = validateCoupon(body.code, planId, period);
  return NextResponse.json(result);
}
