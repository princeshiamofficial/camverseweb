import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/admin-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  createAdminStoreLicense,
  getAllStoreLicenses,
  updateAdminStoreLicense,
} from "@/lib/payment-store";

export interface AdminLicenseResponse {
  id: string;
  license_key: string;
  plan_tier: string;
  status: string;
  activation_limit: number;
  activation_usage: number;
  customer_email: string;
  customer_name: string;
  created_at: string;
  expires_at: string | null;
  source: "supabase" | "store";
}

export async function GET() {
  const isAdmin = await isAuthenticatedAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized. Admin passkey required." }, { status: 401 });
  }

  const allLicenses: AdminLicenseResponse[] = [];

  // 1. Load from Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc("admin_list_all_licenses");
      if (!rpcError && Array.isArray(rpcData)) {
        for (const row of rpcData) {
          allLicenses.push({
            id: row.id,
            license_key: row.license_key,
            plan_tier: row.plan_tier || "pro",
            status: row.status || "active",
            activation_limit: row.activation_limit || 2,
            activation_usage: row.activation_usage || 0,
            customer_email: row.customer_email || "unknown@camverse.app",
            customer_name: row.customer_name || "Valued User",
            created_at: row.created_at || new Date().toISOString(),
            expires_at: row.expires_at || null,
            source: "supabase",
          });
        }
      } else {
        // Fallback to direct select
        const { data: selectData, error: selectError } = await supabase
          .from("license_keys")
          .select("*")
          .order("created_at", { ascending: false });

        if (!selectError && Array.isArray(selectData)) {
          for (const row of selectData) {
            allLicenses.push({
              id: row.id,
              license_key: row.license_key,
              plan_tier: row.plan_tier || "pro",
              status: row.status || "active",
              activation_limit: row.activation_limit || 2,
              activation_usage: row.activation_usage || 0,
              customer_email: row.customer_email || "unknown@camverse.app",
              customer_name: row.customer_name || "Valued User",
              created_at: row.created_at || new Date().toISOString(),
              expires_at: row.expires_at || null,
              source: "supabase",
            });
          }
        }
      }
    } catch (err) {
      console.warn("[admin-licenses] Supabase fetch warning:", err);
    }
  }

  // 2. Load from payment store
  const storeLicenses = getAllStoreLicenses();
  for (const s of storeLicenses) {
    // avoid duplicates if already present by key
    if (!allLicenses.some((l) => l.license_key === s.licenseKey)) {
      allLicenses.push({
        id: s.id,
        license_key: s.licenseKey,
        plan_tier: s.planTier,
        status: s.status,
        activation_limit: s.activationLimit,
        activation_usage: s.activationUsage,
        customer_email: s.customerEmail,
        customer_name: s.customerName || "Customer",
        created_at: new Date(s.createdAt).toISOString(),
        expires_at: s.expiresAt || null,
        source: "store",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    total: allLicenses.length,
    licenses: allLicenses,
  });
}

export async function POST(request: Request) {
  const isAdmin = await isAuthenticatedAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized. Admin passkey required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      customerEmail,
      customerName,
      planTier = "pro",
      activationLimit = 2,
      expiresAt = null,
    } = body;

    if (!customerEmail || typeof customerEmail !== "string") {
      return NextResponse.json(
        { ok: false, error: "Customer email is required." },
        { status: 400 }
      );
    }

    let createdLicense: AdminLicenseResponse | null = null;

    // 1. Try Supabase admin RPC or table insert
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc("admin_create_license", {
          p_customer_email: customerEmail.trim().toLowerCase(),
          p_customer_name: customerName?.trim() || null,
          p_plan_tier: planTier,
          p_activation_limit: Number(activationLimit),
          p_expires_at: expiresAt || null,
        });

        if (!error && data?.license_key) {
          createdLicense = {
            id: data.license_id,
            license_key: data.license_key,
            plan_tier: data.plan_tier,
            status: "active",
            activation_limit: data.activation_limit,
            activation_usage: 0,
            customer_email: customerEmail.trim().toLowerCase(),
            customer_name: customerName?.trim() || "Valued User",
            created_at: new Date().toISOString(),
            expires_at: data.expires_at || null,
            source: "supabase",
          };
        }
      } catch (err) {
        console.warn("[admin-licenses] Supabase creation error, falling back:", err);
      }
    }

    // 2. Fallback to store
    if (!createdLicense) {
      const storeLic = createAdminStoreLicense({
        email: customerEmail,
        fullName: customerName,
        planTier,
        activationLimit: Number(activationLimit),
        expiresAt,
      });

      createdLicense = {
        id: storeLic.id,
        license_key: storeLic.licenseKey,
        plan_tier: storeLic.planTier,
        status: storeLic.status,
        activation_limit: storeLic.activationLimit,
        activation_usage: storeLic.activationUsage,
        customer_email: storeLic.customerEmail,
        customer_name: storeLic.customerName || "Customer",
        created_at: new Date(storeLic.createdAt).toISOString(),
        expires_at: storeLic.expiresAt || null,
        source: "store",
      };
    }

    return NextResponse.json({
      ok: true,
      message: `License created successfully: ${createdLicense.license_key}`,
      license: createdLicense,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create license.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const isAdmin = await isAuthenticatedAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized. Admin passkey required." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { licenseId, licenseKey, activationLimit, expiresAt, status } = body;

    if (!licenseKey) {
      return NextResponse.json({ ok: false, error: "License key is required." }, { status: 400 });
    }

    let updated = false;

    // 1. Try Supabase
    if (isSupabaseConfigured && supabase && licenseId) {
      try {
        const { error } = await supabase.rpc("admin_update_license", {
          p_license_id: licenseId,
          p_activation_limit: activationLimit !== undefined ? Number(activationLimit) : null,
          p_expires_at: expiresAt || null,
          p_status: status || null,
        });

        if (!error) {
          updated = true;
        } else {
          // Direct table update fallback
          const updates: Record<string, unknown> = {};
          if (activationLimit !== undefined) updates.activation_limit = Number(activationLimit);
          if (expiresAt !== undefined) updates.expires_at = expiresAt;
          if (status !== undefined) updates.status = status;

          const { error: directError } = await supabase
            .from("license_keys")
            .update(updates)
            .eq("license_key", licenseKey);

          if (!directError) updated = true;
        }
      } catch (err) {
        console.warn("[admin-licenses] Supabase update warning:", err);
      }
    }

    // 2. Also update in payment store
    const storeUpdated = updateAdminStoreLicense(licenseKey, {
      activationLimit: activationLimit !== undefined ? Number(activationLimit) : undefined,
      expiresAt,
      status,
    });

    if (storeUpdated) updated = true;

    return NextResponse.json({
      ok: true,
      message: `License ${licenseKey} updated successfully.`,
      updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update license.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
