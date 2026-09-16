/**
 * Business template carousel + target audience cards.
 */

export interface BusinessTemplate {
  id: string;
  title: string;
  category: string;
  /** Template preview accent (indigo scale) — used by the mockup painter. */
  tone: string;
  icon: string;
}

export const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  { id: "saas-walkthrough", title: "SaaS & App Product Walkthrough", category: "Demo", tone: "#6366f1", icon: "monitor" },
  { id: "software-launch", title: "New Feature / Software Launch", category: "Launch", tone: "#8b5cf6", icon: "rocket" },
  { id: "tutorial-code", title: "Developer & Tech Tutorial", category: "Tutorial", tone: "#4f46e5", icon: "code" },
  { id: "feature-spotlight", title: "Key Feature Spotlight (Auto-Zoom)", category: "Showcase", tone: "#f59e0b", icon: "zoom" },
  { id: "pricing-offer", title: "Special Discount & Pricing Reel", category: "Offer", tone: "#0ea5e9", icon: "gift" },
  { id: "customer-onboarding", title: "Customer Onboarding Guide", category: "Guide", tone: "#10b981", icon: "target" },
  { id: "gif-micro-demo", title: "60 FPS Micro GIF for Twitter/Docs", category: "GIF", tone: "#ec4899", icon: "sparkles" },
  { id: "course-lesson", title: "Course Lesson & Webinar Recording", category: "Education", tone: "#6366f1", icon: "graduation-cap" },
  { id: "agency-pitch", title: "Client Video Pitch & Audit", category: "Pitch", tone: "#8b5cf6", icon: "trending-up" },
  { id: "social-reel", title: "Viral Social Media Demo Reel (9:16)", category: "Reel", tone: "#4f46e5", icon: "video" },
];

export interface Audience {
  id: string;
  icon: string;
  title: string;
  useCase: string;
}

export const AUDIENCES: Audience[] = [
  {
    id: "developers",
    icon: "code",
    title: "Software Developers & Indie Hackers",
    useCase:
      "নিজের কোড, ওপেন সোর্স প্রজেক্ট বা SaaS-এর জন্য চমৎকার 4K ডেমো ও ডকুমেন্টেশন GIF বানান।",
  },
  {
    id: "saas-founders",
    icon: "rocket",
    title: "SaaS Founders & Product Managers",
    useCase:
      "স্মার্ট অটো-জুম এবং কাস্টম ওয়ালপেপার দিয়ে হাই-কনভার্টিং প্রোডাক্ট ওয়াকথ্রু ও সেলস ভিডিও তৈরি করুন।",
  },
  {
    id: "creators",
    icon: "video",
    title: "Content Creators & YouTubers",
    useCase:
      "টেলিপম্পটার, অটো সাবটাইটেল ও সিল্কি স্মুথ কার্সার দিয়ে প্রিমিয়াম টেক ও টিউটোরিয়াল ভিডিও পাবলিশ করুন।",
  },
  {
    id: "educators",
    icon: "graduation-cap",
    title: "Educators & Course Creators",
    useCase:
      "ডাইনামিক ওয়েবক্যাম বাবল, স্পষ্ট ভয়েস ডিনয়েজ এবং সাবটাইটেল সহ স্টেপ-বাই-স্টেপ লেকচার তৈরি করুন।",
  },
  {
    id: "marketers",
    icon: "trending-up",
    title: "Digital Marketers & Growth Hackers",
    useCase:
      "একই ডেমো থেকে 16:9 (YouTube), 9:16 (Reels/TikTok) এবং 1:1 (LinkedIn)-এ এক ক্লিকে এক্সপোর্ট করুন।",
  },
  {
    id: "agencies",
    icon: "building-2",
    title: "Agencies & Design Studios",
    useCase:
      "৫ জন টিম মেম্বার, ক্লায়েন্ট ব্র্যান্ড কিট এবং শেয়ার্ড প্রজেক্ট দিয়ে ক্লায়েন্টকে মুগ্ধ করার মতো ডেমো ডেলিভার করুন।",
  },
  {
    id: "online-businesses",
    icon: "shopping-bag",
    title: "E-Commerce & Online Businesses",
    useCase:
      "নতুন অফার, ওয়েবসাইট ড্রপ বা শপ ফিচার দ্রুত রেকর্ড করে সোশ্যাল মিডিয়ায় ক্যাম্পেইন চালান।",
  },
  {
    id: "consultants",
    icon: "briefcase",
    title: "Consultants & Freelancers",
    useCase:
      "ক্লায়েন্ট অডিট রিপোর্ট, প্রপোজাল ওয়াকথ্রু এবং ফিডব্যাক ভিডিও প্রফেশনাল প্রেজেন্টেশনে পাঠান।",
  },
];

