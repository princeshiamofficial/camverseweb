import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
interface TrackingStoreCache {
  config?: TrackingConfig;
  lastFetchedAt?: number;
}
const globalStore = globalThis as unknown as { __camverseTrackingStore?: TrackingStoreCache };

function readLocalConfigFile(): TrackingConfig | null {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf8");
      const parsed = JSON.parse(raw);
      return {
        gtmId: typeof parsed.gtmId === "string" ? parsed.gtmId : DEFAULT_CONFIG.gtmId,
        gtmEnabled: typeof parsed.gtmEnabled === "boolean" ? parsed.gtmEnabled : DEFAULT_CONFIG.gtmEnabled,
        fbPixelId: typeof parsed.fbPixelId === "string" ? parsed.fbPixelId : DEFAULT_CONFIG.fbPixelId,
        fbPixelEnabled: typeof parsed.fbPixelEnabled === "boolean" ? parsed.fbPixelEnabled : DEFAULT_CONFIG.fbPixelEnabled,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("[tracking-store] Failed to read tracking config from local file:", err);
  }
  return null;
}

export async function getTrackingConfig(): Promise<TrackingConfig> {
  const now = Date.now();
  const cache = globalStore.__camverseTrackingStore;

  // Serve from memory cache if less than 10 seconds old
  if (cache?.config && cache.lastFetchedAt && now - cache.lastFetchedAt < 10000) {
    return cache.config;
  }

  // 1. Primary: Fetch from Supabase site_settings table
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value, updated_at")
        .eq("key", "tracking")
        .maybeSingle();

      if (!error && data?.value) {
        const val = data.value as Record<string, unknown>;
        const merged: TrackingConfig = {
          gtmId: typeof val.gtmId === "string" ? val.gtmId : DEFAULT_CONFIG.gtmId,
          gtmEnabled: typeof val.gtmEnabled === "boolean" ? val.gtmEnabled : DEFAULT_CONFIG.gtmEnabled,
          fbPixelId: typeof val.fbPixelId === "string" ? val.fbPixelId : DEFAULT_CONFIG.fbPixelId,
          fbPixelEnabled: typeof val.fbPixelEnabled === "boolean" ? val.fbPixelEnabled : DEFAULT_CONFIG.fbPixelEnabled,
          updatedAt: (data.updated_at as string) || (val.updatedAt as string) || new Date().toISOString(),
        };

        globalStore.__camverseTrackingStore = {
          config: merged,
          lastFetchedAt: now,
        };
        return merged;
      }
    } catch (err) {
      console.warn("[tracking-store] Supabase fetch warning, falling back to local store:", err);
    }
  }

  // 2. Fallback: Read from local JSON file
  const local = readLocalConfigFile();
  if (local) {
    globalStore.__camverseTrackingStore = {
      config: local,
      lastFetchedAt: now,
    };
    return local;
  }

  // 3. Ultimate Fallback: Default config
  globalStore.__camverseTrackingStore = {
    config: DEFAULT_CONFIG,
    lastFetchedAt: now,
  };
  return DEFAULT_CONFIG;
}

export function getTrackingConfigSync(): TrackingConfig {
  if (globalStore.__camverseTrackingStore?.config) {
    return globalStore.__camverseTrackingStore.config;
  }
  const local = readLocalConfigFile();
  return local || DEFAULT_CONFIG;
}

export async function saveTrackingConfig(updates: Partial<TrackingConfig>): Promise<TrackingConfig> {
  const current = await getTrackingConfig();
  const next: TrackingConfig = {
    ...current,
    ...updates,
    gtmId: (updates.gtmId !== undefined ? updates.gtmId : current.gtmId).trim(),
    fbPixelId: (updates.fbPixelId !== undefined ? updates.fbPixelId : current.fbPixelId).trim(),
    updatedAt: new Date().toISOString(),
  };

  // Immediately update in-memory cache
  globalStore.__camverseTrackingStore = {
    config: next,
    lastFetchedAt: Date.now(),
  };

  // 1. Persist to Supabase site_settings
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          {
            key: "tracking",
            value: next,
            updated_at: next.updatedAt,
          },
          { onConflict: "key" }
        );

      if (error) {
        console.warn("[tracking-store] Supabase upsert error:", error.message);
      }
    } catch (err) {
      console.warn("[tracking-store] Failed to save tracking config to Supabase:", err);
    }
  }

  // 2. Also persist to local file as secondary fallback
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2), "utf8");
  } catch {
    // Ignore error in serverless read-only environments
  }

  return next;
}
