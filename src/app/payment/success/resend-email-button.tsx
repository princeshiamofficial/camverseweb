"use client";

import { useState } from "react";

export function ResendEmailButton({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const resend = async () => {
    setState("sending");
    try {
      const res = await fetch("/api/account/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setState("sent");
        setMessage("Access email আবার পাঠানো হয়েছে। Inbox check করুন।");
      } else {
        setState("error");
        setMessage(data.error ?? "পাঠানো যায়নি। কিছুক্ষণ পর চেষ্টা করুন।");
      }
    } catch {
      setState("error");
      setMessage("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।");
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={resend}
        disabled={state === "sending" || state === "sent"}
        className="btn btn-secondary btn-md w-full disabled:opacity-60"
      >
        {state === "sending"
          ? "পাঠানো হচ্ছে…"
          : state === "sent"
            ? "Email Resent Successfully"
            : "Resend Access Email"}
      </button>
      {message ? (
        <p
          className={`mt-2 text-xs font-medium ${
            state === "error" ? "text-red-600" : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
