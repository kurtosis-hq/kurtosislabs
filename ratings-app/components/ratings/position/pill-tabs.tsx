"use client";
// The pill bar from the Figma frames: grey track (r14, p4), items sized to their label and spread evenly,
// the selected item a white pill (r10). Each item is a link, so the state lives in the URL and can be shared.
import { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type PillItem = { id: string; label: string; href: string; badge?: number };

export function PillTabs({ items, active, label, className }: { items: PillItem[]; active: string; label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // Arrow keys, Home and End move focus between items (WAI-ARIA tabs pattern, manual activation).
  const onKey = (e: React.KeyboardEvent) => {
    const links = Array.from(ref.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);
    const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (i < 0) return;
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: links.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    links[(next + links.length) % links.length]?.focus();
  };
  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      onKeyDown={onKey}
      className={cn(
        "flex w-full items-center gap-0.5 overflow-x-auto rounded-[14px] bg-panel p-1 [scrollbar-width:none]",
        className,
      )}
    >
      {items.map((it) => {
        const on = it.id === active;
        return (
          <Link
            key={it.id}
            href={it.href}
            scroll={false}
            replace
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            className={cn(
              // Items grow to share spare width and keep 10 px side padding, so every tab fits without being cut off.
              "flex h-9 flex-auto shrink-0 items-center justify-center gap-1.5 rounded-[10px] px-2.5 font-display text-[14px] leading-6 font-bold whitespace-nowrap outline-offset-2 lg:max-xl:px-2 lg:max-xl:text-[13px]",
              on ? "bg-card-bg text-navy shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)]" : "text-steel hover:text-ink",
            )}
          >
            {it.label}
            {it.badge ? (
              <span className="rounded-full bg-navy px-1.5 text-[11px] leading-[18px] text-white tnum" aria-label={`${it.badge} updates`}>
                {it.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
