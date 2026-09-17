import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface DownloadConfig {
  version: string;
  windowsUrl: string;
  macUrl: string;
  linuxUrl: string;
  updatedAt?: string;
}

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "download-config.json");

const DEFAULT_CONFIG: DownloadConfig = {
  version: "1.3.5",
  windowsUrl:
    process.env.WINDOWS_DOWNLOAD_URL ||
    "https://github.com/princeshiamofficial/Recordly/releases/download/v1.3.5-beta.2/CamVerse-windows-x64.exe",
  macUrl:
    process.env.MAC_DOWNLOAD_URL ||
    "https://github.com/princeshiamofficial/Recordly/releases/download/v1.3.5-beta.2/CamVerse-mac-universal.dmg",
  linuxUrl:
    process.env.LINUX_DOWNLOAD_URL ||
    "https://github.com/princeshiamofficial/Recordly/releases/download/v1.3.5-beta.2/CamVerse-linux-x86_64.AppImage",
};

// Global in-memory cache
const globalStore = globalThis as unknown as { __camverseDownloadConfig?: DownloadConfig };

export function getDownloadConfig(): DownloadConfig {
  if (globalStore.__camverseDownloadConfig) {
    return globalStore.__camverseDownloadConfig;
  }

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf8");
      const parsed = JSON.parse(raw);
      const merged: DownloadConfig = {
        version: typeof parsed.version === "string" ? parsed.version : DEFAULT_CONFIG.version,
        windowsUrl: typeof parsed.windowsUrl === "string" ? parsed.windowsUrl : DEFAULT_CONFIG.windowsUrl,
        macUrl: typeof parsed.macUrl === "string" ? parsed.macUrl : DEFAULT_CONFIG.macUrl,
        linuxUrl: typeof parsed.linuxUrl === "string" ? parsed.linuxUrl : DEFAULT_CONFIG.linuxUrl,
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
      globalStore.__camverseDownloadConfig = merged;
      return merged;
    }
  } catch (err) {
    console.warn("[download-store] Failed to read download config:", err);
  }

  globalStore.__camverseDownloadConfig = DEFAULT_CONFIG;
  return DEFAULT_CONFIG;
}

export async function getLiveDownloadUrl(platform = "windows"): Promise<string> {
  const plat = platform.toLowerCase();

  // 1. Check Supabase releases table for custom cloud URL
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from("releases")
        .select("windows_installer_url, windows_portable_url, mac_installer_url, version")
        .order("released_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        if ((plat === "windows" || plat === "win") && data.windows_installer_url) {
          return data.windows_installer_url;
        }
        if ((plat === "mac" || plat === "darwin") && data.mac_installer_url) {
          return data.mac_installer_url;
        }
      }
    } catch {
      // fallback
    }
  }

  // 2. Check local store
  const cfg = getDownloadConfig();
  if (plat === "windows" || plat === "win") return cfg.windowsUrl;
  if (plat === "mac" || plat === "darwin") return cfg.macUrl;
  if (plat === "linux") return cfg.linuxUrl;

  return cfg.windowsUrl;
}

export function saveDownloadConfig(updates: Partial<DownloadConfig>): DownloadConfig {
  const current = getDownloadConfig();
  const next: DownloadConfig = {
    ...current,
    ...updates,
    windowsUrl: (updates.windowsUrl !== undefined ? updates.windowsUrl : current.windowsUrl).trim(),
    macUrl: (updates.macUrl !== undefined ? updates.macUrl : current.macUrl).trim(),
    linuxUrl: (updates.linuxUrl !== undefined ? updates.linuxUrl : current.linuxUrl).trim(),
    version: (updates.version !== undefined ? updates.version : current.version).trim(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2), "utf8");
    globalStore.__camverseDownloadConfig = next;
  } catch (err) {
    console.error("[download-store] Failed to save download config:", err);
  }

  return next;
}
