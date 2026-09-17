import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminUser,
  isAuthenticatedAdmin,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function GET() {
  const authenticated = await isAuthenticatedAdmin();
  const user = await getAdminUser();
  return NextResponse.json({ ok: true, authenticated, user });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, passkey } = body || {};

    let userEmail = "admin@camverse.app";

    if (email && password) {
      const result = await verifyAdminCredentials(email, password);
      if (!result.valid) {
        return NextResponse.json(
          { ok: false, error: result.error || "Invalid Admin email or password. Access denied." },
          { status: 401 }
        );
      }
      userEmail = result.email || email.trim().toLowerCase();
    } else {
      return NextResponse.json(
        { ok: false, error: "Admin email and password are required." },
        { status: 400 }
      );
    }

    const token = createAdminSessionToken(userEmail);
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return NextResponse.json({
      ok: true,
      message: "Admin authentication successful.",
      user: { email: userEmail },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return NextResponse.json({ ok: true, message: "Signed out of admin session." });
}
