import { Reveal } from "./ui";
import { Icon } from "./icons";

const STATS = [
  { value: "60 FPS", label: "Lossless Native Motion", icon: "zap" },
  { value: "0 Keyframes", label: "Automated Auto-Zoom", icon: "zoom" },
  { value: "4K UHD", label: "Studio Frame Canvas", icon: "frame" },
  { value: "AI Captions", label: "Bangla & English Ready", icon: "sparkles" },
] as const;

const AUDIENCE_LABELS = [
  "SaaS Founders",
  "Developers",
  "Content Creators",
  "Product Teams",
  "Agencies",
  "Educators",
];

export function TrustBar() {
  return (
    <section aria-label="Key highlights and target audience" className="border-y border-slate-100 bg-slate-50/60 py-8">
      <div className="container-page">
        <Reveal>
          {/* 4 Eye-Catching Stat Highlights */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 pb-6 border-b border-slate-200/60">
            {STATS.map((stat) => (
              <div key={stat.value} className="text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Minimal Audience Labels */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Built for
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {AUDIENCE_LABELS.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-slate-200/70 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-2xs"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}


