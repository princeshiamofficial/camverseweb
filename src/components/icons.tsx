import type { ReactNode, SVGProps } from "react";

/**
 * Lightweight inline icon set (lucide-style strokes).
 * Icons are tree-shakeable per-path and inherit currentColor.
 */

export type IconName =
  | "camera"
  | "teleprompter"
  | "sparkles"
  | "caption"
  | "subtitle"
  | "eye"
  | "mic"
  | "reel"
  | "palette"
  | "background"
  | "ratio"
  | "template"
  | "publish"
  | "check"
  | "close"
  | "play"
  | "arrow-right"
  | "lock"
  | "star"
  | "menu"
  | "chevron-down"
  | "zap"
  | "shield"
  | "mail"
  | "clock"
  | "gift"
  | "building"
  | "rocket"
  | "users"
  | "credit-card"
  | "cursor"
  | "zoom"
  | "frame"
  | "monitor"
  | "layers"
  | "download"
  | "sliders"
  | "cpu"
  | "extension"
  | "code"
  | "video"
  | "graduation-cap"
  | "trending-up"
  | "building-2"
  | "shopping-bag"
  | "briefcase"
  | "alert-circle"
  | "check-circle"
  | "target";

const STROKE_PATHS: Partial<Record<IconName, ReactNode>> = {
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  video: (
    <>
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </>
  ),
  "graduation-cap": (
    <>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </>
  ),
  "trending-up": (
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>
  ),
  "building-2": (
    <>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </>
  ),
  "shopping-bag": (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  briefcase: (
    <>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  "alert-circle": (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </>
  ),
  "check-circle": (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  cursor: (
    <>
      <path d="m3 3 7 18 3-7 7-3L3 3z" />
      <path d="m13 13 6 6" />
    </>
  ),
  zoom: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <path d="M11 8v6M8 11h6" />
    </>
  ),
  frame: (
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </>
  ),
  monitor: (
    <>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M12 17v4M8 21h8" />
    </>
  ),
  layers: (
    <>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 12.5-9.42 4.28a2 2 0 0 1-1.66 0L2 12.5" />
      <path d="m22 17.5-9.42 4.28a2 2 0 0 1-1.66 0L2 17.5" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </>
  ),
  sliders: (
    <>
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="1" x2="7" y1="14" y2="14" />
      <line x1="9" x2="15" y1="8" y2="8" />
      <line x1="17" x2="23" y1="16" y2="16" />
    </>
  ),
  cpu: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </>
  ),
  extension: (
    <>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  camera: (
    <>
      <path d="M22 8.2 15 13l7 4.8V8.2z" />
      <rect x="2" y="6" width="13" height="12" rx="2.5" />
    </>
  ),
  teleprompter: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2.5" />
      <path d="M7 9h6M7 12.5h9" />
      <path d="M9 21h6" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9 12 3.5z" />
      <path d="M19 15.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" />
    </>
  ),
  caption: (
    <>
      <path d="M21 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V6.5A2.5 2.5 0 0 1 6.5 4h12A2.5 2.5 0 0 1 21 6.5v8z" />
      <path d="M8 9.5h8M8 13h5" />
    </>
  ),
  subtitle: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M6 15h4M12.5 15H18" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2.5" width="6" height="11.5" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" />
    </>
  ),
  reel: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 8.5h18M3 15.5h18M8.5 3v18M15.5 3v18" />
      <path d="M11.2 10.6l2.8 1.9-2.8 1.9v-3.8z" fill="currentColor" stroke="none" />
    </>
  ),
  palette: (
    <>
      <path d="M12 21a9 9 0 1 1 9-9c0 2.2-1.8 3-3.2 3H16a2 2 0 0 0-1.5 3.3c.4.5.5 1.2 0 1.8-.5.6-1.4.9-2.5.9z" />
      <circle cx="7.5" cy="11.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7.8" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  background: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="9.5" r="1.8" />
      <path d="M3 17l5-4.5 4 3.5 4-3 5 4" />
    </>
  ),
  ratio: (
    <>
      <rect x="3" y="6.5" width="13" height="13" rx="2" />
      <path d="M8 3.5h11.5a1.5 1.5 0 0 1 1.5 1.5V17" />
    </>
  ),
  template: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M3 9.5h18M9.5 9.5V21" />
    </>
  ),
  publish: (
    <>
      <path d="M12 16V4.5" />
      <path d="m7 9 5-4.5L17 9" />
      <path d="M4.5 15v3.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  play: (
    <path d="M8 5.8v12.4c0 .9 1 1.5 1.8 1L20 13a1.2 1.2 0 0 0 0-2L9.8 4.8C9 4.3 8 4.9 8 5.8z" />
  ),
  "arrow-right": (
    <>
      <path d="M4.5 12h15" />
      <path d="m13.5 6 6 6-6 6" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  "chevron-down": <path d="m6 9.5 6 6 6-6" />,
  zap: (
    <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8z" />
  ),
  shield: (
    <>
      <path d="M12 2.8 4.5 5.5v6c0 4.7 3.2 8 7.5 9.7 4.3-1.7 7.5-5 7.5-9.7v-6L12 2.8z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.5 7.5 8.5 6 8.5-6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  gift: (
    <>
      <rect x="3.5" y="8" width="17" height="4" rx="1" />
      <path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8v13" />
      <path d="M12 8c-4.5 0-5.5-1.2-5.5-2.6C6.5 4 7.6 3 8.9 3 11 3 12 5.5 12 8zm0 0c4.5 0 5.5-1.2 5.5-2.6C17.5 4 16.4 3 15.1 3 13 3 12 5.5 12 8z" />
    </>
  ),
  building: (
    <>
      <rect x="4.5" y="3" width="15" height="18" rx="1.5" />
      <path d="M8.5 7h2M13.5 7h2M8.5 11h2M13.5 11h2M8.5 15h2M13.5 15h2M10 21v-3h4v3" />
    </>
  ),
  rocket: (
    <>
      <path d="M12.5 15.5c5.5-3 7.5-7.5 7.5-13-5.5 0-10 2-13 7.5" />
      <path d="M7 17c-1.5 1.5-2 5-2 5s3.5-.5 5-2M7 17c-.5-2 0-4 1.5-5.5S12 10 12 10" />
      <circle cx="14.5" cy="9.5" r="1.6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20.5c.5-4 3-6.5 6.5-6.5s6 2.5 6.5 6.5" />
      <path d="M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.4c2 .8 3.2 2.7 3.5 6.1" />
    </>
  ),
  "credit-card": (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9.5h19M6 15h4" />
    </>
  ),
};

const FILLED_PATHS: Partial<Record<IconName, ReactNode>> = {
  star: (
    <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8L12 2.8z" />
  ),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  const isFilled = name in FILLED_PATHS;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={isFilled ? "currentColor" : "none"}
      stroke={isFilled ? "none" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {FILLED_PATHS[name] ?? STROKE_PATHS[name]}
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width="36"
      height="36"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="12"
        fill="url(#cv-grad)"
      />
      <path
        d="M27.5 13.5 20 17.8V13.2c0-.9-1-1.5-1.8-1L9.7 17.6c-.8.5-.8 1.6 0 2.1l8.5 5.4c.8.5 1.8-.1 1.8-1v-4.6l7.5 4.3c.8.5 1.8-.1 1.8-1v-8.3c0-.9-1-1.5-1.8-1z"
        fill="#fff"
      />
      <defs>
        <linearGradient id="cv-grad" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
    </svg>
  );
}
