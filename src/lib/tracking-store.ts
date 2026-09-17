import fs from "fs";
import path from "path";

export interface TrackingConfig {
  gtmId: string;
  gtmEnabled: boolean;
  fbPixelId: string;
  fbPixelEnabled: boolean;
  updatedAt?: string;
}

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "tracking-config.json");

const DEFAULT_CONFIG: TrackingConfig = {
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
  gtmEnabled: Boolean(process.env.NEXT_PUBLIC_GTM_ID),
  fbPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || "",
  fbPixelEnabled: Boolean(process.env.NEXT_PUBLIC_FB_PIXEL_ID),
};

// Global in-memory cache
const globalStore = globalThis as unknown as { __camverseTrackingConfig?: TrackingConfig };

export function getTrackingConfig(): TrackingConfig {
  if (globalStore.__camverseTrackingConfig) {
    return globalStore.__camverseTrackingConfig;
  }

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf8");
      const parsed = JSON.parse(raw);
      const merged: TrackingConfig = {
        gtmId: typeof parsed.gtmId === "string" ? parsed.gtmId : DEFAULT_CONFIG.gtmId,
        gtmEnabled: typeof parsed.gtmEnabled === "boolean" ? parsed.gtmEnabled : DEFAULT_CONFIG.gtmEnabled,
        fbPixelId: typeof parsed.fbPixelId === "string" ? parsed.fbPixelId : DEFAULT_CONFIG.fbPixelId,
        fbPixelEnabled: typeof parsed.fbPixelEnabled === "boolean" ? parsed.fbPixelEnabled : DEFAULT_CONFIG.fbPixelEnabled,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
      globalStore.__camverseTrackingConfig = merged;
      return merged;
    }
  } catch (err) {
    console.warn("[tracking-store] Failed to read tracking config from file:", err);
  }

  globalStore.__camverseTrackingConfig = DEFAULT_CONFIG;
  return DEFAULT_CONFIG;
}

export function saveTrackingConfig(updates: Partial<TrackingConfig>): TrackingConfig {
  const current = getTrackingConfig();
  const next: TrackingConfig = {
    ...current,
    ...updates,
    gtmId: (updates.gtmId !== undefined ? updates.gtmId : current.gtmId).trim(),
    fbPixelId: (updates.fbPixelId !== undefined ? updates.fbPixelId : current.fbPixelId).trim(),
    updatedAt: new Date().toISOString(),
  };

  globalStore.__camverseTrackingConfig = next;

  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2), "utf8");
  } catch (err) {
    console.warn("[tracking-store] Failed to persist tracking config to disk:", err);
  }

  return next;
}
