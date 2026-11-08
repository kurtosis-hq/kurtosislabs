"use client";
// The Ondo-style positions container: tabs with counts, filter chips, search, sort and the table.
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { positions, updates, type Position } from "@/data/ratings";
import { GradeCell, Mono, StatusPill, TokenIcon, layerName } from "@/components/ratings/primitives";
import { GateDots } from "@/components/ratings/interactive";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CountBadge, Surface } from "./ui";
import { siteBase, type Variant } from "./variants";

const TABS = [
  ["all", "All"],
  ["pt", "Principal tokens (PT)"],
  ["rwa", "Real-world assets (RWA)"],
] as const;
const CHIPS = ["Solana", "Arbitrum One", "Watchlist", "Matured"] as const;
const SORTS = [
  ["gaps", "Coverage gaps first"],
  ["name", "Name"],
  ["date", "Evidence date"],
] as const;

const gaps = (p: Position) => p.counts.conflicting + p.counts.missing;
const unseen = (p: Position) => updates.filter((u) => u.position === p.slug && !u.seen).length;

export function OverviewList({ v }: { v: Variant }) {
  const router = useRouter();
  const base = siteBase(v);
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("all");
  const [chips, setChips] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(v.nav !== "ondo");
  const [sort, setSort] = useState<(typeof SORTS)[number][0]>("gaps");

  const list = useMemo(() => {
    let l = positions.filter((p) => tab === "all" || p.layer === tab);
    for (const c of chips) {
      if (c === "Watchlist") l = l.filter((p) => p.watchlist);
      else if (c === "Matured") l = l.filter((p) => p.matured);
      else l = l.filter((p) => p.network === c);
    }
    const words = q.trim().toLowerCase();
    if (words) l = l.filter((p) => `${p.symbol} ${p.network} ${p.protocol}`.toLowerCase().includes(words));
    return [...l].sort((a, b) =>
      sort === "name" ? a.symbol.localeCompare(b.symbol) : sort === "date" ? b.evidenceDate.localeCompare(a.evidenceDate) : gaps(b) - gaps(a),
    );
  }, [tab, chips, q, sort]);

  const toggle = (c: string) => setChips((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]));
  const count = (t: string) => positions.filter((p) => t === "all" || p.layer === t).length;
  const compact = v.rows === "compact";
  const cards = v.rowStyle === "cards";
  const outlined = cards && v.rowCard === "border";

  const chipCls = (on: boolean) =>
    cn(
      "inline-flex h-8 items-center whitespace-nowrap font-display text-[13px] font-bold",
      v.chips === "filled" && (on ? "rounded-[10px] bg-panel px-3 text-ink" : "rounded-[10px] px-3 text-steel hover:bg-mist"),
      v.chips === "outline" && (on ? "rounded-full border border-navy bg-navy px-3 text-white" : "rounded-full border border-divider bg-white px-3 text-ink hover:bg-mist"),
      v.chips === "segmented" && (on ? "rounded-[8px] bg-white px-3 text-navy shadow-sm" : "rounded-[8px] px-3 text-steel"),
      v.chips === "text" && (on ? "border-b-2 border-navy text-navy" : "border-b-2 border-transparent text-steel hover:text-ink"),
    );

  const tabCls = (on: boolean) =>
    cn(
      "flex shrink-0 items-center gap-1.5 font-display text-[14px] font-bold whitespace-nowrap",
      v.tabs === "underline" && cn("-mb-px border-b-2 pb-3", on ? "border-navy text-ink" : "border-transparent text-steel hover:text-ink"),
      v.tabs === "pill" && cn("h-9 rounded-full px-3.5", on ? (v.headTint ? "bg-sky text-navy" : "bg-navy text-white") : "text-steel hover:bg-mist"),
      v.tabs === "segmented" && cn("h-8 rounded-[8px] px-3", on ? "bg-white text-navy shadow-sm" : "text-steel"),
    );

  const Toolbar = (
    <>
      <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-2", v.tabs === "underline" && "border-b border-divider", v.tabs === "segmented" && "w-fit rounded-[10px] bg-mist p-1")}>
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className={tabCls(tab === id)}>
            {label} <CountBadge inverted={v.tabs === "pill" && tab === id && !v.headTint}>{count(id)}</CountBadge>
          </button>
        ))}
        <span className={cn("ml-auto", v.tabs === "underline" && "mb-3")}><StatusPill kind="preview" /></span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className={cn("flex flex-wrap items-center", v.chips === "text" ? "gap-5" : "gap-1.5", v.chips === "segmented" && "rounded-[10px] bg-mist p-1")}>
          <button onClick={() => setChips([])} className={chipCls(chips.length === 0)}>All positions</button>
          {CHIPS.map((c) => (
            <button key={c} onClick={() => toggle(c)} aria-pressed={chips.includes(c)} className={chipCls(chips.includes(c))}>{c}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {searching ? (
            <label className="flex h-9 items-center gap-2 rounded-[10px] border border-divider bg-white px-3">
              <Search className="size-4 text-steel" aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Token, network or protocol" aria-label="Search positions" className="w-44 bg-transparent text-[14px] outline-none placeholder:text-steel" />
            </label>
          ) : (
            <button onClick={() => setSearching(true)} aria-label="Search positions" className="flex size-9 items-center justify-center rounded-[10px] bg-mist"><Search className="size-4 text-ink" aria-hidden="true" /></button>
          )}
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort" className="h-9 rounded-[10px] border border-divider bg-white px-3 text-[14px] text-ink">
            {SORTS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}
          </select>
        </div>
      </div>
    </>
  );

  const head = ["#", "Position", "Evidence rating", "Scenario grade", "Evidence gates", "Main risk", "Maturity", compact ? "Evidence" : "Updates", ""];

  return (
    <Surface pad={false} className={cn(v.card === "none" ? "" : "p-5 md:p-6", cards && "bg-transparent p-0 md:p-0 border-0 [box-shadow:none]")}>
      {Toolbar}

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className={cn("w-full min-w-[980px] text-left", compact ? "text-[13px]" : "text-[14px]", cards && cn("border-separate", compact ? "border-spacing-y-1.5" : "border-spacing-y-2"))}>
          <thead>
            <tr className={cn("text-[12px] text-muted-foreground", !cards && "border-b border-divider")} style={{ background: "var(--head-bg)" }}>
              {head.map((h, i) => (
                <th key={i} className={cn("px-2.5 py-2.5 font-normal whitespace-nowrap", i === 0 && "w-10 rounded-l-[10px]", i === head.length - 1 && "rounded-r-[10px]")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={cn(!cards && "divide-y divide-divider")}>
            {list.map((p, i) => (
              <tr
                key={p.slug}
                onClick={() => router.push(`${base}/positions/${p.slug}`)}
                className={cn("cursor-pointer", cards
                    ? cn(
                        "bg-white [&>td:first-child]:rounded-l-[var(--card-r)] [&>td:last-child]:rounded-r-[var(--card-r)]",
                        outlined
                          ? "[&>td]:border-y [&>td]:border-divider [&>td:first-child]:border-l [&>td:last-child]:border-r hover:[&>td]:border-mid hover:bg-mist"
                          : "hover:[box-shadow:0_4px_14px_rgba(15,45,75,.08)]",
                      )
                    : "hover:bg-mist",
                )}
                style={{ height: "var(--row-h)" }}
              >
                <td className="px-2.5 text-muted-foreground tnum">{i + 1}</td>
                <td className="px-2.5">
                  <Link href={`${base}/positions/${p.slug}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-3">
                    <TokenIcon slug={p.slug} size={compact ? 28 : 32} />
                    <span>
                      <span className="block font-display font-bold text-ink">{p.symbol}</span>
                      <span className="block max-w-[170px] truncate text-[12px] text-muted-foreground" title={layerName(p)}>{layerName(p)}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-2.5 whitespace-nowrap"><GradeCell p={p} part="evidence" size={compact ? 15 : 17} showLabels={false} /></td>
                <td className="px-2.5 whitespace-nowrap">
                  <GradeCell p={p} part="scenario" size={compact ? 15 : 17} showLabels={false} />
                  {p.watchlist && <StatusPill kind="watchlist" className="mt-1" />}
                </td>
                <td className="px-2.5" onClick={(e) => e.stopPropagation()}><GateDots p={p} /></td>
                <td className="max-w-[260px] px-3" onClick={(e) => e.stopPropagation()}>
                  <HoverCard>
                    <HoverCardTrigger className="block max-w-[210px] truncate text-left text-ink underline decoration-divider underline-offset-4 xl:max-w-[250px]">{p.keyRisks[0].title}</HoverCardTrigger>
                    <HoverCardContent className="w-80 rounded-[16px] border-divider p-4">
                      <div className="text-[12px] text-muted-foreground">Key risks</div>
                      <ol className="mt-1 space-y-1 text-[13px] leading-5">
                        {p.keyRisks.map((k, n) => <li key={k.id}>{n + 1}. {k.title}</li>)}
                      </ol>
                      <div className="mt-3 text-[12px] text-muted-foreground">Evidence gap</div>
                      <p className="text-[13px] leading-5">{p.evidenceGapLine}</p>
                    </HoverCardContent>
                  </HoverCard>
                </td>
                <td className="px-2.5 whitespace-nowrap">
                  {p.matured && <span className="block text-[12px] leading-4 text-muted-foreground">Matured</span>}
                  <Mono className={compact ? "text-[12px]" : ""}>{p.maturity ?? "Open-ended"}</Mono>
                </td>
                <td className="px-2.5 whitespace-nowrap">
                  {compact ? (
                    <span className="block text-[12px] leading-4 text-muted-foreground tnum">
                      {p.counts.conflicting} conflicting
                      <br />
                      {p.counts.missing} missing
                    </span>
                  ) : unseen(p) ? (
                    <span className="flex items-center gap-1.5 font-display font-bold"><span className="size-2 rounded-full bg-navy" />{unseen(p)} new</span>
                  ) : null}
                </td>
                <td className="px-2.5 text-right"><ChevronRight className="inline size-4 text-horizon" aria-hidden="true" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="py-8 text-center text-[14px] text-muted-foreground">No positions match these filters.</p>}
      </div>

      {/* Below 768 px each row becomes a card */}
      <ul className="mt-4 space-y-2 md:hidden">
        {list.map((p) => (
          <li key={p.slug}>
            <Link href={`${base}/positions/${p.slug}`} className="block rounded-[16px] border border-divider bg-white p-4">
              <div className="flex items-center gap-3">
                <TokenIcon slug={p.slug} size={32} />
                <div className="flex-1">
                  <div className="font-display font-bold">{p.symbol}</div>
                  <div className="text-[12px] text-muted-foreground">{layerName(p)}</div>
                </div>
                <ChevronRight className="size-4 text-horizon" aria-hidden="true" />
              </div>
              <div className="mt-3"><GradeCell p={p} size={18} /></div>
              <p className="mt-3 text-[14px]">{p.keyRisks[0].title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Surface>
  );
}
