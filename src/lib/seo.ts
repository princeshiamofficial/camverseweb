/**
 * Central SEO/site configuration.
 * Values can be overridden via environment variables in production.
 */
function resolveSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl && envUrl.length > 0) {
    return envUrl.startsWith("http://") || envUrl.startsWith("https://")
      ? envUrl
      : `https://${envUrl}`;
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd && vercelProd.length > 0) {
    return `https://${vercelProd}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl && vercelUrl.length > 0) {
    return `https://${vercelUrl}`;
  }

  return "https://camverse.app";
}

export const SITE = {
  name: "CamVerse",
  tagline: "Next-Gen Screen Recording & Demo Studio",
  slogan: "Record. Auto-Zoom. Style. Export.",
  title: "CamVerse — Screen Recorder & Studio Demo Creator",
  description:
    "Create polished product demos, walkthroughs and screen recordings in minutes with auto-zooms, silky-smooth cursor polish, webcam bubble overlays and studio frames.",
  url: resolveSiteUrl(),
} as const;
