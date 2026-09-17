import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/admin-auth";
import { getDownloadConfig, saveDownloadConfig } from "@/lib/download-store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const config = getDownloadConfig();
  return NextResponse.json({ ok: true, config });
}

export async function POST(request: Request) {
  const authed = await isAuthenticatedAdmin();
  if (!authed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { windowsUrl, macUrl, linuxUrl, version } = body || {};

    const updated = saveDownloadConfig({
      windowsUrl,
      macUrl,
      linuxUrl,
      version,
    });

    // Mirror to Supabase releases table if configured
    if (isSupabaseConfigured && supabase && (windowsUrl || macUrl)) {
      try {
        await supabase.from("releases").upsert({
          version: version || updated.version || "1.3.5",
          windows_installer_url: windowsUrl || updated.windowsUrl,
          mac_installer_url: macUrl || updated.macUrl,
          release_notes: `Direct download release v${version || updated.version || "1.3.5"}`,
          released_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("[admin-downloads] Supabase releases mirror warning:", err);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Direct download URLs updated successfully.",
      config: updated,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update download URLs.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
