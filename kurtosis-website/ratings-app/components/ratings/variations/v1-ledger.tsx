// Variation 1 · Ledger. The brief as written: Ondo list structure, Elfa detail patterns.
import { ArrowLeft, ChevronRight, Download, Search } from "lucide-react";
import { positions, updates, RUBRIC, RUBRIC_DATE, type Position } from "@/data/ratings";
import { Btn, Footnotes, GradeCell, Mono, RatingsIcon, ScenarioNote, StatusPill, TokenIcon, layerName } from "../primitives";
import { GateDots, PositionTabs } from "../interactive";

function SummaryCard({ title, count, rows }: { title: string; count: number; rows: React.ReactNode[] }) {
  return (
    <div className="rounded-[28px] bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-[15px] leading-5">{title}</h3>
        <span className="rounded-full bg-panel px-1.5 text-[11px] leading-[18px] font-bold">{count}</span>
      </div>
      <ul className="space-y-3">{rows}</ul>
    </div>
  );
}

function Row({ p, right }: { p: Position; right: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <TokenIcon slug={p.slug} size={28} />
      <div className="min-w-0 flex-1">
        <div className="font-display text-[14px] font-bold">{p.symbol}</div>
        <div className="truncate text-[12px] text-muted-foreground">{layerName(p)}</div>
      </div>
      <div className="shrink-0 text-right text-[13px]">{right}</div>
    </li>
  );
}

