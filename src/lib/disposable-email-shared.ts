/**
 * Shared Disposable Email Utilities (Browser & Server Isomorphic)
 * Zero Node.js-specific dependencies.
 */

export const DISPOSABLE_EMAIL_ERROR_MESSAGE =
  "Temporary / disposable email addresses are not allowed. Please use a permanent email (e.g. Gmail, Outlook, Yahoo, or your company email) to ensure you receive your license key and account updates.";

export const DISPOSABLE_EMAIL_ERROR_MESSAGE_BN =
  "অস্থায়ী বা ডিসপোজেবল ইমেইল (Temporary/Disposable Email) গ্রহণযোগ্য নয়। অনুগ্রহ করে একটি স্থায়ী ও নির্ভরযোগ্য ইমেইল (যেমনঃ Gmail, Outlook, Yahoo ইত্যাদি) ব্যবহার করুন যাতে লাইসেন্স কি ও আপডেট নিরাপদভাবে পান।";

// Heuristic keyword patterns without referencing specific provider names or hardcoded emails
export const HEURISTIC_DISPOSABLE_PATTERNS = [
  /temp[-._]?mail/i,
  /disposa/i,
  /throwaway/i,
  /fake[-._]?mail/i,
  /trash[-._]?mail/i,
  /burner[-._]?mail/i,
  /\b\d+[-._]?min/i,
  /minute[-._]?inbox/i,
  /guerrilla/i,
  /mailinator/i,
  /yopmail/i,
  /mohmal/i,
  /sharklaser/i,
];

/**
 * Extracts and normalizes the domain from an email address.
 */
export function extractEmailDomain(email: string): string {
  if (!email || typeof email !== "string") return "";
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].trim();
}

/**
 * Checks if the email matches heuristic burner patterns (runs synchronously in browser & server).
 */
export function isDisposableByPattern(email: string): boolean {
  const domain = extractEmailDomain(email);
  if (!domain) return false;

  for (const pattern of HEURISTIC_DISPOSABLE_PATTERNS) {
    if (pattern.test(domain)) {
      return true;
    }
  }
  return false;
}
