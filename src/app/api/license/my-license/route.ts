import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getLicensesForEmail } from "@/lib/payment-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
  }

  interface LicenseItem {
    key: string;
    tier: string;
    status: string;
    allowedDevices: number;
    createdAt?: string;
  }

  const allLicenses: LicenseItem[] = [];

  // 1. Check database (Supabase license_keys table)
  try {
    const { data, error } = await supabase
      .from("license_keys")
      .select("*")
      .eq("customer_email", email)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      for (const row of data) {
        allLicenses.push({
          key: row.license_key,
          tier: row.plan_tier || "pro",
          status: row.status || "active",
          allowedDevices: row.activation_limit || 2,
          createdAt: row.created_at,
        });
      }
    }
  } catch (err) {
    console.warn("[my-license] Supabase check warning:", err);
  }

  // 2. Check store licenses (completed payment sessions)
  const storeLicenses = getLicensesForEmail(email);
  for (const l of storeLicenses) {
    allLicenses.push({
      key: l.licenseKey,
      tier: l.planTier,
      status: l.status,
      allowedDevices: l.activationLimit,
      createdAt: new Date(l.createdAt).toISOString(),
    });
  }

  // Deduplicate by license key
  const uniqueLicenses = Array.from(new Map(allLicenses.map((l) => [l.key, l])).values());

  return NextResponse.json({
    ok: true,
    hasLicense: uniqueLicenses.length > 0,
    licenses: uniqueLicenses,
    tier: uniqueLicenses.length > 0 ? uniqueLicenses[0].tier : "free",
  });
}
