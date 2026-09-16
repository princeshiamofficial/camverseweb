"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/icons";

export function SetupPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }
    if (password !== confirm) {
      setError("দুটি password মিলছে না।");
      return;
    }
    setBusy(true);
    // Production: POST to /api/auth/setup which hashes (bcrypt/argon2) and stores it.
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    setDone(true);
    track("account_setup_complete");
  };

  if (done) {
    return (
      <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Icon name="check" size={20} />
        </div>
        <p className="mt-3 font-display text-lg font-bold text-emerald-800">
          Password set successfully!
        </p>
        <p className="mt-1 text-sm text-emerald-700">
          এখন আপনি আপনার CamVerse account-এ login করতে পারবেন।
        </p>
        <a href="/login" className="btn btn-primary btn-md mt-4 w-full">
          Login to CamVerse →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="setup-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
          New Password
        </label>
        <input
          id="setup-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-[15px] focus:border-brand focus:outline-none focus:ring-2 focus:ring-[var(--primary-ring)]"
        />
        <p className="mt-1 text-xs text-slate-400">কমপক্ষে ৮ অক্ষর।</p>
      </div>
      <div>
        <label htmlFor="setup-confirm" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Confirm Password
        </label>
        <input
          id="setup-confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-[15px] focus:border-brand focus:outline-none focus:ring-2 focus:ring-[var(--primary-ring)]"
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="btn btn-primary btn-md w-full disabled:opacity-60">
        {busy ? "সেভ হচ্ছে…" : "Set Password & Continue"}
      </button>
    </form>
  );
}