/* ------------------------------------------------------------------ */
/* Workflow timeline + benefit cards                                   */
/* ------------------------------------------------------------------ */

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
  icon: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: "01",
    title: "RECORD",
    description: "4K 60FPS Screen + Dynamic Webcam + Mic Audio",
    icon: "monitor",
  },
  {
    step: "02",
    title: "AUTO-ZOOM",
    description: "Smart Cursor Tracking & Automatic Focus Points",
    icon: "zoom",
  },
  {
    step: "03",
    title: "STYLE & POLISH",
    description: "Studio Gradient Frames, Shadows & Cursor Motion Blur",
    icon: "frame",
  },
  {
    step: "04",
    title: "AI ENHANCE",
    description: "Bangla + English Subtitles & Voice Denoise",
    icon: "sparkles",
  },
  {
    step: "05",
    title: "EXPORT",
    description: "Ultra 4K MP4 & Crisp Looping GIF (16:9, 9:16, 1:1)",
    icon: "publish",
  },
];

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export const BENEFITS: Benefit[] = [
  {
    icon: "zap",
    title: "10x Faster Creation",
    description: "ম্যানুয়াল কি-ফ্রেম আর জটিল ভিডিও এডিটরের ঝামেলা ছাড়াই মিনিটেই ডেমো প্রস্তুত।",
  },
  {
    icon: "palette",
    title: "Studio-Grade Polish",
    description: "সিল্কি কার্সার মোশন, অটো-জুম এবং ডাইনামিক ব্যাকগ্রাউন্ড দিয়ে ভিডিও দেখতে লাগে প্রিমিয়াম।",
  },
  {
    icon: "trending-up",
    title: "Higher Conversion & Sales",
    description: "সুন্দর ওয়াকথ্রু ও মাইক্রো-জিআইএফ আপনার প্রোডাক্ট সেলস ও ইউজার এনগেজমেন্ট বহুগুণ বাড়িয়ে দেয়।",
  },
];

export const USE_CASES = [
  "SaaS Walkthrough",
  "Product Hunt Demo",
  "Software Launch",
  "Dev Tutorial",
  "Documentation GIF",
  "Client Pitch",
  "Feature Spotlight",
  "Course Lecture",
  "YouTube Tech Video",
  "TikTok / Reel Short",
];

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "CamVerse Screen Studio কোন কোন অপারেটিং সিস্টেমে চলে?",
    answer:
      "CamVerse উইন্ডোজ (Windows 10/11), ম্যাক (macOS 14.0+) এবং লিনাক্স (Linux)-এ সম্পূর্ণ নেটিভ পারফরম্যান্সের সাথে স্মুথলি কাজ করে।",
  },
  {
    question: "অটো-জুম ও কার্সার স্মুদিং কি সম্পূর্ণ স্বয়ংক্রিয়?",
    answer:
      "হ্যাঁ! আপনার মাউস ক্লিক ও অ্যাক্টিভিটি ট্র্যাক করে স্বয়ংক্রিয়ভাবে পারফেক্ট জুম তৈরি হয়। এছাড়া ড্র্যাগ-অ্যান্ড-ড্রপ টাইমলাইনে নিজের মতো ম্যানুয়াল জুম ও স্পিডও কাস্টমাইজ করতে পারবেন।",
  },
  {
    question: "বাংলা সাবটাইটেল এবং ভয়েস কি সাপোর্ট করে?",
    answer:
      "অবশ্যই! CamVerse-এ বাংলা ও ইংরেজি উভয় ভাষার স্বয়ংক্রিয় AI সাবটাইটেল জেনারেশন এবং ব্যাকগ্রাউন্ড নয়েজ রিমুভাল সুবিধা রয়েছে।",
  },
  {
    question: "Pro লাইসেন্স কয়টি ডিভাইসে বা কতজন ব্যবহার করতে পারবে?",
    answer: "Pro লাইসেন্সটি ব্যক্তিগত ব্যবহারের জন্য ১ জন ইউজারের জন্য নির্ধারিত।",
  },
  {
    question: "টিম বা এজেন্সির জন্য কি শেয়ার্ড প্রজেক্ট ও মাল্টিপল ব্র্যান্ড কিট আছে?",
    answer:
      "হ্যাঁ! Agency Plan-এ ৫ জন টিম মেম্বার, ক্লায়েন্ট প্রজেক্ট শেয়ারিং এবং মাল্টিপল ব্র্যান্ড কিট ম্যানেজমেন্ট সুবিধা রয়েছে।",
  },
  {
    question: "3 Months স্পেশাল ডিসকাউন্ট কীভাবে পাব?",
    answer: "চেকআউটে CAMVERSE3 কুপন কোড ব্যবহার করে আকর্ষণীয় ফ্ল্যাট ডিসকাউন্ট উপভোগ করুন।",
  },
  {
    question: "পেমেন্টের পর কীভাবে অ্যাকাউন্ট ও সফটওয়্যার পাব?",
    answer:
      "bKash, Nagad বা কার্ডে পেমেন্ট সফল হওয়ার সাথে সাথে আপনার ইমেইলে ইনস্ট্যান্ট ডাউনলোড লিংক ও লাইসেন্স সেটআপ পাঠানো হবে।",
  },
];

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Transformation", href: "#comparison" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Download", href: "#download" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const FOOTER_COLUMNS: { title: string; links: NavItem[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Download App", href: "#download" },
      { label: "Studio Features", href: "#features" },
      { label: "Transformation", href: "#comparison" },
      { label: "Pricing", href: "#pricing" },
      { label: "Agency Plan", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "FAQ", href: "#faq" },
      { label: "Support", href: "#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Refund Policy", href: "#" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", href: "#" },
      { label: "Start Free", href: "#pricing" },
    ],
  },
];
