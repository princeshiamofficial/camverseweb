import { NextResponse } from "next/server";
import { track } from "@/lib/analytics";
import { sendAccessEmail } from "@/lib/email";
import { env } from "@/lib/env";
import {
  expiryFor,
  getSession,
  markFailed,
  markPaid,
  verifySignature,
} from "@/lib/payment-store";

interface WebhookBody {
  event?: string;
  sessionId?: string;
  transactionId?: string;
  /** Gateway-reported amount — must match the server-computed amount. */
  amount?: number;
}

/**
 * Payment gateway webhook — the source of truth.
 * Never trust a frontend success URL for granting access.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-payment-signature") ??
    request.headers.get("x-signature") ??
    "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json(
      { ok: false, error: "Invalid signature." },
      { status: 401 }
    );
  }

  let body: WebhookBody;
  try {
    body = JSON.parse(rawBody) as WebhookBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { event, sessionId, transactionId } = body;
  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "Missing sessionId." },
      { status: 400 }
    );
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "Unknown session." },
      { status: 404 }
    );
  }

  if (event === "payment.failed") {
    markFailed(sessionId);
    track("purchase_failed", { sessionId });
    return NextResponse.json({ ok: true, status: "failed" });
  }

  if (event !== "payment.succeeded") {
    return NextResponse.json(
      { ok: false, error: "Unsupported event." },
      { status: 400 }
    );
  }

  // Confirm the paid amount matches what we charged — no partial/tampered payments.
  if (
    typeof body.amount !== "number" ||
    Math.abs(body.amount - session.amount) > 0.01
  ) {
    return NextResponse.json(
      { ok: false, error: "Amount mismatch." },
      { status: 400 }
    );
  }

  const paid = markPaid(sessionId, transactionId ?? `txn_${sessionId.slice(0, 8)}`);
  if (!paid) {
    return NextResponse.json(
      { ok: false, error: "Session not found." },
      { status: 404 }
    );
  }

  // Idempotency: only provision + email on the first successful transition.
  if (paid.paidAt && Date.now() - paid.paidAt < 5000) {
    const expiryDate = expiryFor(session.period);
    try {
      await sendAccessEmail({
        to: session.email,
        name: session.fullName,
        planId: session.planId,
        period: session.period,
        amount: session.amount,
        expiryDate,
        setupUrl: `${env.appUrl}/auth/setup?token=${paid.setupToken}`,
        loginUrl: `${env.appUrl}/login`,
      });
    } catch (error) {
      // Payment stands; email retry is handled by the resend endpoint/job.
      console.error("access email failed", error);
    }
  }

  track("purchase_success", { sessionId, planId: session.planId });

  return NextResponse.json({ ok: true, status: "paid" });
}
