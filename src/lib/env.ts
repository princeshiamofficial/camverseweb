/**
 * Environment access. In production set these via your hosting provider.
 * Defaults keep local development and the build working without secrets.
 */
function resolveAppUrl(): string {
  const envUrl = process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl && envUrl.length > 0) {
    return envUrl.startsWith("http://") || envUrl.startsWith("https://")
      ? envUrl
      : `https://${envUrl}`;
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd && vercelProd.length > 0) {
    return `https://${vercelProd}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl && vercelUrl.length > 0) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  siteUrl: resolveAppUrl(),
  appUrl: resolveAppUrl(),
  paymentGatewayUrl:
    process.env.PAYMENT_GATEWAY_URL ?? "https://sandbox.payment-gateway.example",
  paymentApiKey: process.env.PAYMENT_API_KEY ?? "",
  paymentWebhookSecret:
    process.env.PAYMENT_WEBHOOK_SECRET ?? "dev-webhook-secret",
  emailProvider: (process.env.EMAIL_PROVIDER ?? "console") as
    | "console"
    | "smtp",
} as const;

export function isProd(): boolean {
  return env.nodeEnv === "production";
}
