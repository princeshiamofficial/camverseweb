"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Icon, Logo } from "@/components/icons";

interface AdminLicense {
  id: string;
  license_key: string;
  plan_tier: string;
  status: string;
  activation_limit: number;
  activation_usage: number;
  customer_email: string;
  customer_name: string;
  created_at: string;
  expires_at: string | null;
  source: "supabase" | "store";
}

interface OrderSession {
  id: string;
  planId: string;
  fullName: string;
  email: string;
  phone: string;
  amount: number;
  status: string;
  transactionId: string | null;
  licenseKey: string | null;
  createdAt: number;
}

type AdminTab = "overview" | "licenses" | "orders" | "tracking" | "settings";

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUserEmail, setAdminUserEmail] = useState<string>("admin@camverse.app");
  const [emailInput, setEmailInput] = useState("admin@camverse.app");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Layout & Navigation
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [licenses, setLicenses] = useState<AdminLicense[]>([]);
  const [orders, setOrders] = useState<OrderSession[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tracking state (Facebook Pixel & Google Tag Manager)
  const [gtmId, setGtmId] = useState("");
  const [gtmEnabled, setGtmEnabled] = useState(false);
  const [fbPixelId, setFbPixelId] = useState("");
  const [fbPixelEnabled, setFbPixelEnabled] = useState(false);
  const [trackingSaving, setTrackingSaving] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");

  // Modal: Create License
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newTier, setNewTier] = useState<"pro" | "agency" | "lifetime">("pro");
  const [newDeviceLimit, setNewDeviceLimit] = useState(2);
  const [newExpiryType, setNewExpiryType] = useState<"lifetime" | "30days" | "1year" | "custom">("lifetime");
  const [newCustomExpiry, setNewCustomExpiry] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Modal: Edit License
  const [editingLicense, setEditingLicense] = useState<AdminLicense | null>(null);
  const [editLimit, setEditLimit] = useState(2);
  const [editStatus, setEditStatus] = useState<string>("active");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Check auth on load
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        if (data.user?.email) {
          setAdminUserEmail(data.user.email);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  // Fetch tracking settings (Facebook Pixel & GTM)
  const loadTrackingData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tracking");
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.config) {
          setGtmId(data.config.gtmId || "");
          setGtmEnabled(Boolean(data.config.gtmEnabled));
          setFbPixelId(data.config.fbPixelId || "");
          setFbPixelEnabled(Boolean(data.config.fbPixelEnabled));
        }
      }
    } catch (err) {
      console.warn("Failed to load tracking data:", err);
    }
  }, []);

  // Fetch licenses and orders
  const loadDashboardData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [licRes, orderRes] = await Promise.all([
        fetch("/api/admin/licenses"),
        fetch("/api/admin/orders"),
      ]);

      if (licRes.ok) {
        const licData = await licRes.json();
        if (licData.ok && Array.isArray(licData.licenses)) {
          setLicenses(licData.licenses);
        }
      }

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData.ok && Array.isArray(orderData.orders)) {
          setOrders(orderData.orders);
        }
      }

      await loadTrackingData();
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setDataLoading(false);
    }
  }, [loadTrackingData]);

  // Save Tracking Settings
  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gtmId: gtmId.trim(),
          gtmEnabled,
          fbPixelId: fbPixelId.trim(),
          fbPixelEnabled,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setFeedback({
          type: "success",
          text: "Tracking configurations (Facebook Pixel & GTM) updated successfully!",
        });
      } else {
        setFeedback({
          type: "error",
          text: data.error || "Failed to update tracking configurations.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Network error while saving tracking configuration.",
      });
    } finally {
      setTrackingSaving(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void loadDashboardData();
    }
  }, [isAuthenticated, loadDashboardData]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!emailInput.trim() || !passwordInput) {
      setAuthError("Please provide both email and password.");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setIsAuthenticated(true);
        if (data.user?.email) setAdminUserEmail(data.user.email);
        setPasswordInput("");
      } else {
        setAuthError(data.error || "Invalid credentials. Access denied.");
      }
    } catch {
      setAuthError("Failed to authenticate. Please check server connection.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } finally {
      setIsAuthenticated(false);
      setLicenses([]);
      setOrders([]);
      setPasswordInput("");
    }
  };

  // Copy License Key
  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Calculate Expiry Date Helper
  const computeExpiryDate = (type: string, customDate: string): string | null => {
    if (type === "lifetime") return null;
    if (type === "30days") {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    if (type === "1year") {
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }
    if (type === "custom" && customDate) {
      return new Date(customDate).toISOString();
    }
    return null;
  };

  // Create License
  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setFeedback({ type: "error", text: "Customer email is required." });
      return;
    }

    setCreateSubmitting(true);
    setFeedback(null);

    const calculatedExpiry = computeExpiryDate(newExpiryType, newCustomExpiry);

    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: newEmail.trim(),
          customerName: newName.trim(),
          planTier: newTier,
          activationLimit: Number(newDeviceLimit),
          expiresAt: calculatedExpiry,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setFeedback({
          type: "success",
          text: `License issued: ${data.license?.license_key || "Created successfully!"}`,
        });
        setIsCreateOpen(false);
        setNewEmail("");
        setNewName("");
        setNewDeviceLimit(2);
        setNewExpiryType("lifetime");
        setNewCustomExpiry("");
        await loadDashboardData();
        setActiveTab("licenses");
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to create license." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error creating license key." });
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEdit = (lic: AdminLicense) => {
    setEditingLicense(lic);
    setEditLimit(lic.activation_limit);
    setEditStatus(lic.status);
    setEditExpiryDate(lic.expires_at ? lic.expires_at.slice(0, 10) : "");
    setFeedback(null);
  };

  // Update License
  const handleUpdateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLicense) return;

    setEditSubmitting(true);
    setFeedback(null);

    const isoExpiry = editExpiryDate ? new Date(editExpiryDate).toISOString() : null;

    try {
      const res = await fetch("/api/admin/licenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseId: editingLicense.id,
          licenseKey: editingLicense.license_key,
          activationLimit: Number(editLimit),
          status: editStatus,
          expiresAt: isoExpiry,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setFeedback({
          type: "success",
          text: `Updated ${editingLicense.license_key} successfully.`,
        });
        setEditingLicense(null);
        await loadDashboardData();
      } else {
        setFeedback({ type: "error", text: data.error || "Failed to update license." });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to update license." });
    } finally {
      setEditSubmitting(false);
    }
  };

  // Quick Toggle Status (Active <-> Revoked)
  const toggleStatusQuick = async (lic: AdminLicense) => {
    const nextStatus = lic.status === "active" ? "revoked" : "active";
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseId: lic.id,
          licenseKey: lic.license_key,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Marked ${lic.license_key} as ${nextStatus}.`,
        });
        await loadDashboardData();
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to update status." });
    }
  };

  // Customer Initials Avatar Helper
  const getInitials = useCallback((name?: string, email?: string) => {
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email && email.trim().length > 0) {
      return email.slice(0, 2).toUpperCase();
    }
    return "CV";
  }, []);

  // Filtered Licenses
  const filteredLicenses = useMemo(() => {
    return licenses.filter((lic) => {
      const matchSearch =
        !searchQuery.trim() ||
        lic.license_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lic.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lic.customer_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "all" || lic.status === statusFilter;
      const matchTier = tierFilter === "all" || lic.plan_tier === tierFilter;

      return matchSearch && matchStatus && matchTier;
    });
  }, [licenses, searchQuery, statusFilter, tierFilter]);

  // Overall KPIs
  const kpis = useMemo(() => {
    const total = licenses.length;
    const active = licenses.filter((l) => l.status === "active").length;
    const totalSeats = licenses.reduce((sum, l) => sum + (l.activation_limit || 2), 0);
    const paidOrders = orders.filter((o) => o.status === "paid");
    const totalRevenueBDT = paidOrders.reduce((sum, o) => sum + o.amount, 0);

    return { total, active, totalSeats, totalRevenueBDT, paidCount: paidOrders.length };
  }, [licenses, orders]);

  // ─────────────────────────────────────────────────────────────
  // 1. Initial Auth Checking State
  // ─────────────────────────────────────────────────────────────
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="font-mono text-xs uppercase tracking-widest text-slate-500 font-semibold">
            Checking Admin Clearance...
          </span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Admin Login Gate Screen (Minimalist White Theme)
  // ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 text-slate-800">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
                <Icon name="shield" size={26} className="text-indigo-600" />
              </div>
              <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-slate-900">
                CamVerse Admin
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Sign in with your administrative credentials
              </p>
            </div>

            {authError && (
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700">
                <Icon name="alert-circle" size={16} className="shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="admin@camverse.app"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                {authLoading ? "Verifying Credentials..." : "Sign In to Admin Portal"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <Link
                href="/"
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                ← Return to Public Website
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Authenticated Dashboard with Minimal White Theme & Sidebar
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Navigation Header */}
      <div className="flex md:hidden items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <span className="font-display font-bold text-sm text-slate-900">CamVerse Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600"
          title="Toggle Navigation"
        >
          <Icon name="menu" size={18} />
        </button>
      </div>

      {/* ── Left Sidebar (Clean White) ─────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200/90 bg-white p-5 transition-transform duration-200 ease-in-out md:static md:translate-x-0 flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:shadow-none"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="h-7 w-7" />
              <div>
                <div className="font-display font-bold text-base tracking-tight text-slate-900 leading-tight">
                  CamVerse
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 font-semibold">
                  Admin Console
                </div>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-800"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1">
            <button
              onClick={() => {
                setActiveTab("overview");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon name="monitor" size={16} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("licenses");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "licenses"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon name="zap" size={16} />
                <span>Licenses</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                  activeTab === "licenses"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {licenses.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("orders");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon name="credit-card" size={16} />
                <span>Orders & Payments</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                  activeTab === "orders"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("tracking");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "tracking"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon name="target" size={16} />
                <span>Pixel & GTM</span>
              </div>
              {(fbPixelEnabled || gtmEnabled) && (
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="Tracking is active" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon name="sliders" size={16} />
              <span>System & Keys</span>
            </button>
          </nav>

          {/* Quick Action Button */}
          <div className="mt-8 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-all cursor-pointer"
            >
              <span>+ Issue License</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer / User Profile */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white text-xs shrink-0">
                A
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">{adminUserEmail}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                    Super Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-800 transition-colors"
              title="Return to Public Site"
            >
              Website ↗
            </Link>
            <Link
              href="/dashboard"
              className="text-slate-500 hover:text-slate-800 transition-colors"
              title="Open User Dashboard"
            >
              User Portal ↗
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition cursor-pointer"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="border-b border-slate-200/80 bg-white px-6 py-4 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 capitalize">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "licenses" && "License Key Management"}
              {activeTab === "orders" && "Transactions & Orders"}
              {activeTab === "tracking" && "Facebook Pixel & Google Tag Manager"}
              {activeTab === "settings" && "System Configuration & Secrets"}
            </h1>
            <p className="text-xs text-slate-500">
              {activeTab === "overview" && "Live metrics, active licenses, and system health."}
              {activeTab === "licenses" && "Manage customer activations, quotas, and expiration dates."}
              {activeTab === "orders" && "Real-time payment sessions and gateway transactions."}
              {activeTab === "tracking" && "Manage Meta Pixel ID and GTM Container ID without editing code."}
              {activeTab === "settings" && "Configured admin credentials, Supabase database, and API keys."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void loadDashboardData()}
              title="Sync latest records"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-sm"
            >
              <span className={dataLoading ? "animate-spin" : ""}>↻</span>
              <span className="hidden sm:inline">{dataLoading ? "Syncing..." : "Refresh"}</span>
            </button>

            {activeTab !== "licenses" && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-sm"
              >
                <span>+ Issue License</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Feedback Message */}
          {feedback && (
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-medium shadow-sm transition-all ${
                feedback.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <span>{feedback.text}</span>
              <button
                onClick={() => setFeedback(null)}
                className="text-slate-400 hover:text-slate-700 ml-3"
              >
                ✕
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              SECTION 1: OVERVIEW TAB
             ───────────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Licenses */}
                <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Total Licenses
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon name="shield" size={17} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-3xl font-bold text-slate-900 tracking-tight">
                      {kpis.total}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-100/80 font-mono">
                      {kpis.total > 0 ? `${Math.round((kpis.active / kpis.total) * 100)}% active` : "0% active"}
                    </span>
                  </div>
                </div>

                {/* Active Licenses */}
                <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Active Licenses
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon name="check-circle" size={17} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-3xl font-bold text-emerald-600 tracking-tight">
                      {kpis.active}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      of {kpis.total} total
                    </span>
                  </div>
                </div>

                {/* Device Quotas */}
                <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Device Quotas
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon name="monitor" size={17} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-3xl font-bold text-blue-600 tracking-tight">
                      {kpis.totalSeats}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Authorized PCs
                    </span>
                  </div>
                </div>

                {/* Recorded GMV */}
                <div className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Recorded GMV
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-100/80 text-amber-600 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon name="credit-card" size={17} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-3xl font-bold text-slate-900 tracking-tight">
                      ৳{kpis.totalRevenueBDT.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200/60 font-mono">
                      {kpis.paidCount} paid
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Licenses Card (Modern Clean SaaS Table) */}
              <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all">
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 shadow-2xs">
                      <Icon name="lock" size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-display font-bold text-base text-slate-900">Recent License Keys</h3>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200/60 font-mono">
                          {licenses.length} Total
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Provisioned customer licenses, assigned seats, and live status
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-xs cursor-pointer"
                    >
                      <span>+ Issue Key</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("licenses")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer"
                    >
                      <span>View All ({licenses.length})</span>
                      <span className="text-slate-400">→</span>
                    </button>
                  </div>
                </div>

                {/* Table with Clear Columns */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-6">Customer</th>
                        <th className="py-3 px-4">License Key</th>
                        <th className="py-3 px-4">Plan Tier</th>
                        <th className="py-3 px-4">Device Seats</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {licenses.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No licenses provisioned yet. Click &quot;+ Issue Key&quot; to create your first license.
                          </td>
                        </tr>
                      ) : (
                        licenses.slice(0, 6).map((lic) => (
                          <tr
                            key={lic.id}
                            className="group hover:bg-slate-50/70 transition-colors"
                          >
                            {/* Customer Avatar & Details */}
                            <td className="py-3.5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200/80 text-indigo-700 font-bold text-xs tracking-wider shadow-2xs">
                                  {getInitials(lic.customer_name, lic.customer_email)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                                    {lic.customer_name || "CamVerse User"}
                                  </div>
                                  <div className="text-xs text-slate-400 font-mono truncate">
                                    {lic.customer_email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* License Key Chip with 1-Click Copy */}
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => handleCopy(lic.license_key)}
                                className="group/copy inline-flex items-center gap-2 rounded-xl border border-indigo-100/90 bg-indigo-50/60 hover:bg-indigo-100/70 hover:border-indigo-200 px-3 py-1.5 transition text-left cursor-pointer shadow-2xs"
                                title="Click to copy license key"
                              >
                                <span className="font-mono text-xs font-semibold text-indigo-700 select-all">
                                  {lic.license_key}
                                </span>
                                {copiedKey === lic.license_key ? (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white/95 px-1.5 py-0.5 rounded shadow-2xs">
                                    <Icon name="check" size={12} />
                                    Copied
                                  </span>
                                ) : (
                                  <svg
                                    className="h-3.5 w-3.5 text-indigo-400 group-hover/copy:text-indigo-700 transition"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                  </svg>
                                )}
                              </button>
                            </td>

                            {/* Plan Tier Badge */}
                            <td className="py-3.5 px-4">
                              {lic.plan_tier === "lifetime" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 shadow-2xs">
                                  <Icon name="star" size={10} className="text-purple-500 fill-purple-400" />
                                  Lifetime
                                </span>
                              ) : lic.plan_tier === "agency" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 shadow-2xs">
                                  <Icon name="building" size={10} className="text-blue-500" />
                                  Agency
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 shadow-2xs">
                                  <Icon name="zap" size={10} className="text-indigo-500" />
                                  Pro
                                </span>
                              )}
                            </td>

                            {/* Device Seats */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                  <Icon name="monitor" size={12} />
                                </span>
                                <div>
                                  <span className="font-mono text-xs font-semibold text-slate-800">
                                    {lic.activation_usage} / {lic.activation_limit}
                                  </span>
                                  <span className="text-[10px] text-slate-400 ml-1">PCs</span>
                                </div>
                              </div>
                            </td>

                            {/* Status with Pulsing Emerald Dot */}
                            <td className="py-3.5 px-4">
                              {lic.status === "active" ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-2xs">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                  Active
                                </span>
                              ) : lic.status === "expired" ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  Expired
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/80 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                  Revoked
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-6 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => openEdit(lic)}
                                  className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => void toggleStatusQuick(lic)}
                                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition shadow-2xs cursor-pointer ${
                                    lic.status === "active"
                                      ? "border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100"
                                      : "border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100"
                                  }`}
                                >
                                  {lic.status === "active" ? "Revoke" : "Activate"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer preview link if more items exist */}
                {licenses.length > 6 && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-center">
                    <button
                      onClick={() => setActiveTab("licenses")}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                    >
                      Showing 6 most recent • View all {licenses.length} in Licenses tab →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              SECTION 2: LICENSES TAB
             ───────────────────────────────────────────────────────── */}
          {activeTab === "licenses" && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search by license key, email, or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-sm"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none cursor-pointer shadow-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="expired">Expired Only</option>
                  <option value="revoked">Revoked Only</option>
                </select>

                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none cursor-pointer shadow-sm"
                >
                  <option value="all">All Tiers</option>
                  <option value="pro">Pro</option>
                  <option value="agency">Agency</option>
                  <option value="lifetime">Lifetime</option>
                </select>

                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-sm"
                >
                  + Create
                </button>
              </div>

              {/* Table (Minimal White) */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Customer</th>
                      <th className="px-4 py-3.5 font-semibold">License Key</th>
                      <th className="px-4 py-3.5 font-semibold">Tier</th>
                      <th className="px-4 py-3.5 font-semibold">Devices</th>
                      <th className="px-4 py-3.5 font-semibold">Expires</th>
                      <th className="px-4 py-3.5 font-semibold">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLicenses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-medium">
                          No licenses found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredLicenses.map((lic) => (
                        <tr key={lic.id} className="group hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200/80 text-indigo-700 font-bold text-xs tracking-wider shadow-2xs">
                                {getInitials(lic.customer_name, lic.customer_email)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                                  {lic.customer_name || "CamVerse User"}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono truncate">
                                  {lic.customer_email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => handleCopy(lic.license_key)}
                              className="group/copy inline-flex items-center gap-2 rounded-xl border border-indigo-100/90 bg-indigo-50/60 hover:bg-indigo-100/70 hover:border-indigo-200 px-3 py-1.5 transition text-left cursor-pointer shadow-2xs"
                              title="Click to copy license key"
                            >
                              <span className="font-mono text-xs font-semibold text-indigo-700 select-all">
                                {lic.license_key}
                              </span>
                              {copiedKey === lic.license_key ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white/95 px-1.5 py-0.5 rounded shadow-2xs">
                                  <Icon name="check" size={12} />
                                  Copied
                                </span>
                              ) : (
                                <svg
                                  className="h-3.5 w-3.5 text-indigo-400 group-hover/copy:text-indigo-700 transition"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                              )}
                            </button>
                          </td>

                          <td className="px-4 py-3.5">
                            {lic.plan_tier === "lifetime" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 shadow-2xs">
                                <Icon name="star" size={10} className="text-purple-500 fill-purple-400" />
                                Lifetime
                              </span>
                            ) : lic.plan_tier === "agency" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 shadow-2xs">
                                <Icon name="building" size={10} className="text-blue-500" />
                                Agency
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 shadow-2xs">
                                <Icon name="zap" size={10} className="text-indigo-500" />
                                Pro
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                <Icon name="monitor" size={12} />
                              </span>
                              <span className="font-mono text-xs font-semibold text-slate-800">
                                {lic.activation_usage} / {lic.activation_limit}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-xs">
                            {lic.expires_at ? (
                              <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                                <Icon name="clock" size={12} className="text-slate-400" />
                                {new Date(lic.expires_at).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs bg-emerald-50/80 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                                <Icon name="sparkles" size={12} className="text-emerald-500" />
                                Lifetime
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            {lic.status === "active" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-[11px] font-bold text-emerald-700 shadow-2xs">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Active
                              </span>
                            ) : lic.status === "expired" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/80 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                Revoked
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEdit(lic)}
                                className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => void toggleStatusQuick(lic)}
                                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition shadow-2xs cursor-pointer ${
                                  lic.status === "active"
                                    ? "border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100"
                                    : "border-emerald-200 bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100"
                                }`}
                              >
                                {lic.status === "active" ? "Revoke" : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              SECTION 3: ORDERS & TRANSACTIONS TAB
             ───────────────────────────────────────────────────────── */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Plan</th>
                      <th className="px-4 py-3 font-semibold">Amount (BDT)</th>
                      <th className="px-4 py-3 font-semibold">Gateway Txn ID</th>
                      <th className="px-4 py-3 font-semibold">Payment Status</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-medium">
                          No customer payment transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{o.fullName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{o.email}</div>
                          </td>
                          <td className="px-4 py-3 font-bold uppercase text-slate-700">{o.planId}</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">৳{o.amount}</td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                            {o.transactionId || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                o.status === "paid"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : o.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-500">
                            {new Date(o.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────
              SECTION 4: MARKETING & TRACKING (FACEBOOK PIXEL & GTM)
             ───────────────────────────────────────────────────────── */}
          {activeTab === "tracking" && (
            <form onSubmit={handleSaveTracking} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Facebook Pixel Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        f
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-slate-900">
                          Meta (Facebook) Pixel
                        </h3>
                        <p className="text-xs text-slate-500">
                          Track conversions, pageviews, and custom ad audiences.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={fbPixelEnabled}
                        onChange={(e) => setFbPixelEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Facebook Pixel ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789012345"
                      value={fbPixelId}
                      onChange={(e) => setFbPixelId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono"
                    />
                    <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
                      Find your 15-16 digit Pixel ID in <strong>Meta Events Manager → Data Sources</strong>.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-2">
                    <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                      Automatically Tracked Events:
                    </span>
                    <ul className="space-y-1.5 text-slate-600 text-[11px]">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span><code>PageView</code> on every site visit</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span><code>InitiateCheckout</code> when user opens plan checkout</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span><code>Purchase</code> with order value (BDT ৳) and currency on successful payment</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Google Tag Manager Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                        GTM
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-slate-900">
                          Google Tag Manager (GTM)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Inject GTM container for Google Analytics 4, Ads, and tags.
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gtmEnabled}
                        onChange={(e) => setGtmEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      GTM Container ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GTM-XXXXXXX"
                      value={gtmId}
                      onChange={(e) => setGtmId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 font-mono uppercase"
                    />
                    <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">
                      Format: <code>GTM-XXXXXXX</code>. Found in your Google Tag Manager header.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs space-y-2">
                    <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                      DataLayer Integration:
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      All website interactions automatically push events to <code>window.dataLayer</code> so you can trigger custom GA4 events, conversion tags, and Google Ads remarketing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500">
                  Changes take effect immediately across all visitors without redeploying.
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined" && typeof window.fbq === "function") {
                        window.fbq("trackCustom", "AdminTestEvent", { test: true });
                        setFeedback({ type: "success", text: "Sent test event to Meta Pixel!" });
                      } else {
                        setFeedback({ type: "success", text: "Pixel test dispatched to event queue." });
                      }
                    }}
                    className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Send Test Event
                  </button>

                  <button
                    type="submit"
                    disabled={trackingSaving}
                    className="flex-1 sm:flex-none rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
                  >
                    {trackingSaving ? "Saving..." : "Save Tracking Settings"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────
              SECTION 5: SYSTEM & KEYS CONFIGURATION TAB
             ───────────────────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-sm">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Icon name="shield" size={18} className="text-indigo-600" />
                  <span>Admin Authentication (Supabase Cloud)</span>
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Admin credentials are authenticated directly against <strong>Supabase Auth</strong> (<code className="text-indigo-600">auth.users</code> &amp; <code className="text-indigo-600">public.admin_users</code>) with encrypted bcrypt hashes. No admin credentials are kept in <code className="text-slate-700 font-bold">.env.local</code>.
                </p>

                <div className="space-y-3 font-mono text-xs">
                  <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                    <span className="text-slate-500 block text-[11px]">ACTIVE ADMIN ACCOUNT</span>
                    <span className="font-bold text-slate-900 mt-1 block">{adminUserEmail}</span>
                  </div>

                  <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                    <span className="text-slate-500 block text-[11px]">CREDENTIAL STORE</span>
                    <span className="font-bold text-indigo-600 mt-1 block">Supabase Auth (Cloud Database)</span>
                  </div>

                  <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                    <span className="text-slate-500 block text-[11px]">ENV CREDENTIAL STORAGE</span>
                    <span className="font-bold text-emerald-600 mt-1 block">Disabled (Zero Secrets in .env)</span>
                  </div>

                  <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                    <span className="text-slate-500 block text-[11px]">SESSION SIGNATURE</span>
                    <span className="font-bold text-slate-700 mt-1 block">HMAC-SHA256 (HTTP-only, 8 Hours)</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-sm">
                <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <Icon name="zap" size={18} className="text-amber-500" />
                  <span>External Integrations</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Supabase Cloud Database</div>
                      <div className="text-[11px] text-slate-500 font-mono">rqremmfisvggplqxxist.supabase.co</div>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      Configured
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">PayStation Bangladesh Gateway</div>
                      <div className="text-[11px] text-slate-500 font-mono">Merchant: 6489-1789449727</div>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      Live
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Desktop Studio Marketplace</div>
                      <div className="text-[11px] text-slate-500 font-mono">RECORDLY_ADMIN_KEY</div>
                    </div>
                    <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                      Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CREATE NEW LICENSE (Minimal White Theme)
         ───────────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Icon name="sparkles" size={18} className="text-indigo-600" />
                <span>Issue New CamVerse License</span>
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLicense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mehan Ahmed"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Plan Tier
                  </label>
                  <select
                    value={newTier}
                    onChange={(e) => {
                      const t = e.target.value as "pro" | "agency" | "lifetime";
                      setNewTier(t);
                      if (t === "agency") setNewDeviceLimit(5);
                      else if (t === "pro") setNewDeviceLimit(2);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="pro">Pro (2 devices)</option>
                    <option value="agency">Agency (5 devices)</option>
                    <option value="lifetime">Lifetime VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Device Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newDeviceLimit}
                    onChange={(e) => setNewDeviceLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expiration Policy
                </label>
                <select
                  value={newExpiryType}
                  onChange={(e) => setNewExpiryType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none cursor-pointer"
                >
                  <option value="lifetime">Lifetime (No expiration)</option>
                  <option value="30days">30 Days</option>
                  <option value="1year">1 Year</option>
                  <option value="custom">Custom Date</option>
                </select>
              </div>

              {newExpiryType === "custom" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pick Custom Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newCustomExpiry}
                    onChange={(e) => setNewCustomExpiry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
                >
                  {createSubmitting ? "Issuing..." : "Create & Activate License"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT LICENSE (Minimal White Theme)
         ───────────────────────────────────────────────────────────── */}
      {editingLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Edit License Quota & Status</h2>
                <span className="font-mono text-xs text-indigo-700 font-bold">
                  {editingLicense.license_key}
                </span>
              </div>
              <button
                onClick={() => setEditingLicense(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateLicense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Email (Fixed)
                </label>
                <input
                  type="email"
                  disabled
                  value={editingLicense.customer_email}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-slate-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Device Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editLimit}
                    onChange={(e) => setEditLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none focus:border-indigo-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    License Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Expiration Date (Clear for Lifetime)
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={editExpiryDate}
                    onChange={(e) => setEditExpiryDate(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 outline-none"
                  />
                  {editExpiryDate && (
                    <button
                      type="button"
                      onClick={() => setEditExpiryDate("")}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Make Lifetime
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLicense(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
                >
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
