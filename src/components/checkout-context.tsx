"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { BillingPeriod, PlanId } from "@/data/plans";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { CheckoutModal } from "./checkout-modal";

interface CheckoutState {
  open: boolean;
  planId: PlanId;
  period: BillingPeriod;
  /** Coupon pre-filled because the visitor arrived via a Blast Sale CTA. */
  prefillCoupon: string | null;
  user: User | null;
}

interface CheckoutContextValue extends CheckoutState {
  openCheckout: (
    planId: PlanId,
    period?: BillingPeriod,
    prefillCoupon?: string | null
  ) => void;
  closeCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used within <CheckoutProvider>");
  }
  return ctx;
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [state, setState] = useState<Omit<CheckoutState, "user">>({
    open: false,
    planId: "pro",
    period: "1m",
    prefillCoupon: null,
  });

  // Track Supabase Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openCheckout = useCallback(
    (planId: PlanId, period: BillingPeriod = "1m", prefillCoupon: string | null = null) => {
      // REQUIREMENT: Must be logged in to purchase a license!
      if (!user) {
        const query = new URLSearchParams({
          redirect: "checkout",
          plan: planId,
          period,
        });
        if (prefillCoupon) query.set("coupon", prefillCoupon);

        router.push(`/login?${query.toString()}`);
        return;
      }

      setState({ open: true, planId, period, prefillCoupon });
    },
    [user, router]
  );

  const closeCheckout = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      user,
      openCheckout,
      closeCheckout,
    }),
    [state, user, openCheckout, closeCheckout]
  );

  return (
    <CheckoutContext.Provider value={value}>
      {children}
      <CheckoutModal />
    </CheckoutContext.Provider>
  );
}
