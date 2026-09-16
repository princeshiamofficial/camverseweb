"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function GatewayActions() {
  const params = useSearchParams();
  const sessionId = params.get("session") ?? "";
  const amount = params.get("amount") ?? "";
  const [busy, setBusy] = useState<"success" | "failed" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fire = async (event: "payment.succeeded" | "payment.failed") => {
    if (!sessionId) {
      setError("Missing session id — start checkout from the pricing section.");
      return;
    }
    setBusy(event === "payment.succeeded" ? "success" : "failed");
    setError(null);
    try {
      // In production the GATEWAY calls this endpoint with its own HMAC
      // signature. The mock signs with the same dev secret to emulate it.
      const res = await fetch("/api/mock-gateway/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, event, amount: Number(amount) || 0 }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error ?? "Webhook failed.");
        setBusy(null);
        return;
      }
      window.location.href =
        event === "payment.succeeded"
          ? `/payment/success?session=${encodeURIComponent(sessionId)}`
          : "/payment/success";
    } catch {
      setError("নেটওয়ার্ক সমস্যা।");
      setBusy(null);
    }
  };

  return (
    <div className="mt-7 space-y-3">
      <div className="rounded-2xl bg-slate-50 p-4 text-left text-sm">
        <p className="flex justify-between">
          <span className="text-slate-500">Session</span>
          <span className="max-w-[10rem] truncate font-mono text-xs text-slate-700">
            {sessionId || "—"}
          </span>
        </p>
        <p className="mt-1.5 flex justify-between">
          <span className="text-slate-500">Amount</span>
          <span className="font-bold text-slate-900">৳{amount || "—"}</span>
        </p>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => fire("payment.succeeded")}
        disabled={busy !== null}
        className="btn btn-primary btn-md w-full disabled:opacity-60"
      >
        {busy === "success" ? "প্রসেসিং…" : "Simulate Successful Payment"}
      </button>
      <button
        type="button"
        onClick={() => fire("payment.failed")}
        disabled={busy !== null}
        className="btn btn-secondary btn-md w-full disabled:opacity-60"
      >
        {busy === "failed" ? "প্রসেসিং…" : "Simulate Failed Payment"}
      </button>
    </div>
  );
}

export function MockGatewayClient() {
  return (
    <Suspense fallback={null}>
      <GatewayActions />
    </Suspense>
  );
}