export function LedgerOverview() {
  const byGaps = [...positions].sort((a, b) => b.counts.conflicting + b.counts.missing - (a.counts.conflicting + a.counts.missing));
  return (
    <>
      <header style={{ background: "var(--wash)" }} className="px-4 pt-20 pb-10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-end gap-6">
          <RatingsIcon />
          <div className="min-w-[min(100%,520px)] flex-1">
            <h1 className="text-[40px] leading-[44px] tracking-[-0.045em]">Know the risks behind each position.</h1>
            <p className="mt-2 text-muted-foreground">Understand what you hold, what could go wrong and how to get back to cash.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill kind="preview" />
            <span className="inline-flex h-[22px] items-center rounded-full bg-white px-2 text-[12px] text-ink">
              Rubric <Mono className="mx-1 text-[12px]">{RUBRIC}</Mono> · {RUBRIC_DATE}
            </span>
            <Btn variant="outline">Compare positions</Btn>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1200px] space-y-6 px-4 pb-16">
        <div className="grid gap-3 rounded-[42px] bg-panel p-3 lg:grid-cols-3">
          <SummaryCard
            title="Needs attention"
            count={1 + updates.length}
            rows={[
              <Row key="w" p={positions[3]} right={<StatusPill kind="watchlist" />} />,
              <Row key="u" p={positions[0]} right={<span className="font-display font-bold">{updates.length} unseen updates</span>} />,
            ]}
          />
          <SummaryCard
            title="Latest updates"
            count={updates.length}
            rows={updates.map((u) => (
              <Row key={u.headline} p={positions[0]} right={<span className="flex items-center gap-2"><span className="text-muted-foreground tnum">{u.rel}</span><StatusPill kind={u.tag} /></span>} />
            ))}
          />
          <SummaryCard
            title="Evidence gaps"
            count={byGaps.length}
            rows={byGaps.slice(0, 3).map((p) => (
              <Row key={p.slug} p={p} right={<span className="tnum">{p.counts.conflicting} conflicting · {p.counts.missing} missing</span>} />
            ))}
          />
        </div>

        <div className="rounded-[28px] bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-divider px-5 pt-4">
            {[["All", 4], ["Principal tokens (PT)", 3], ["Real-world assets (RWA)", 1]].map(([t, n], i) => (
              <button key={t} className={`-mb-px flex items-center gap-1.5 border-b-2 pb-3 font-display text-[14px] font-bold ${i === 0 ? "border-navy text-navy" : "border-transparent text-steel"}`}>
                {t} <span className="rounded-full bg-panel px-1.5 text-[11px] leading-[18px] text-ink">{n}</span>
              </button>
            ))}
            <span className="mb-3 ml-auto"><StatusPill kind="preview" /></span>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-5 py-3">
            {["Solana", "Arbitrum One", "Watchlist", "Matured"].map((c) => (
              <span key={c} className="inline-flex h-8 items-center rounded-full border border-divider px-3 font-display text-[13px] font-bold text-ink">{c}</span>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="flex h-9 items-center gap-2 rounded-[10px] border border-divider px-3 text-[14px] text-muted-foreground"><Search className="size-4" aria-hidden="true" />Search</span>
              <span className="flex h-9 items-center rounded-[10px] border border-divider px-3 text-[14px]">Coverage gaps first</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-[14px] leading-5">
              <thead>
                <tr className="border-y border-divider text-left text-[12px] text-muted-foreground">
                  {["Position", "Evidence rating", "Scenario grade", "Evidence gates", "Main risk", "Maturity", ""].map((h) => (
                    <th key={h} className="px-5 py-2.5 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {positions.map((p) => (
                  <tr key={p.slug} className="h-16 hover:bg-mist">
                    <td className="px-5">
                      <div className="flex items-center gap-3">
                        <TokenIcon slug={p.slug} />
                        <div>
                          <div className="font-display font-bold">{p.symbol}</div>
                          <div className="text-[12px] whitespace-nowrap text-muted-foreground">{layerName(p)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 whitespace-nowrap"><GradeCell p={p} part="evidence" size={18} showLabels={false} /></td>
                    <td className="w-[240px] px-5 whitespace-nowrap">
                      <GradeCell p={p} part="scenario" size={18} showLabels={false} />
                      {p.watchlist && <StatusPill kind="watchlist" className="mt-1" />}
                    </td>
                    <td className="px-5"><GateDots p={p} /></td>
                    <td className="max-w-[260px] truncate px-5" title={p.evidenceGapLine}>{p.keyRisks[0].title}</td>
                    <td className="px-5 whitespace-nowrap"><Mono>{p.maturityLabel}</Mono></td>
                    <td className="px-5 text-right"><ChevronRight className="inline size-4 text-horizon" aria-hidden="true" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Footnotes />
      </div>
    </>
  );
}

export function LedgerPosition({ p }: { p: Position }) {
  const cells: [string, React.ReactNode][] = [
    ["Evidence rating", <GradeCell key="e" p={p} part="evidence" size={16} showLabels={false} />],
    ["Scenario grade", <GradeCell key="s" p={p} part="scenario" size={16} showLabels={false} />],
    ["As of", p.asOf],
    ["Evidence date", p.evidenceDate],
    ["Series", p.maturityLabel],
    ["Token type", p.tokenType],
  ];
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-16">
      <div className="flex flex-wrap items-center gap-4">
        <a href="#" className="flex items-center gap-1 text-[14px] text-horizon"><ArrowLeft className="size-4" aria-hidden="true" />All positions</a>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <TokenIcon slug={p.slug} size={40} />
        <div className="flex-1">
          <h2 className="text-[32px] leading-9 tracking-[-0.03em]">{p.symbol}</h2>
          <p className="text-[14px] text-muted-foreground">{p.network} / {p.protocol} · {p.tokenType} · Research preview</p>
        </div>
        <span className="flex h-9 items-center gap-6 rounded-[10px] border border-divider bg-white px-3 text-[14px]">{p.symbol}<ChevronRight className="size-4 rotate-90" aria-hidden="true" /></span>
      </div>
      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-[28px] bg-white md:grid-cols-3 lg:grid-cols-[1fr_1.7fr_1fr_1fr_1fr_1fr]">
        {cells.map(([k, v], i) => (
          <div key={k} className={`px-5 py-4 ${i > 0 ? "border-l border-divider" : ""}`}>
            <div className="text-[12px] text-muted-foreground">{k}</div>
            <div className="mt-1 font-display text-[16px] font-medium tnum">{v}</div>
          </div>
        ))}
      </div>
      <ScenarioNote className="mt-2" />
      <p className="mt-6 border-l-[3px] border-navy pl-4 font-display text-[16px] leading-6 font-medium">{p.bottomLine}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8"><PositionTabs p={p} /></div>
        <aside className="space-y-6 lg:sticky lg:top-[92px] lg:col-span-4 lg:self-start">
          <div className="rounded-[28px] bg-white p-5">
            <h3 className="mb-3 text-[15px]">Key risks</h3>
            <ol className="space-y-3">
              {p.keyRisks.map((k, i) => (
                <li key={k.id} className="flex gap-3 text-[14px] leading-5">
                  <span className="font-display text-steel tnum">{i + 1}</span>
                  <a href={`#risk-${k.id}`} className="flex-1 hover:underline">{k.title}</a>
                  {k.state && <StatusPill kind={k.state} />}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[28px] bg-white p-5">
            <h3 className="mb-3 text-[15px]">Layers</h3>
            <ul className="space-y-2.5">
              {p.layers.map((l) => (
                <li key={l.id} className="flex justify-between gap-3 text-[14px] leading-5">
                  <span>{l.title}</span>
                  <span className="text-right text-[13px] text-muted-foreground">{l.role === "held" ? "Position held" : l.subtitle}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[28px] bg-white p-5 text-[14px]">
            <div className="flex justify-between"><h3 className="text-[15px]">Sources</h3><span className="tnum">{p.sources.length}</span></div>
            <a href="#" className="mt-2 inline-block text-horizon">Browse sources</a>
            <h3 className="mt-5 mb-2 text-[15px]">Downloads</h3>
            <a href="#" className="flex items-center gap-2 text-horizon"><Download className="size-4" aria-hidden="true" />Assessment report</a>
            <a href="#" className="mt-1 flex items-center gap-2 text-horizon"><Download className="size-4" aria-hidden="true" />Assessment data (JSON)</a>
          </div>
        </aside>
      </div>
      <Footnotes className="mt-12" />
    </div>
  );
}
