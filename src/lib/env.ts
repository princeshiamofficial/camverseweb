/**
 * Environment access. In production set these via your hosting provider.
 * Defaults keep local development and the build working without secrets.
 */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  appUrl: process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
