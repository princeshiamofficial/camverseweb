/**
 * Payment session store.
 *
 * Development stand-in for the `payments` + `subscriptions` tables.
 * In production, replace with your database (Prisma/Drizzle/etc.) — the
 * interface below maps 1:1 to those entities.
 *
 * SECURITY: the server computes the chargeable amount from src/data/plans.ts
 * and server-side coupon validation. Amounts arriving from the client are
 * never trusted.
 */
import { randomUUID, createHmac, timingSafeEqual } from "crypto";
import { LAUNCH_COUPON, PLANS, type BillingPeriod, type PlanId } from "@/data/plans";
import { validateCoupon } from "@/lib/coupon";
import { env } from "@/lib/env";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "expired";

export interface CheckoutSession {
  id: string;
  planId: PlanId;
  period: BillingPeriod;
  fullName: string;
  email: string;
  phone: string;
  couponCode: string | null;
  /** Server-computed authoritative amount. */
  amount: number;
  discount: number;
  regular: number;
  status: PaymentStatus;
  transactionId: string | null;
  /** Expiring one-time account setup token, generated after verified payment. */
  setupToken: string | null;
  setupTokenExpiresAt: number | null;
  licenseKey: string | null;
  createdAt: number;
  paidAt: number | null;
}

export interface UserLicense {
  id: string;
  licenseKey: string;
  planTier: PlanId;
  status: "active" | "expired" | "revoked";
  customerEmail: string;
  customerName?: string;
  createdAt: number;
  activationLimit: number;
  activationUsage: number;
  expiresAt?: string | null;
}

interface StoreShape {
  sessions: Map<string, CheckoutSession>;
  usedSetupTokens: Set<string>;
  licenses: Map<string, UserLicense[]>;
}

// Cache on globalThis so dev HMR and multiple route modules share one store.
const globalStore = globalThis as unknown as { __camverseStore?: StoreShape };
const store: StoreShape =
  globalStore.__camverseStore ??
  (globalStore.__camverseStore = {
    sessions: new Map(),
    usedSetupTokens: new Set(),
    licenses: new Map(),
  });

export function computeAmount(
  planId: PlanId,
  period: BillingPeriod,
  couponCode: string | null
): { regular: number; discount: number; amount: number; couponValid: boolean } {
  const result = validateCoupon(couponCode, planId, period);
  return {
    regular: result.regular,
    discount: result.ok ? result.discount : 0,
    amount: result.ok ? result.total : result.regular,
    couponValid: result.ok,
  };
}

export function createSession(input: {
  planId: PlanId;
  period: BillingPeriod;
  fullName: string;
  email: string;
  phone: string;
  couponCode: string | null;
}): CheckoutSession {
  const { regular, discount, amount } = computeAmount(
    input.planId,
    input.period,
    input.couponCode
  );
  const session: CheckoutSession = {
    id: randomUUID(),
    ...input,
    regular,
    discount,
    amount,
    status: "pending",
    transactionId: null,
    setupToken: null,
    setupTokenExpiresAt: null,
    licenseKey: null,
    createdAt: Date.now(),
    paidAt: null,
  };
  store.sessions.set(session.id, session);
  return session;
}

export function generateLicenseKey(_planId: PlanId = "pro"): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const part = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `CAM-PRO-${part()}-${part()}-${part()}-XP`;
}

export function getLicensesForEmail(email: string): UserLicense[] {
  return store.licenses.get(email.toLowerCase()) || [];
}

export function getSession(id: string): CheckoutSession | undefined {
  return store.sessions.get(id);
}

export function markProcessing(id: string): CheckoutSession | undefined {
  const s = store.sessions.get(id);
  if (s && s.status === "pending") s.status = "processing";
  return s;
}

