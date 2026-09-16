"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCheckout } from "./checkout-context";
import type { BillingPeriod, PlanId } from "@/data/plans";

function AutoCheckoutHandler() {
  const searchParams = useSearchParams();
  const { openCheckout } = useCheckout();

  useEffect(() => {
    if (searchParams.get("checkout") === "true") {
      const plan = (searchParams.get("plan") || "pro") as PlanId;
      const period = (searchParams.get("period") || "1m") as BillingPeriod;
      const coupon = searchParams.get("coupon");
      openCheckout(plan, period, coupon);
    }
  }, [searchParams, openCheckout]);

  return null;
}

export function AutoCheckout() {
  return (
    <Suspense fallback={null}>
      <AutoCheckoutHandler />
    </Suspense>
  );
}
