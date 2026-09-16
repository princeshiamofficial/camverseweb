/**
 * Central SEO/site configuration.
 * Values can be overridden via environment variables in production.
 */
export const SITE = {
  name: "CamVerse",
  tagline: "Next-Gen Screen Recording & Demo Studio",
  slogan: "Record. Auto-Zoom. Style. Export.",
  title: "CamVerse — Screen Recorder & Studio Demo Creator",
  description:
    "Create polished product demos, walkthroughs and screen recordings in minutes with auto-zooms, silky-smooth cursor polish, webcam bubble overlays and studio frames.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://camverse.app",
} as const;
