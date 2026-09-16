import { NextResponse } from "next/server";
import { isProd, env } from "@/lib/env";
import { signPayload } from "@/lib/payment-store";

/**
 * Development-only gateway emulator.
 * Signs the webhook body exactly like a real gateway would and calls the
 * webhook endpoint. Disabled in production builds' runtime by default.
 */
export async function POST(request: Request) {
  if (isProd() && env.paymentApiKey) {
    return NextResponse.json(
      { ok: false, error: "Mock gateway is disabled in production." },
      { status: 403 }
    );
  }

  const rawBody = await request.text();
  const signature = signPayload(rawBody);

  const origin = new URL(request.url).origin;
  const webhookRes = await fetch(`${origin}/api/payment/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-payment-signature": signature,
    },
    body: rawBody,
  });

  const data = await webhookRes.json();
  return NextResponse.json(data, { status: webhookRes.status });
}
