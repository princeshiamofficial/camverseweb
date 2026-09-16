import {
  extractEmailDomain,
  isDisposableByPattern,
  HEURISTIC_DISPOSABLE_PATTERNS,
  DISPOSABLE_EMAIL_ERROR_MESSAGE,
  DISPOSABLE_EMAIL_ERROR_MESSAGE_BN,
} from "./disposable-email-shared";

export {
  extractEmailDomain,
  isDisposableByPattern,
  DISPOSABLE_EMAIL_ERROR_MESSAGE,
  DISPOSABLE_EMAIL_ERROR_MESSAGE_BN,
};

// In-memory dynamic cache for the community-maintained blocklist
let dynamicBlocklistCache: Set<string> | null = null;
let lastBlocklistFetchTime = 0;
const BLOCKLIST_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
let isFetchingBlocklist = false;

const COMMUNITY_BLOCKLIST_URL =
  "https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf";

/**
 * Fetches the latest community blocklist dynamically without storing hardcoded domains in the repo.
 */
async function getDynamicBlocklist(): Promise<Set<string>> {
  const now = Date.now();
  if (dynamicBlocklistCache && now - lastBlocklistFetchTime < BLOCKLIST_CACHE_TTL_MS) {
    return dynamicBlocklistCache;
  }

  if (isFetchingBlocklist && dynamicBlocklistCache) {
    return dynamicBlocklistCache;
  }

  try {
    isFetchingBlocklist = true;
    const res = await fetch(COMMUNITY_BLOCKLIST_URL, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const text = await res.text();
      const domains = text
        .split("\n")
        .map((line) => line.trim().toLowerCase())
        .filter((line) => line.length > 0 && !line.startsWith("#"));

      dynamicBlocklistCache = new Set(domains);
      lastBlocklistFetchTime = now;
      return dynamicBlocklistCache;
    }
  } catch {
    // If external fetch fails, use existing cache if available
  } finally {
    isFetchingBlocklist = false;
  }

  return dynamicBlocklistCache || new Set();
}

/**
 * Verifies email via Debounce free disposable API.
 */
async function checkDebounceApi(email: string): Promise<boolean | null> {
  try {
    const res = await fetch(
      `https://disposable.debounce.io/?email=${encodeURIComponent(email)}`,
      { signal: AbortSignal.timeout(2500) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { disposable?: string | boolean };
    if (data && (data.disposable === "true" || data.disposable === true)) {
      return true;
    }
    if (data && (data.disposable === "false" || data.disposable === false)) {
      return false;
    }
  } catch {
    // Timeout or network fallback
  }
  return null;
}

/**
 * Verifies domain via Kickbox free disposable API.
 */
async function checkKickboxApi(domain: string): Promise<boolean | null> {
  try {
    const res = await fetch(
      `https://open.kickbox.com/v1/disposable/${encodeURIComponent(domain)}`,
      { signal: AbortSignal.timeout(2500) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { disposable?: boolean };
    if (typeof data.disposable === "boolean") {
      return data.disposable;
    }
  } catch {
    // Timeout or network fallback
  }
  return null;
}

/**
 * Verifies DNS MX records for the domain to catch fake or dead mail hosts.
 */
async function checkDnsMx(domain: string): Promise<{ hasValidMx: boolean; isMxDisposable: boolean }> {
  try {
    if (typeof window !== "undefined") {
      return { hasValidMx: true, isMxDisposable: false };
    }
    const dns = await import("dns");
    const records = await dns.promises.resolveMx(domain);
    if (!records || records.length === 0) {
      return { hasValidMx: false, isMxDisposable: false };
    }

    // Check if MX exchange host itself is known disposable
    const isMxDisposable = records.some((record) => {
      const exchange = (record.exchange || "").toLowerCase();
      return HEURISTIC_DISPOSABLE_PATTERNS.some((p) => p.test(exchange));
    });

    return { hasValidMx: true, isMxDisposable };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return { hasValidMx: false, isMxDisposable: false };
    }
    return { hasValidMx: true, isMxDisposable: false };
  }
}

export interface DisposableCheckResult {
  isDisposable: boolean;
  isValidEmail: boolean;
  reason?: string;
}

/**
 * Comprehensive, dynamic disposable email checker (Server-side & API).
 * Operates completely without hardcoded email or domain lists.
 */
export async function checkDisposableEmail(email: string): Promise<DisposableCheckResult> {
  const domain = extractEmailDomain(email);
  if (!domain || !domain.includes(".")) {
    return { isDisposable: false, isValidEmail: false, reason: "Invalid email format" };
  }

  // 1. Fast heuristic pattern check (no hardcoded domains)
  if (isDisposableByPattern(email)) {
    return { isDisposable: true, isValidEmail: true, reason: "Matches disposable naming pattern" };
  }

  // 2. Check dynamic community blocklist (asynchronously loaded & cached)
  try {
    const blocklist = await getDynamicBlocklist();
    if (blocklist.has(domain)) {
      return { isDisposable: true, isValidEmail: true, reason: "Present in dynamic disposable registry" };
    }
  } catch {
    // Ignore and proceed to live checks
  }

  // 3. Parallel live API verifications (Debounce & Kickbox)
  try {
    const [debounceResult, kickboxResult] = await Promise.all([
      checkDebounceApi(email),
      checkKickboxApi(domain),
    ]);

    if (debounceResult === true || kickboxResult === true) {
      return { isDisposable: true, isValidEmail: true, reason: "Identified by real-time disposable verification" };
    }
  } catch {
    // Fall back to DNS check
  }

  // 4. DNS MX record validation
  const mxCheck = await checkDnsMx(domain);
  if (mxCheck.isMxDisposable) {
    return { isDisposable: true, isValidEmail: true, reason: "Mail exchange server is disposable" };
  }

  if (!mxCheck.hasValidMx) {
    return {
      isDisposable: true,
      isValidEmail: false,
      reason: "Domain does not have valid mail exchange (MX) records",
    };
  }

  return { isDisposable: false, isValidEmail: true };
}
