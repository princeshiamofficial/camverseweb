import { FOOTER_COLUMNS } from "@/data/audience";
import { SITE } from "@/lib/seo";
import { Logo } from "./icons";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          {/* Brand */}
          <div>
            <a href="#top" className="flex items-center gap-2.5 font-display text-xl font-bold text-slate-900">
              <Logo />
              <span>
                Cam<span className="text-brand">Verse</span>
              </span>
            </a>
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {SITE.tagline}
            </p>
            <p className="mt-1 text-sm text-brand">{SITE.slogan}</p>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[15px] text-slate-600 transition-colors hover:text-brand"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <div>© 2026 CamVerse. All rights reserved.</div>
          <div className="flex items-center gap-4 text-xs">
            <a
              href="/admin"
              className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
            >
              <span>Admin Portal</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
