import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/admin-auth";
import { getAllSessions } from "@/lib/payment-store";

export async function GET() {
  const isAdmin = await isAuthenticatedAdmin();
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Unauthorized. Admin passkey required." }, { status: 401 });
  }

  const sessions = getAllSessions();

  const metrics = {
    totalOrders: sessions.length,
    paidOrders: sessions.filter((s) => s.status === "paid").length,
    pendingOrders: sessions.filter((s) => s.status === "pending").length,
    totalRevenueBDT: sessions
      .filter((s) => s.status === "paid")
      .reduce((sum, s) => sum + s.amount, 0),
  };

  return NextResponse.json({
    ok: true,
    metrics,
    orders: sessions,
  });
}
