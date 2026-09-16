import { NextResponse } from "next/server";
import {
  checkDisposableEmail,
  DISPOSABLE_EMAIL_ERROR_MESSAGE,
} from "@/lib/disposable-email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = await checkDisposableEmail(email);

    if (result.isDisposable) {
      return NextResponse.json(
        {
          disposable: true,
          error: DISPOSABLE_EMAIL_ERROR_MESSAGE,
          reason: result.reason,
        },
        { status: 200 }
      );
    }

    if (!result.isValidEmail) {
      return NextResponse.json(
        {
          disposable: false,
          error: "Invalid email address or domain has no mail servers.",
          reason: result.reason,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ disposable: false, valid: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Validation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
