"use client";
// Compare, built to the Figma frame "Ratings / Compare — Desktop" (Position tabs page):
// row cards split into five cells (200 / 116 / 246 / 323 / 323), 8 px between rows.
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, CircleAlert, Eye, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCENARIO_NOTE, extras, positions, requirementState, requirements, type Position } from "@/data/ratings";
import { TokenIcon } from "@/components/ratings/primitives";
import { StateChip } from "@/components/ratings/position/ui";
import { Accordion, Container, Notes, PageHeader } from "./kit";

const COLS = "grid-cols-[200px_116px_246px_323px_323px]";
const unseen = (p: Position) => (p.slug === "onyc" ? extras.onyc.updates.length : 0);
const attention = (p: Position) => unseen(p) > 0 || p.watchlist || p.counts.conflicting > 0;

function Clamp({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex max-w-[291px] flex-col">
      <p className={cn("text-[14px] leading-5 text-ink", !open && "line-clamp-3")}>{text}</p>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="mt-1 h-5 self-start text-[13px] leading-5 text-horizon hover:underline">
        {open ? "Show less" : "Show more"}
      </button>
    </div>
  );
}

function Table() {
  const [tab, setTab] = useState<"all" | "attention">("all");
  const [sort, setSort] = useState<"gaps" | "name">("gaps");
  const [copied, setCopied] = useState(false);
  const list = useMemo(() => {
    const l = positions.filter((p) => tab === "all" || attention(p));
    return [...l].sort((a, b) =>
      sort === "name" ? a.symbol.localeCompare(b.symbol) : b.counts.conflicting + b.counts.missing - (a.counts.conflicting + a.counts.missing),
    );
  }, [tab, sort]);
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}?view=${tab}&sort=${sort}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const tabBtn = (id: "all" | "attention", label: string, n: number) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
      className={cn("flex h-9 items-center gap-1.5 rounded-[10px] px-3 font-display text-[14px] leading-6 font-bold", tab === id ? "bg-panel text-ink" : "text-steel hover:text-ink")}
    >
      {label}
      <span className="rounded-full px-1.5 text-[11px] leading-[18px] text-ink tnum">{n}</span>
    </button>
  );
  const cell = "bg-card-bg p-4";
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 pt-4">
        {tabBtn("all", "All positions", positions.length)}
        {tabBtn("attention", "Needs attention", positions.filter(attention).length)}
        <span className="relative ml-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            aria-label="Sort"
            className="h-9 appearance-none rounded-[10px] border border-divider bg-card-bg pr-9 pl-4 text-[14px] text-ink"
          >
            <option value="gaps">Coverage gaps first</option>
            <option value="name">Name</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-2.5 right-3 size-4 text-ink" aria-hidden="true" />
        </span>
        <button type="button" onClick={share} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-divider bg-card-bg px-3.5 font-display text-[14px] font-bold text-ink">
          {copied ? <Check className="size-4 text-st-supported" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
          {copied ? "Link copied" : "Share view"}
        </button>
      </div>
      <div className="overflow-x-auto pt-4">
        <div role="table" aria-label="Positions compared" className="flex min-w-[1208px] flex-col gap-2">
          <div role="row" className={cn("grid text-[12px] leading-5 text-steel", COLS)}>
            {["Position", "Evidence rating", "Scenario grade", "Key assumption", "What would change it"].map((h) => (
              <span role="columnheader" key={h} className="px-4 py-3">{h}</span>
            ))}
          </div>
          {list.map((p) => (
            <div role="row" key={p.slug} className={cn("grid", COLS)}>
              <div role="cell" className={cn(cell, "rounded-l-[12px]")}>
                <Link href={`/ratings/positions/${p.slug}`} className="flex items-center gap-3 hover:underline">
                  <TokenIcon slug={p.slug} size={28} />
                  <span>
                    <span className="block font-display text-[14px] leading-5 font-bold text-ink">{p.symbol}</span>
                    <span className="block text-[12px] leading-5 text-steel">{p.network}</span>
                  </span>
                </Link>
                {unseen(p) > 0 && (
                  <span className="flex items-center gap-1.5 pt-2 text-[12px] leading-5 font-bold text-ink">
                    <span className="size-2 rounded-full bg-navy" />
                    {unseen(p)} new updates
                  </span>
                )}
              </div>
              <div role="cell" className={cell}>
                <div className="font-display text-[18px] leading-[19.8px] font-medium tracking-[-0.03em] text-ink">{p.evidenceRating}</div>
                <div className="pt-1 text-[12px] leading-4 whitespace-nowrap text-steel">{p.confidence} confidence</div>
              </div>
              <div role="cell" className={cn(cell, "flex flex-col items-start gap-2")}>
                <span className="flex items-center gap-2">
                  <span className="font-display text-[18px] leading-[19.8px] font-medium tracking-[-0.03em] text-ink">{p.scenarioGrade}</span>
                  <span className="inline-flex h-[22px] items-center rounded-full bg-st-missing-bg px-2 font-display text-[12px] font-bold text-st-missing">Assumptions unverified</span>
                </span>
                {p.watchlist && (
                  <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-st-partial-bg px-2 font-display text-[12px] font-bold text-st-partial">
                    <Eye className="size-3.5" aria-hidden="true" />
                    Watchlist
                  </span>
                )}
              </div>
              <div role="cell" className={cn(cell, "w-[320px]")}><Clamp text={p.keyAssumption} /></div>
              <div role="cell" className={cn(cell, "w-[320px] rounded-r-[12px]")}><Clamp text={p.changeTrigger} /></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const ROWS: [string, (p: Position) => React.ReactNode][] = [
  ["Key risks", (p) => <ul className="space-y-1">{p.keyRisks.map((k) => <li key={k.id}>{k.title}</li>)}</ul>],
  ["Documented risk", (p) => p.actualRisk],
  ["Supporting observations", (p) => p.positiveEvidence],
  ["Still unknown", (p) => p.missingEvidence],
];

const MATRIX = "grid-cols-[103px_repeat(4,minmax(0,1fr))]";

export function ComparePage() {
  const groups = [
    ["position", "Position and protocol requirements"],
    ["underlying", "Underlying assets, claims and cash access"],
  ] as const;
  return (
    <>
      <PageHeader
        title="Compare positions."
        sub="Weigh risks, exit options and evidence gaps side by side."
        right={
          <Link href="/ratings" className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-divider bg-card-bg px-3.5 font-display text-[14px] font-bold text-ink">
            All positions <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      <Container>
        <div className="flex flex-wrap items-center gap-3 rounded-[12px] bg-card-bg px-6 py-6">
          <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-st-partial-bg px-2 font-display text-[12px] font-bold text-st-partial">
            <CircleAlert className="size-3.5" aria-hidden="true" />
            Unable to refresh
          </span>
          <span className="text-[14px] leading-6">
            <b className="font-display font-bold text-ink">Last available check 30 Oct, 03:58 UTC.</b> <span className="text-horizon">All four positions need a fresh or complete check.</span>
          </span>
        </div>
        <Table />
        <p className="pt-3 text-[12px] leading-5 text-steel">{SCENARIO_NOTE}</p>
        <p className="pt-3 text-[12px] leading-5 text-steel">All four current evidence ratings remain NR. Changed assumptions prompt reassessment, never an automatic upgrade.</p>

        <div className="flex flex-col gap-3 pt-10">
          <Accordion title="What could affect your decision" meta="Key risks, supporting evidence and open questions" open card={false}>
            <div className="overflow-x-auto">
              <div className="flex min-w-[900px] flex-col gap-2">
                <div className={cn("grid px-3 py-2 text-[12px] leading-5 text-steel", MATRIX)}>
                  <span />
                  {positions.map((p) => <span key={p.slug} className="pr-4">{p.symbol}</span>)}
                </div>
                {ROWS.map(([label, get]) => (
                  <div key={label} className={cn("grid items-center rounded-[12px] bg-card-bg px-3 py-4 text-[14px] leading-5 text-ink", MATRIX)}>
                    <span className="pr-3 text-[12px] leading-[15px] text-steel">{label}</span>
                    {positions.map((p) => <div key={p.slug} className="pr-4">{get(p)}</div>)}
                  </div>
                ))}
              </div>
            </div>
          </Accordion>

          <Accordion title="Evidence comparison" meta={`${requirements.length} requirements · Position and underlying assets`}>
            <p className="mb-3 text-[14px] text-steel">Shared and position-specific evidence. N/A means the mechanism is not part of that position.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="border-b border-divider text-[12px] text-steel">
                    <th className="px-3 py-2.5 font-normal">Required area</th>
                    {positions.map((p) => <th key={p.slug} className="px-3 py-2.5 font-normal">{p.symbol}</th>)}
                  </tr>
                </thead>
                {groups.map(([g, label]) => (
                  <tbody key={g} className="divide-y divide-divider">
                    <tr><th colSpan={5} className="bg-mist px-3 py-2 text-left font-display text-[12px] font-medium text-steel">{label}</th></tr>
                    {requirements.filter((r) => r.group === g).map((r) => (
                      <tr key={r.id}>
                        <th className="px-3 py-3 text-left text-[13px] leading-5 font-normal text-ink">{r.title}</th>
                        {positions.map((p) => (
                          <td key={p.slug} className="px-3 py-3"><StateChip state={requirementState(p, r)} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
            <p className="mt-3 text-[12px] text-steel">Evidence states describe individual requirements. They are not a completion percentage, confidence score or investment ranking.</p>
          </Accordion>

          <Accordion title="Exposure and routes to cash" meta="Protocols, holder exposure and routes to cash">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-[13px] leading-5">
                <thead>
                  <tr className="border-b border-divider text-[12px] text-steel">
                    <th className="px-3 py-2.5 font-normal">Required area</th>
                    {positions.map((p) => <th key={p.slug} className="px-3 py-2.5 font-normal">{p.symbol}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider align-top">
                  {([
                    ["Network / protocol", (p: Position) => `${p.network} / ${p.protocol}`],
                    ["Evidence date", (p: Position) => p.evidenceDate],
                    ["Watchlist designation", (p: Position) => (p.watchlist ? "Watchlist" : "Not designated")],
                    ["Position exposure", (p: Position) => p.summary],
                    ["Exact maturity", (p: Position) => p.maturityExact ?? "No contractual PT (principal token) maturity"],
                    ["Loss being assessed", (p: Position) => p.lossObject],
                    ["Material evidence gap", (p: Position) => p.evidenceGapLine],
                  ] as const).map(([k, get]) => (
                    <tr key={k}>
                      <th className="px-3 py-3 text-left text-[12px] font-normal text-steel">{k}</th>
                      {positions.map((p) => <td key={p.slug} className="px-3 py-3 text-ink">{get(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12px] text-steel">Each PT (principal token) has its own contract, chain and maturity. Evidence states across different assets do not imply comparable risk.</p>
          </Accordion>
        </div>
      </Container>
      <Notes lines={[]} />
    </>
  );
}
