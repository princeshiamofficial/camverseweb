/**
 * Email dispatch.
 *
 * `console` provider logs the email (development). Wire `smtp`/Resend/SendGrid
 * in production — the interface stays the same.
 */
import { env } from "@/lib/env";
import { formatBDT } from "@/lib/format";
import { PLANS, type BillingPeriod, type PlanId } from "@/data/plans";

export interface AccessEmailInput {
  to: string;
  name: string;
  planId: PlanId;
  period: BillingPeriod;
  amount: number;
  expiryDate: Date;
  setupUrl: string;
  loginUrl: string;
}

export async function sendAccessEmail(input: AccessEmailInput): Promise<void> {
  const plan = PLANS[input.planId];
  const periodLabel = input.period === "3m" ? "3 Months" : "1 Month";

  const lines = [
    `To: ${input.to}`,
    `Subject: Welcome to CamVerse ${plan.name} — Set your password`,
    "",
    `Hi ${input.name || "there"},`,
    "",
    `Your CamVerse ${plan.name} (${periodLabel}) subscription is active.`,
    `Paid: ${formatBDT(input.amount)} • Expires: ${input.expiryDate.toDateString()}`,
    "",
    "- CamVerse Login URL: " + input.loginUrl,
    "- Username / Email: " + input.to,
    "- Secure Account Setup Link (expires in 24h): " + input.setupUrl,
    "- Selected Plan: CamVerse " + plan.name,
    "- Subscription Expiry Date: " + input.expiryDate.toISOString(),
    "- Getting Started Instructions: attached inside",
    "",
    "Security note: we never send permanent passwords by email.",
    "Use the one-time, expiring setup link above to create your password.",
  ];

  if (env.emailProvider === "console") {
    console.info("────── [email:access] ───────\n" + lines.join("\n") + "\n──────────────────────────────");
    return;
  }

  // Production: plug your SMTP/Resend/SendGrid transport here.
  throw new Error(
    "EMAIL_PROVIDER=smtp is not wired yet — configure your transport in src/lib/email.ts"
  );
}

export async function resendAccessEmail(session: {
  email: string;
  fullName: string;
  planId: PlanId;
  period: BillingPeriod;
  amount: number;
  setupToken: string | null;
  setupTokenExpiresAt: number | null;
}): Promise<boolean> {
  if (!session.setupToken) return false;
  const setupUrl = `${env.appUrl}/auth/setup?token=${session.setupToken}`;
  await sendAccessEmail({
    to: session.email,
    name: session.fullName,
    planId: session.planId,
    period: session.period,
    amount: session.amount,
    expiryDate: new Date(
      (session.setupTokenExpiresAt ?? Date.now()) + 30 * 24 * 60 * 60 * 1000
    ),
    setupUrl,
    loginUrl: `${env.appUrl}/login`,
  });
  return true;
}
