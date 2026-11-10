"use client";
// Compare: tabs, sort and share, then the main table with a sticky first column.
import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { positions, updates, type Position } from "@/data/ratings";
import { GradeCell, StatusPill, TokenIcon } from "@/components/ratings/primitives";
import { Clamp } from "@/components/ratings/interactive";
import { CountBadge, Surface } from "./ui";
import { siteBase, type Variant } from "./variants";

const unseen = (p: Position) => updates.filter((u) => u.position === p.slug && !u.seen).length;
// Needs attention: unread updates, a watchlist flag or a conflicting requirement (all four today).
const attention = (p: Position) => unseen(p) > 0 || p.watchlist || p.counts.conflicting > 0;

export function CompareTable({ v }: { v: Variant }) {
  const [tab, setTab] = useState<"all" | "attention">("all");
  const [sort, setSort] = useState<"gaps" | "name">("gaps");
  const [copied, setCopied] = useState(false);
  const list = useMemo(() => {
    const l = positions.filter((p) => tab === "all" || attention(p));
    return [...l].sort((a, b) =>
      sort === "name" ? a.symbol.localeCompare(b.symbol) : b.counts.conflicting + b.counts.missing - (a.counts.conflicting + a.counts.missing),
    );
  }, [tab, sort]);
  const share = () => {
    try {
      navigator.clipboard?.writeText(`${location.origin}${location.pathname}?view=${tab}&sort=${sort}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const tabBtn = (id: "all" | "attention", label: string, n: number) => (
    <button
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-[10px] px-3 font-display text-[14px] font-bold",
        tab === id ? "bg-panel text-ink" : "text-steel hover:bg-mist",
      )}
    >
      {label} <CountBadge>{n}</CountBadge>
    </button>
  );
  const base = siteBase(v);
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {tabBtn("all", "All positions", positions.length)}
        {tabBtn("attention", "Needs attention", positions.filter(attention).length)}
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort" className="ml-2 h-9 rounded-[10px] border border-divider bg-white px-3 text-[14px]">
          <option value="gaps">Coverage gaps first</option>
          <option value="name">Name</option>
        </select>
        <button onClick={share} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-divider bg-white px-3.5 font-display text-[14px] font-bold">
          {copied ? <Check className="size-4 text-st-supported" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
          {copied ? "Link copied" : "Share view"}
        </button>
      </div>
      <Surface pad={false} className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-[14px] leading-5">
          <thead>
            <tr className="border-b border-divider text-[12px] text-muted-foreground" style={{ background: "var(--head-bg)" }}>
              {["Position", "Evidence rating", "Scenario grade", "Key assumption", "What would change it"].map((h, i) => (
                <th key={h} className={cn("px-4 py-3 font-normal", i === 0 && "sticky left-0 z-10 bg-[var(--card-bg)]")}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-divider align-top">
            {list.map((p) => (
              <tr key={p.slug}>
                <td className="sticky left-0 z-10 w-[200px] bg-white px-4 py-4">
                  <Link href={`${base}/positions/${p.slug}`} className="flex items-center gap-3 hover:underline">
                    <TokenIcon slug={p.slug} size={28} />
                    <span>
                      <span className="block font-display font-bold">{p.symbol}</span>
                      <span className="block text-[12px] text-muted-foreground">{p.network}</span>
                    </span>
                  </Link>
                  {unseen(p) > 0 && <span className="mt-2 flex items-center gap-1.5 text-[12px] font-bold"><span className="size-2 rounded-full bg-navy" />{unseen(p)} new updates</span>}
                </td>
                <td className="px-4 py-4 whitespace-nowrap"><GradeCell p={p} part="evidence" size={18} showLabels={false} /></td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <GradeCell p={p} part="scenario" size={18} showLabels={false} />
                  {p.watchlist && <StatusPill kind="watchlist" className="mt-2" />}
                </td>
                <td className="max-w-[320px] px-4 py-4"><Clamp text={p.keyAssumption} lines={3} /></td>
                <td className="max-w-[320px] px-4 py-4"><Clamp text={p.changeTrigger} lines={3} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Surface>
    </>
  );
}
