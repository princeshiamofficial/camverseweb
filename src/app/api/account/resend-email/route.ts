import { NextResponse } from "next/server";
import { resendAccessEmail } from "@/lib/email";
import { getSession } from "@/lib/payment-store";

// Naive in-memory rate limit: 3 resends per email per hour.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

export async function POST(request: Request) {
  let body: { sessionId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
  if (!sessionId) {
    return NextResponse.json(
      { ok: false, error: "Missing sessionId." },
      { status: 400 }
    );
  }

  const session = getSession(sessionId);
  if (!session || session.status !== "paid") {
    return NextResponse.json(
      { ok: false, error: "No completed payment found for this session." },
      { status: 404 }
    );
  }

  // Rate limit per email.
  const now = Date.now();
  const entry = attempts.get(session.email);
  if (entry && entry.resetAt > now && entry.count >= MAX_PER_WINDOW) {
    return NextResponse.json(
      { ok: false, error: "Too many resend attempts. কিছুক্ষণ পর আবার চেষ্টা করুন।" },
      { status: 429 }
    );
  }
  if (!entry || entry.resetAt <= now) {
    attempts.set(session.email, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }

  const sent = await resendAccessEmail(session);
  if (!sent) {
    return NextResponse.json(
      { ok: false, error: "Access email is not available for this session." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
