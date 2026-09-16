/**
 * Core feature grid + pricing comparison matrix.
 * Icon keys map to components in src/components/icons.tsx.
 */

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    id: "auto-zoom",
    icon: "zoom",
    title: "Auto-Zooms & Smart Framing",
    description:
      "Cursor activity ট্র্যাক করে স্বয়ংক্রিয়ভাবে গুরুত্বপূর্ণ অংশে Smooth Zoom এবং Pan প্রয়োগ করে।",
  },
  {
    id: "cursor-polish",
    icon: "cursor",
    title: "Silky-Smooth Cursor Polish",
    description:
      "Cursor smoothing, motion blur, click bounce, cursor sway এবং loop mode দিয়ে স্টুডিও-কোয়ালিটি ভিডিও পান।",
  },
  {
    id: "webcam-bubble",
    icon: "camera",
    title: "Dynamic Webcam Bubble Overlay",
    description:
      "Floating webcam bubble, mirror view, roundness, shadow এবং zoom-reactive auto-scaling।",
  },
  {
    id: "studio-frames",
    icon: "frame",
    title: "Studio Frames & 4K Wallpapers",
    description:
      "Curated dynamic gradient backgrounds, frame padding, 3D drop shadows, corner radius এবং background blur।",
  },
  {
    id: "timeline-editor",
    icon: "sliders",
    title: "Timeline Editing Built for Demos",
    description:
      "Drag-and-drop timeline, trims, manual zoom regions, speed ramps (slow/fast), text & image annotations।",
  },
  {
    id: "native-capture",
    icon: "monitor",
    title: "Native 4K 60FPS Screen Capture",
    description:
      "Full display বা single window capture, zero lag, crystal-clear mic & system audio (WASAPI / ScreenCaptureKit)।",
  },
  {
    id: "teleprompter",
    icon: "teleprompter",
    title: "Built-in Teleprompter",
    description:
      "Camera বা Screen-এর সামনে Script দেখে কনফিডেন্টলি এবং Natural ভাবে Record করুন।",
  },
  {
    id: "ai-script",
    icon: "sparkles",
    title: "AI Script & Caption Generator",
    description:
      "যেকোনো টপিক থেকে মুহূর্তের মধ্যে হাই-কনভার্টিং স্ক্রিপ্ট ও ভাইরাল ক্যাপশন জেনারেট করুন।",
  },
  {
    id: "subtitle",
    icon: "subtitle",
    title: "Bangla + English Auto Subtitle",
    description:
      "Video speech automatically accurate Bangla ও English subtitle-এ convert করুন।",
  },
  {
    id: "clear-voice",
    icon: "mic",
    title: "AI Voice Isolation & Denoise",
    description:
      "Background noise, fan sound ও echo দূর করে ক্রিস্টাল ক্লিয়ার স্টুডিও ভয়েস প্রদান করে।",
  },
  {
    id: "brand-kit",
    icon: "palette",
    title: "Brand Kit & Watermark-Free",
    description:
      "Custom logo watermark, custom colors, fonts এবং commercial usage rights।",
  },
  {
    id: "export",
    icon: "ratio",
    title: "Multi-Ratio & 60FPS GIF Export",
    description:
      "4K MP4, Ultra-crisp Looping GIF, 16:9 (YouTube), 9:16 (Reels/TikTok) এবং 1:1 (LinkedIn)।",
  },
];

/* ------------------------------------------------------------------ */
/* Pricing comparison table matrix                                     */
/* ------------------------------------------------------------------ */

export type FeatureAvailability = boolean | string;

export interface ComparisonRow {
  label: string;
  free: FeatureAvailability;
  pro: FeatureAvailability;
  agency: FeatureAvailability;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  { label: "Screen & Window Recording", free: true, pro: true, agency: true },
  { label: "Recording Duration Limit", free: "Max 5 Min / video", pro: "Unlimited", agency: "Unlimited" },
  { label: "4K 60FPS High-Res Capture", free: false, pro: true, agency: true },
  { label: "Auto-Zooms & Smart Framing", free: "Basic", pro: true, agency: true },
  { label: "Cursor Smoothing & Motion Blur", free: false, pro: true, agency: true },
  { label: "Dynamic Webcam Bubble Overlay", free: "Basic", pro: true, agency: true },
  { label: "Studio Frames & Custom Wallpapers", free: false, pro: true, agency: true },
  { label: "Timeline Editor & Speed Ramps", free: true, pro: true, agency: true },
  { label: "Built-in Teleprompter", free: "Basic", pro: true, agency: true },
  { label: "AI Script & Caption Generator", free: false, pro: true, agency: true },
  { label: "Auto Subtitles (Bangla + English)", free: false, pro: true, agency: true },
  { label: "AI Voice Denoise & Audio Polish", free: false, pro: true, agency: true },
  { label: "60FPS Looping GIF Export", free: false, pro: true, agency: true },
  { label: "No Watermark + Commercial License", free: false, pro: true, agency: true },
  { label: "Team Seats & Collaboration", free: "1", pro: "1", agency: "5 Seats" },
  { label: "Shared Projects & Cloud Sync", free: false, pro: false, agency: true },
  { label: "Multiple Client Brand Kits", free: false, pro: false, agency: true },
];
