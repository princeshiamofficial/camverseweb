/**
 * PayStation Bangladesh Payment Gateway Integration
 * Docs: https://www.paystation.com.bd/documentation
 *
 * Supported Payment Methods:
 * bKash, Nagad, Rocket, Upay, Visa, MasterCard, UnionPay, Internet Banking
 */

export interface PayStationConfig {
  merchantId: string;
  password: string;
  env: "sandbox" | "live";
}

export interface PayStationTokenResponse {
  status_code: string | number;
  status: string;
  message?: string;
  token?: string;
}

export interface PayStationPaymentResponse {
  status_code: string | number;
  status: string;
  message?: string;
  payment_url?: string;
  invoice_number?: string;
}

export interface PayStationVerificationResponse {
  status_code: string | number;
  status: string;
  message?: string;
  trx_id?: string;
  invoice_number?: string;
  payment_amount?: string | number;
  payer_mobile_no?: string;
  payment_status?: "Successful" | "Failed" | "Cancelled";
}

const SANDBOX_BASE_URL = "https://sandbox.paystation.com.bd";
const LIVE_BASE_URL = "https://api.paystation.com.bd";

export function getPayStationConfig(): PayStationConfig {
  return {
    merchantId: process.env.PAYSTATION_MERCHANT_ID || "",
    password: process.env.PAYSTATION_PASSWORD || "",
    env: (process.env.PAYSTATION_ENV as "sandbox" | "live") || "sandbox",
  };
}

export function isPayStationConfigured(): boolean {
  const config = getPayStationConfig();
  return Boolean(config.merchantId && config.password);
}

function getBaseUrl(env: "sandbox" | "live"): string {
  return env === "live" ? LIVE_BASE_URL : SANDBOX_BASE_URL;
}

/**
 * Step 1: Request Authentication Token from PayStation
 */
export async function getPayStationToken(): Promise<string | null> {
  const config = getPayStationConfig();
  if (!config.merchantId || !config.password) {
    return null;
  }

  const url = `${getBaseUrl(config.env)}/grant-token`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchantId: config.merchantId,
        password: config.password,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`PayStation grant-token HTTP error: ${res.status}`);
      return null;
    }

    const data = (await res.json()) as PayStationTokenResponse;
    if (data.status === "success" && data.token) {
      return data.token;
    }

    console.error("PayStation token generation failed:", data);
    return null;
  } catch (err) {
    console.error("PayStation grant-token exception:", err);
    return null;
  }
}

/**
 * Step 2: Create Payment on PayStation and get checkout payment_url
 */
export async function createPayStationPayment(params: {
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  callbackUrl: string;
  reference?: string;
}): Promise<PayStationPaymentResponse | null> {
  const config = getPayStationConfig();
  const token = await getPayStationToken();

  if (!token) {
    return null;
  }

  const url = `${getBaseUrl(config.env)}/create-payment`;

  try {
    const payload = {
      invoice_number: params.invoiceNumber,
      currency: "BDT",
      payment_amount: String(params.amount),
      reference: params.reference || "CamVerse License",
      cust_name: params.customerName,
      cust_phone: params.customerPhone,
      cust_email: params.customerEmail,
      cust_address: "Dhaka, Bangladesh",
      callback_url: params.callbackUrl,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchantId: config.merchantId,
        token: token,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = (await res.json()) as PayStationPaymentResponse;
    return data;
  } catch (err) {
    console.error("PayStation create-payment exception:", err);
    return null;
  }
}

/**
 * Step 3: Verify Transaction Status with PayStation
 */
export async function verifyPayStationTransaction(params: {
  invoiceNumber: string;
  trxId?: string;
}): Promise<PayStationVerificationResponse | null> {
  const config = getPayStationConfig();
  const token = await getPayStationToken();
  const url = `${getBaseUrl(config.env)}/retrive-transaction`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchantId: config.merchantId,
        token: token || "",
      },
      body: JSON.stringify({
        invoice_number: params.invoiceNumber,
        trx_id: params.trxId,
      }),
      cache: "no-store",
    });

    const data = (await res.json()) as PayStationVerificationResponse;
    return data;
  } catch (err) {
    console.error("PayStation verification error:", err);
    return null;
  }
}