export function markPaid(id: string, transactionId: string): CheckoutSession | undefined {
  const s = store.sessions.get(id);
  if (!s) return undefined;
  if (s.status === "paid") return s; // idempotent — webhook may fire twice
  s.status = "paid";
  s.transactionId = transactionId;
  s.paidAt = Date.now();
  // One-time, expiring setup token for the secure "Set Your Password" flow.
  s.setupToken = randomUUID().replace(/-/g, "") + randomUUID().replace(/-/g, "");
  s.setupTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  // Issue real formatted CamVerse License key for the customer
  if (!s.licenseKey) {
    s.licenseKey = generateLicenseKey(s.planId);
  }
  const license: UserLicense = {
    id: s.id,
    licenseKey: s.licenseKey,
    planTier: s.planId,
    status: "active",
    customerEmail: s.email.toLowerCase(),
    customerName: s.fullName,
    createdAt: Date.now(),
    activationLimit: s.planId === "agency" ? 5 : 2,
    activationUsage: 0,
  };
  const list = store.licenses.get(s.email.toLowerCase()) || [];
  if (!list.some((l) => l.licenseKey === license.licenseKey)) {
    list.push(license);
    store.licenses.set(s.email.toLowerCase(), list);
  }

  return s;
}

export function markFailed(id: string): CheckoutSession | undefined {
  const s = store.sessions.get(id);
  if (s && s.status !== "paid") s.status = "failed";
  return s;
}

export function consumeSetupToken(
  token: string
): { email: string; planId: PlanId; period: BillingPeriod } | null {
  if (store.usedSetupTokens.has(token)) return null; // one-time use
  for (const s of store.sessions.values()) {
    if (s.setupToken === token && s.status === "paid") {
      if (!s.setupTokenExpiresAt || s.setupTokenExpiresAt < Date.now()) return null;
      store.usedSetupTokens.add(token);
      return { email: s.email, planId: s.planId, period: s.period };
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Webhook signature helpers (HMAC over the raw body)                  */
/* ------------------------------------------------------------------ */
export function signPayload(rawBody: string): string {
  return createHmac("sha256", env.paymentWebhookSecret)
    .update(rawBody)
    .digest("hex");
}

export function verifySignature(rawBody: string, signature: string): boolean {
  const expected = signPayload(rawBody);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature ?? "", "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Approximate plan expiry from purchase date. */
export function expiryFor(period: BillingPeriod, from = new Date()): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + (period === "3m" ? 3 : 1));
  return d;
}

export const planLabel = (planId: PlanId) => PLANS[planId].name;
export const couponCode = LAUNCH_COUPON.code;

/* ------------------------------------------------------------------ */
/* Admin Management Helpers                                           */
/* ------------------------------------------------------------------ */
export function getAllSessions(): CheckoutSession[] {
  return Array.from(store.sessions.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getAllStoreLicenses(): UserLicense[] {
  const all: UserLicense[] = [];
  for (const list of store.licenses.values()) {
    all.push(...list);
  }
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export function createAdminStoreLicense(input: {
  email: string;
  fullName?: string;
  planTier?: string;
  activationLimit?: number;
  expiresAt?: string | null;
}): UserLicense {
  const email = input.email.trim().toLowerCase();
  const licenseKey = generateLicenseKey((input.planTier as PlanId) || "pro");
  const license: UserLicense = {
    id: `store-lic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    licenseKey,
    planTier: (input.planTier as PlanId) || "pro",
    status: "active",
    customerEmail: email,
    customerName: input.fullName?.trim() || "Valued Creator",
    createdAt: Date.now(),
    activationLimit: input.activationLimit || 2,
    activationUsage: 0,
    expiresAt: input.expiresAt || null,
  };

  const list = store.licenses.get(email) || [];
  list.unshift(license);
  store.licenses.set(email, list);
  return license;
}

export function updateAdminStoreLicense(
  licenseKey: string,
  updates: Partial<Pick<UserLicense, "status" | "activationLimit" | "expiresAt">>
): UserLicense | null {
  for (const list of store.licenses.values()) {
    const found = list.find((l) => l.licenseKey === licenseKey);
    if (found) {
      if (updates.status !== undefined) found.status = updates.status;
      if (updates.activationLimit !== undefined) found.activationLimit = updates.activationLimit;
      if (updates.expiresAt !== undefined) found.expiresAt = updates.expiresAt;
      return found;
    }
  }
  return null;
}
