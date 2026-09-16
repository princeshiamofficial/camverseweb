"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "./icons";

/* ------------------------------------------------------------------ */
/* Button — renders <Link> when href is given, else <button>           */
/* ------------------------------------------------------------------ */
type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "lg" | "md" | "sm";

interface CommonButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonButtonProps & {
  href: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = "primary",
    size = "md",
    className = "",
    children,
  } = props;
  const cls = `btn btn-${variant} btn-${size} ${className}`;

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls} onClick={props.onClick} aria-label={props.ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...(props as ButtonAsButton)}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHeading — eyebrow + title + optional description             */
/* ------------------------------------------------------------------ */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2" | "h3";
}) {
  const Tag = as;
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignCls}`}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <Tag className="font-display text-3xl md:text-4xl lg:text-[2.6rem] font-bold leading-[1.18] tracking-tight text-slate-900">
        {title}
      </Tag>
      {description ? (
        <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reveal — fade-up on scroll via IntersectionObserver                 */
/* ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  /** Stagger delay in ms */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.02, rootMargin: "0px 0px 60px 0px" }
    );
    observer.observe(node);

    // Safety fallback so content is never permanently hidden
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CheckItem — ✓ list row                                              */
/* ------------------------------------------------------------------ */
export function CheckItem({
  children,
  muted = false,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          muted ? "bg-slate-100 text-slate-400" : "bg-emerald-50 text-emerald-600"
        }`}
      >
        <Icon name="check" size={12} strokeWidth={2.5} />
      </span>
      <span className={`text-[15px] leading-snug ${muted ? "text-slate-400" : "text-slate-700"}`}>
        {children}
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* CrossItem — ✕ list row (for "without" column)                       */
/* ------------------------------------------------------------------ */
export function CrossItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400"
      >
        <Icon name="close" size={12} strokeWidth={2.5} />
      </span>
      <span className="text-[15px] leading-snug text-slate-500">{children}</span>
    </li>
  );
}
