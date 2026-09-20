import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/admin-auth";
import { getTrackingConfig, saveTrackingConfig } from "@/lib/tracking-store";

export async function GET() {
  const isAdmin = await isAuthenticatedAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const config = await getTrackingConfig();
  return NextResponse.json({ ok: true, config });
}

export async function POST(request: Request) {
  const isAdmin = await isAuthenticatedAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { gtmId, gtmEnabled, fbPixelId, fbPixelEnabled } = body || {};

    const updated = await saveTrackingConfig({
      gtmId: typeof gtmId === "string" ? gtmId : undefined,
      gtmEnabled: typeof gtmEnabled === "boolean" ? gtmEnabled : undefined,
      fbPixelId: typeof fbPixelId === "string" ? fbPixelId : undefined,
      fbPixelEnabled: typeof fbPixelEnabled === "boolean" ? fbPixelEnabled : undefined,
    });

    return NextResponse.json({
      ok: true,
      message: "Tracking configurations updated successfully.",
      config: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save tracking config.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
