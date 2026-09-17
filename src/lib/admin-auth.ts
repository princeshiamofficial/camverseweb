import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const ADMIN_COOKIE_NAME = "camverse_admin_session";
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Creates an HMAC signed session token including the admin email.
 * Format: `<base64Email>.<timestamp>.<signature>`
 */
export function createAdminSessionToken(email = "admin@camverse.app"): string {
  const emailB64 = Buffer.from(email.trim().toLowerCase(), "utf8").toString("base64url");
  const timestamp = Date.now().toString();
  const payload = `${emailB64}.${timestamp}`;
  const signature = createHmac("sha256", env.adminSessionSecret)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

/**
 * Verifies that the given token is authentic, untampered, and not expired.
 * Returns the authenticated email or null.
 */
export function verifyAdminSessionToken(token: string | null | undefined): { valid: boolean; email?: string } {
  if (!token || typeof token !== "string") return { valid: false };
  const parts = token.split(".");

  // Support 3 parts: <emailB64>.<timestamp>.<signature>
  if (parts.length === 3) {
    const [emailB64, timestampStr, signature] = parts;
    const timestamp = Number.parseInt(timestampStr, 10);
    if (Number.isNaN(timestamp)) return { valid: false };

    // Expiry check
    if (Date.now() - timestamp > SESSION_MAX_AGE_MS || timestamp > Date.now() + 60000) {
      return { valid: false };
    }

    const payload = `${emailB64}.${timestampStr}`;
    const expectedSignature = createHmac("sha256", env.adminSessionSecret)
      .update(payload)
      .digest("hex");

    const sigBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { valid: false };
    }

    try {
      const email = Buffer.from(emailB64, "base64url").toString("utf8");
      return { valid: true, email };
    } catch {
      return { valid: true, email: "admin@camverse.app" };
    }
  }

  // Legacy 2 parts fallback: <timestamp>.<signature>
  if (parts.length === 2) {
    const [timestampStr, signature] = parts;
    const timestamp = Number.parseInt(timestampStr, 10);
    if (Number.isNaN(timestamp)) return { valid: false };

    if (Date.now() - timestamp > SESSION_MAX_AGE_MS || timestamp > Date.now() + 60000) {
      return { valid: false };
    }

    const expectedSignature = createHmac("sha256", env.adminSessionSecret)
      .update(timestampStr)
      .digest("hex");

    const sigBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (sigBuffer.length === expectedBuffer.length && timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { valid: true, email: "admin@camverse.app" };
    }
  }

  return { valid: false };
}

/**
 * Verifies email and password directly against Supabase Auth and Database.
 * No hardcoded admin credentials in .env required!
 */
export async function verifyAdminCredentials(
  email: string,
  pass: string
): Promise<{ valid: boolean; email?: string; error?: string }> {
  if (!email || !pass) {
    return { valid: false, error: "Email and password are required." };
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Primary verification: Supabase Auth
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (!error && data?.user) {
        // Inspect role & metadata
        const metadataRole =
          data.user.user_metadata?.role || data.user.app_metadata?.role;
        const isKnownAdmin =
          cleanEmail === "admin@camverse.app" || cleanEmail.endsWith("@camverse.app");
        const hasAdminRole =
          metadataRole === "admin" || metadataRole === "superadmin";

        // Check optional public.admin_users table if present
        let inAdminTable = false;
        try {
          const { data: adminRow } = await supabase
            .from("admin_users")
            .select("email, is_active")
            .eq("email", cleanEmail)
            .maybeSingle();

          if (adminRow && adminRow.is_active !== false) {
            inAdminTable = true;
          }
        } catch {
          // table may not exist yet; fallback to metadata
        }

        if (hasAdminRole || inAdminTable || isKnownAdmin) {
          // Sign out client session to avoid persistent client token on server
          try {
            await supabase.auth.signOut();
          } catch {
            // ignore
          }

          return { valid: true, email: data.user.email || cleanEmail };
        }

        return {
          valid: false,
          error: "This account does not have administrative privileges in Supabase.",
        };
      }

      if (error) {
        return {
          valid: false,
          error: error.message || "Invalid Supabase login credentials.",
        };
      }
    } catch (err: unknown) {
      console.error("Supabase Admin Auth error:", err);
      return {
        valid: false,
        error: "Supabase connection error during authentication.",
      };
    }
  }

  return {
    valid: false,
    error: "Supabase is not configured. Please check your Supabase connection.",
  };
}

/**
 * Checks whether the current request is from an authenticated admin.
 */
export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token).valid;
}

/**
 * Returns admin user info if authenticated.
 */
export async function getAdminUser(): Promise<{ email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const result = verifyAdminSessionToken(token);
  if (result.valid && result.email) {
    return { email: result.email };
  }
  return null;
}

