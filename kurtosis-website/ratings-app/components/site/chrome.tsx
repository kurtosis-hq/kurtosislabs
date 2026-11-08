"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { KMark } from "@/components/ratings/primitives";
import { variants, siteBase, type Variant } from "./variants";

const LINKS = [
  ["Overview", ""],
  ["Compare", "/compare"],
  ["Sources", "/sources"],
  ["Methodology", "/methodology"],
] as const;

function useActive(base: string) {
  const path = usePathname();
  return (href: string) => (href === "" ? path === base || path.startsWith(`${base}/positions`) : path.startsWith(base + href));
}

/* ---------- Top navigation in the variant's style ---------- */

export function SiteNav({ v }: { v: Variant }) {
  const base = siteBase(v);
  const isActive = useActive(base);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${base}/sources?q=${encodeURIComponent(q)}`);
  };

  if (v.nav === "figma")
    // The Figma frames: a white Kurtosis Labs product bar, then a Ratings sub-navigation.
    return (
      <nav aria-label="Ratings" className="sticky top-0 z-40 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-4">
          <a href="#" className="flex items-center gap-2 text-ink">
            <KMark className="h-5 w-5" fill="#172A42" />
            <span className="text-[16px] font-medium tracking-[-0.02em] whitespace-nowrap">Kurtosis Labs</span>
          </a>
          <div className="mx-auto hidden items-center gap-1 text-[14px] md:flex">
            {["Ratings", "Horizon", "Gradient", "Company"].map((l) => (
              <a key={l} href={l === "Ratings" ? base : "#"} className={cn("rounded-[8px] px-3 py-1.5", l === "Ratings" ? "bg-mist text-ink" : "text-steel hover:text-ink")}>
                {l}
              </a>
            ))}
          </div>
          <a href="#" className="ml-auto flex h-9 items-center rounded-[10px] bg-deep px-3.5 font-display text-[14px] font-bold whitespace-nowrap text-white md:ml-0" title="Label from the Figma frames. [CONFIRM]">Talk to us</a>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
        <div className="mx-auto hidden h-11 max-w-[1240px] items-center gap-6 border-b border-divider px-4 md:flex">
          <span className="border-r border-divider pr-6 text-[14px] font-medium text-ink">Kurtosis Ratings</span>
          {LINKS.map(([l, h]) => (
            <Link key={l} href={base + h} aria-current={isActive(h) ? "page" : undefined} className={cn("flex h-full items-center border-b-2 text-[14px]", isActive(h) ? "border-ink text-ink" : "border-transparent text-steel hover:text-ink")}>
              {l}
            </Link>
          ))}
        </div>
        {open && <MobileLinks base={base} isActive={isActive} onPick={() => setOpen(false)} />}
      </nav>
    );

  if (v.nav === "ondo")
    return (
      <nav aria-label="Ratings" className="sticky top-0 z-40 border-b border-divider bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-6 px-4">
          <Link href={base} className="flex items-center gap-2 text-ink">
            <KMark className="h-5 w-5" fill="#172A42" />
            <span className="text-[15px] font-medium tracking-[-0.02em] whitespace-nowrap">Kurtosis <span className="text-muted-foreground">/</span> Ratings</span>
          </Link>
          <div className="hidden items-center gap-6 text-[14px] md:flex">
            {LINKS.map(([l, h]) => (
              <Link key={l} href={base + h} aria-current={isActive(h) ? "page" : undefined} className={isActive(h) ? "text-ink" : "text-steel hover:text-ink"}>
                {l}
              </Link>
            ))}
          </div>
          <form onSubmit={go} className="ml-auto hidden h-10 w-[300px] items-center gap-2 rounded-[10px] bg-mist px-3 lg:flex">
            <Search className="size-4 text-steel" aria-hidden="true" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sources" aria-label="Search sources" className="w-full bg-transparent text-[14px] outline-none placeholder:text-steel" />
          </form>
          <a href="#" className="ml-auto flex h-9 items-center rounded-[10px] bg-ink px-3.5 font-display text-[14px] font-bold whitespace-nowrap text-white lg:ml-0">[CONFIRM] CTA</a>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && <MobileLinks base={base} isActive={isActive} onPick={() => setOpen(false)} />}
      </nav>
    );

  return (
    <div className="sticky top-6 z-40 flex justify-center px-4">
      <nav aria-label="Ratings" className="relative w-full max-w-[748px]">
        <div className="flex h-11 items-center gap-4 rounded-[16px] bg-black pr-1.5 pl-2.5">
          <Link href={base} className="flex items-center gap-2.5 text-white">
            <span className="flex size-7 items-center justify-center rounded-[11%] bg-white"><KMark className="h-4 w-4" fill="#0B1A35" /></span>
            <span className="hidden text-[14px] font-medium tracking-[-0.02em] whitespace-nowrap lg:inline">Kurtosis <span className="text-white/70">/</span> Ratings</span>
          </Link>
          <div className="ml-auto hidden items-center gap-10 text-[14px] md:flex">
            {LINKS.map(([l, h]) => (
              <Link key={l} href={base + h} aria-current={isActive(h) ? "page" : undefined} className={isActive(h) ? "text-white" : "text-white/70 hover:text-white"}>
                {l}
              </Link>
            ))}
          </div>
          <a href="#" className="ml-auto flex h-8 items-center rounded-[10px] bg-white px-3 font-display text-[13px] font-bold whitespace-nowrap text-black md:ml-6">[CONFIRM] CTA</a>
          <button className="text-white md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="absolute inset-x-0 top-12 rounded-[16px] bg-white shadow-lg">
            <MobileLinks base={base} isActive={isActive} onPick={() => setOpen(false)} />
          </div>
        )}
      </nav>
    </div>
  );
}

function MobileLinks({ base, isActive, onPick }: { base: string; isActive: (h: string) => boolean; onPick: () => void }) {
  return (
    <ul className="p-2 md:hidden">
      {LINKS.map(([l, h]) => (
        <li key={l}>
          <Link href={base + h} onClick={onPick} className={cn("block rounded-[10px] px-3 py-2.5 text-[15px]", isActive(h) ? "bg-sky text-navy" : "text-ink")}>
            {l}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------- "Why it looks like this" strip shown on every page ---------- */

const PAGE_NOTES: Record<string, string> = {
  overview: "Overview: the whole row opens the assessment, so the eight View buttons from the current build are gone. Evidence rating comes before the scenario grade and is the same size.",
  position: "Position page: the header is one compact row plus a stat strip, so the tabs start far higher than the roughly 650 px of header on the current build. Key risks and downloads sit in the sidebar instead of repeating above every tab.",
  compare: "Compare: one table with a sticky first column, then three accordions. Long text is clamped to three lines with Show more so rows stay comparable.",
  sources: "Sources: a single list with 52 px rows, monospace IDs and dates, and numbered pagination, as on Ondo. Record labels are plain pills so the list stays calm.",
  methodology: "Methodology: one reading column at most 720 px wide with a sticky contents list. Every section is an accordion, first one open.",
};

export function DesignNotes({ v }: { v: Variant }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const page = path.includes("/positions/") ? "position" : (["compare", "sources", "methodology"].find((p) => path.endsWith(`/${p}`)) ?? "overview");
  const i = variants.findIndex((x) => x.id === v.id);
  const prev = variants[(i - 1 + variants.length) % variants.length];
  const next = variants[(i + 1) % variants.length];
  const suffix = page === "overview" || page === "position" ? "" : `/${page}`;
  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-[13px]">
        <Link href="/v" className="underline underline-offset-2">All styles</Link>
        <span className="font-display">
          Style {String(i + 1).padStart(2, "0")} of {variants.length} · <b>{v.name}</b>
        </span>
        <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 font-display font-bold hover:bg-white/20">
          Why it looks like this <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
        <span className="ml-auto flex gap-3">
          <Link href={`/v/${prev.id}${suffix}`} className="text-white/80 hover:text-white">← {prev.name}</Link>
          <Link href={`/v/${next.id}${suffix}`} className="text-white/80 hover:text-white">{next.name} →</Link>
        </span>
      </div>
      {open && (
        <div className="mx-auto grid max-w-[1240px] gap-6 px-4 pt-2 pb-5 text-[14px] leading-5 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-display text-[16px] font-medium">{v.oneLine}</p>
            <dl className="mt-3 space-y-2">
              {v.why.map((w) => (
                <div key={w.label} className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-white/60">{w.label}</dt>
                  <dd>{w.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="space-y-3 rounded-[16px] bg-white/5 p-4">
            <p><span className="text-white/60">On this page. </span>{PAGE_NOTES[page]}</p>
            <p><span className="text-white/60">Best for. </span>{v.bestFor}</p>
            <p><span className="text-white/60">Trade-off. </span>{v.tradeOff}</p>
            <p><span className="text-white/60">Brand fit. </span>{v.brandNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Position switcher select ---------- */

export function PositionSwitcher({ base, current, options }: { base: string; current: string; options: { slug: string; symbol: string }[] }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-[14px] text-muted-foreground">
      Position
      <select
        value={current}
        onChange={(e) => router.push(`${base}/positions/${e.target.value}`)}
        className="h-9 rounded-[10px] border border-divider bg-white px-3 font-display text-[14px] font-bold text-ink"
      >
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>{o.symbol}</option>
        ))}
      </select>
    </label>
  );
}
