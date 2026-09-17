import { NextResponse } from "next/server";
import { getTrackingConfig } from "@/lib/tracking-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getTrackingConfig();
  return NextResponse.json({
    ok: true,
    gtmId: config.gtmEnabled ? config.gtmId : "",
    gtmEnabled: config.gtmEnabled && Boolean(config.gtmId),
    fbPixelId: config.fbPixelEnabled ? config.fbPixelId : "",
    fbPixelEnabled: config.fbPixelEnabled && Boolean(config.fbPixelId),
  });
}
