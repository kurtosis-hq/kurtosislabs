"use client";
// Overview, built to the Figma frame "Ratings / Overview — Desktop" (Position tabs page).
import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Info, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { MISSING_NOTE, SCENARIO_NOTE, extras, library, overviewRow, positions, type Position } from "@/data/ratings";
import { TokenIcon } from "@/components/ratings/primitives";
import { Container, Notes, PageHeader, RubricPill } from "./kit";

type Cat = "all" | "pt" | "rwa";
type Net = "all" | "Solana" | "Arbitrum One" | "watchlist" | "matured";

const COLS = "grid-cols-[250px_124px_100px_220px_82px_minmax(0,1fr)_100px]";

function PreviewPill() {
  return (
    <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-sky px-2 font-display text-[12px] leading-3 font-bold text-navy">
      <Info className="size-3.5" aria-hidden="true" />
      Research preview
    </span>
  );
}

function WatchPill({ label = "Watchlist" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-st-partial-bg px-2 py-1 font-display text-[12px] leading-[14px] font-bold text-st-partial">
      <Eye className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

/* Outlined chip for "NR" and "Low" (r6, 1 px Divider border). */
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-[6px] border border-divider bg-card-bg px-2 py-[3px] font-display text-[13px] leading-[18px] font-medium text-ink">{children}</span>;
}

function Segmented<T extends string>({ items, value, onChange, size }: { items: [T, string, number?][]; value: T; onChange: (v: T) => void; size: "lg" | "sm" }) {
  return (
    <div role="tablist" className={cn("flex max-w-full items-center overflow-x-auto rounded-[10px] bg-mist p-1 [scrollbar-width:none]", size === "lg" ? "gap-2 sm:gap-6" : "gap-1.5")}>
      {items.map(([id, label, count]) => {
        const on = id === value;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(id)}
            className={cn(
              "flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] px-3 font-display leading-6 font-bold whitespace-nowrap",
              size === "lg" ? "text-[14px]" : "text-[13px]",
              on ? "bg-card-bg text-navy shadow-[0_1px_1.5px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.1)]" : "text-steel hover:text-ink",
            )}
          >
            {label}
            {count !== undefined && <span className="rounded-full bg-panel px-1.5 text-[11px] leading-[18px] text-ink tnum">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Row({ p }: { p: Position }) {
  const o = overviewRow[p.slug];
  return (
    <Link
      href={`/ratings/positions/${p.slug}`}
      className={cn("row-card grid items-center rounded-[12px] bg-card-bg px-4 py-[18px] transition-shadow hover:shadow-[0_2px_10px_rgba(15,45,75,0.08)]", COLS)}
    >
      <span className="flex items-center gap-3">
        <TokenIcon slug={p.slug} size={32} />
        <span className="flex flex-col gap-0.5">
          <span className="font-display text-[15px] leading-5 font-medium text-ink">{p.symbol}</span>
          <span className="font-display text-[13px] leading-[18px] text-steel">{o.subtitle}</span>
        </span>
      </span>
      <span className="font-display text-[14px] leading-5 text-ink">{p.layer === "rwa" ? "Real-world asset" : "Principal token"}</span>
      <span><Chip>{p.evidenceRating}</Chip></span>
      <span className="flex flex-col items-start gap-2">
        <span className="flex items-center gap-2">
          <span className="font-display text-[15px] leading-5 font-medium text-ink">{p.scenarioGrade}</span>
          <span className="rounded-full bg-st-missing-bg px-2 py-1 font-display text-[12px] leading-[14px] font-bold text-st-missing">Assumptions unverified</span>
        </span>
        {p.watchlist && <WatchPill />}
      </span>
      <span><Chip>{p.confidence}</Chip></span>
      <span className="pr-4 font-display text-[14px] leading-5 text-ink">{o.risk}</span>
      <span className="font-mono text-[13px] leading-5 text-ink">{p.maturity ?? "–"}</span>
    </Link>
  );
}

export function OverviewPage() {
  const [cat, setCat] = useState<Cat>("all");
  const [net, setNet] = useState<Net>("all");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return positions.filter(
      (p) =>
        (cat === "all" || p.layer === cat) &&
        (net === "all" || (net === "watchlist" ? p.watchlist : net === "matured" ? p.matured : p.network === net)) &&
        words.every((w) => `${p.symbol} ${p.network} ${p.protocol} ${p.tokenType}`.toLowerCase().includes(w)),
    );
  }, [cat, net, q]);
  // Figma shows ONyc's two unseen saved developments here.
  const unseen = extras.onyc.updates.length;
  const stats: [string, React.ReactNode][] = [
    ["Positions covered", positions.length],
    ["Evidence ratings", `NR for all ${positions.length}`],
    [
      "On watchlist",
      <span key="w" className="flex items-center gap-2">
        {positions.filter((p) => p.watchlist).length}
        {positions.filter((p) => p.watchlist).map((p) => (
          <WatchPill key={p.slug} label={p.symbol} />
        ))}
      </span>,
    ],
    ["Unseen updates", unseen],
    ["Dated sources", library.length],
  ];
  return (
    <>
      <PageHeader
        width={1198}
        title="Know the risks behind each position."
        sub="Understand what you hold, what could go wrong and how to get back to cash. A researched starting point, not a verdict."
        right={
          <>
            <PreviewPill />
            <RubricPill />
          </>
        }
      />
      <Container>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map(([k, v]) => (
            <div key={k} className="rounded-[12px] bg-card-bg px-5 py-4">
              <dt className="text-[12px] leading-6 text-steel">{k}</dt>
              <dd className="pt-1 font-display text-[18px] leading-6 font-medium tracking-[-0.02em] text-ink tnum">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <Segmented<Cat>
              size="lg"
              value={cat}
              onChange={setCat}
              items={[
                ["all", "All", positions.length],
                ["pt", "Principal tokens (PT)", positions.filter((p) => p.layer === "pt").length],
                ["rwa", "Real-world assets (RWA)", positions.filter((p) => p.layer === "rwa").length],
              ]}
            />
            <PreviewPill />
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <Segmented<Net>
              size="sm"
              value={net}
              onChange={setNet}
              items={[["all", "All positions"], ["Solana", "Solana"], ["Arbitrum One", "Arbitrum One"], ["watchlist", "Watchlist"], ["matured", "Matured"]]}
            />
            <label className="ml-auto flex h-9 w-full items-center gap-3 rounded-[10px] border border-divider bg-card-bg px-3 sm:w-[265px]">
              <Search className="size-[13px] shrink-0 text-ink" aria-hidden="true" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Token, network or protocol"
                aria-label="Search positions"
                className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-steel"
              />
            </label>
          </div>

          <div className="overflow-x-auto pt-4">
            <div className="flex min-w-[1176px] flex-col gap-2">
              <div className={cn("grid px-4 py-1 font-display text-[13px] leading-5 text-steel", COLS)}>
                {["Position", "Layer type", "Current grade", "Scenario grade", "Evidence", "Actual risk", "Maturity"].map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>
              {list.map((p) => (
                <Row key={p.slug} p={p} />
              ))}
              {list.length === 0 && <p className="rounded-[12px] bg-card-bg px-4 py-6 text-center text-[14px] text-steel">No positions match these filters.</p>}
            </div>
          </div>
        </div>
      </Container>
      <Notes lines={[SCENARIO_NOTE, MISSING_NOTE]} />
    </>
  );
}
