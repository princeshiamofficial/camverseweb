import { NextResponse } from "next/server";
import { getSession, markPaid } from "@/lib/payment-store";
import { verifyPayStationTransaction } from "@/lib/paystation";
import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || searchParams.get("payment_status");
  const invoiceNumber =
    searchParams.get("invoice_number") || searchParams.get("invoice");
  const trxId = searchParams.get("trx_id") || searchParams.get("transaction_id");

  return handleCallback({
    status: status || undefined,
    invoiceNumber: invoiceNumber || undefined,
    trxId: trxId || undefined,
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    }
  } catch {
    // ignore parse error
  }

  const status = (body.status || body.payment_status) as string | undefined;
  const invoiceNumber = (body.invoice_number || body.invoice) as string | undefined;
  const trxId = (body.trx_id || body.transaction_id) as string | undefined;

  return handleCallback({ status, invoiceNumber, trxId });
}

async function handleCallback({
  status,
  invoiceNumber,
  trxId,
}: {
  status?: string;
  invoiceNumber?: string;
  trxId?: string;
}) {
  if (!invoiceNumber) {
    return NextResponse.redirect(`${env.siteUrl}/?payment=missing_invoice`, {
      status: 302,
    });
  }

  const session = getSession(invoiceNumber);
  if (!session) {
    return NextResponse.redirect(`${env.siteUrl}/?payment=session_not_found`, {
      status: 302,
    });
  }

  const isSuccessStatus =
    status?.toLowerCase() === "success" ||
    status?.toLowerCase() === "successful" ||
    status === "200" ||
    status === "1";

  if (isSuccessStatus) {
    // Optional secondary server-to-server verification with PayStation
    try {
      await verifyPayStationTransaction({
        invoiceNumber,
        trxId: trxId || undefined,
      });
    } catch (e) {
      console.warn("PayStation verification warning:", e);
    }

    // Mark session as paid & generate license
    const transactionId = trxId || `PST-${Date.now()}`;
    const paidSession = markPaid(invoiceNumber, transactionId);

    if (paidSession?.licenseKey) {
      try {
        await supabase.from("license_keys").insert({
          license_key: paidSession.licenseKey,
          plan_tier: paidSession.planId === "agency" ? "team" : "pro",
          status: "active",
          activation_limit: paidSession.planId === "agency" ? 5 : 2,
          activation_usage: 0,
          customer_email: paidSession.email.toLowerCase(),
          customer_name: paidSession.fullName,
        });
      } catch (dbErr) {
        console.warn("[callback] Supabase license sync note:", dbErr);
      }
    }

    // Redirect to success page with session details
    return NextResponse.redirect(
      `${env.siteUrl}/payment/success?session=${session.id}`,
      { status: 302 }
    );
  }

  // Payment was cancelled or failed
  return NextResponse.redirect(
    `${env.siteUrl}/?payment=failed&session=${session.id}`,
    { status: 302 }
  );
}
