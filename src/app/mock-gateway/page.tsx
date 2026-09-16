import type { Metadata } from "next";
import { MockGatewayClient } from "./mock-gateway-client";

export const metadata: Metadata = {
  title: "Mock Payment Gateway",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function MockGatewayPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-slate-100 px-4 py-16">
      <div className="w-full max-w-md">
        <div className="card rounded-[1.5rem] p-8 shadow-card">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400">
            Development only
          </p>
          <h1 className="mt-2 text-center font-display text-2xl font-bold text-slate-900">
            Mock Payment Gateway
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
            Production-এ এই page-এর জায়গায় আসবে আসল payment gateway
            (SSLCommerz / bKash / Stripe)। Payment verify হবে webhook
            signature-এর মাধ্যমে — frontend success URL দিয়ে কখনো নয়।
          </p>
          <MockGatewayClient />
        </div>
      </div>
    </main>
  );
}
