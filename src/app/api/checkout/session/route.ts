import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createSession } from "@/lib/payment-store";
import { createPayStationPayment, isPayStationConfigured } from "@/lib/paystation";
import { checkDisposableEmail, DISPOSABLE_EMAIL_ERROR_MESSAGE } from "@/lib/disposable-email";
import type { BillingPeriod, PlanId } from "@/data/plans";

const PLAN_IDS: PlanId[] = ["pro", "agency"]; // paid plans only
const PERIODS: BillingPeriod[] = ["1m", "3m"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{6,20}$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const planId = PLAN_IDS.includes(body.planId as PlanId)
    ? (body.planId as PlanId)
    : null;
  const period = PERIODS.includes(body.period as BillingPeriod)
    ? (body.period as BillingPeriod)
    : null;
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone =
    typeof body.phone === "string" && body.phone.trim()
      ? body.phone.trim()
      : "01700000000";
  const couponCode =
    typeof body.couponCode === "string" && body.couponCode.trim()
      ? body.couponCode.trim().toUpperCase()
      : null;

  if (!planId || !period) {
    return NextResponse.json(
      { ok: false, error: "Select a valid paid plan and billing period." },
      { status: 400 }
    );
  }
  if (!fullName || fullName.length > 120) {
    return NextResponse.json(
      { ok: false, error: "Full name is required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { ok: false, error: "A valid email address is required." },
      { status: 400 }
    );
  }
  const emailCheck = await checkDisposableEmail(email);
  if (emailCheck.isDisposable) {
    return NextResponse.json(
      { ok: false, error: DISPOSABLE_EMAIL_ERROR_MESSAGE },
      { status: 400 }
    );
  }

  // Amount is computed server-side; the client's displayed total is advisory only.
  const session = createSession({ planId, period, fullName, email, phone, couponCode });

  // Connect with PayStation Bangladesh Gateway (bKash, Nagad, Rocket, Cards)
  if (isPayStationConfigured()) {
    try {
      const callbackUrl = `${env.siteUrl}/api/payment/paystation/callback`;
      const paystationRes = await createPayStationPayment({
        invoiceNumber: session.id,
        amount: session.amount,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        callbackUrl,
        reference: `CamVerse ${planId.toUpperCase()} (${period})`,
      });

      if (paystationRes?.payment_url) {
        return NextResponse.json({
          ok: true,
          sessionId: session.id,
          redirectUrl: paystationRes.payment_url,
        });
      }
    } catch (err) {
      console.error("PayStation gateway initialization error:", err);
    }
  }

  // Fallback to sandbox mock-gateway when PayStation credentials are not yet entered
  const gatewayUrl = new URL("/mock-gateway", env.appUrl);
  gatewayUrl.searchParams.set("session", session.id);
  gatewayUrl.searchParams.set("amount", String(session.amount));

  return NextResponse.json({
    ok: true,
    sessionId: session.id,
    redirectUrl: gatewayUrl.toString(),
  });
}
