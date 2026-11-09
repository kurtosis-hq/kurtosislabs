// Variation 3 · Bento. Every position is a card; the position page is a grid of cards inside Panels.
import { ArrowRight, Layers } from "lucide-react";
import { positions, RUBRIC, RUBRIC_DATE, type Position } from "@/data/ratings";
import { Btn, Footnotes, GradeCell, Mono, RatingsIcon, ScenarioNote, StatusPill, TokenIcon, layerName } from "../primitives";
import { GateDots, PositionTabs } from "../interactive";

function PositionCard({ p }: { p: Position }) {
  return (
    <a href="#" className="flex flex-col rounded-[28px] bg-white p-6 transition-shadow hover:shadow-[0_4px_14px_rgba(15,45,75,.10)]">
      <div className="flex items-start gap-3">
        <TokenIcon slug={p.slug} size={40} />
        <div className="flex-1">
          <h3 className="text-[24px] leading-[30px] tracking-[-0.03em]">{p.symbol}</h3>
          <p className="text-[13px] text-muted-foreground">{layerName(p)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {p.matured && <StatusPill kind="matured" />}
          {p.watchlist && <StatusPill kind="watchlist" />}
        </div>
      </div>
      <div className="mt-6 rounded-[16px] bg-mist p-4"><GradeCell p={p} size={30} /></div>
      <div className="mt-5 grid grid-cols-[1fr_auto] gap-6">
        <div>
          <div className="text-[12px] text-muted-foreground">Key risks</div>
          <ul className="mt-1.5 space-y-1 text-[14px] leading-5">
            {p.keyRisks.map((k) => <li key={k.id}>{k.title}</li>)}
          </ul>
        </div>
        <div>
          <div className="mb-1.5 text-[12px] text-muted-foreground">Evidence gates</div>
          <GateDots p={p} withLabels inert />
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-divider pt-4 text-[13px]">
        <span className="tnum text-muted-foreground">{p.counts.conflicting} conflicting · {p.counts.missing} missing · {p.counts.partial} partial</span>
        <span className="flex items-center gap-1 font-display font-bold text-navy">Open<ArrowRight className="size-4" aria-hidden="true" /></span>
      </div>
    </a>
  );
}

export function BentoOverview() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-20 pb-16">
      <div className="grid gap-3 rounded-[42px] bg-panel p-3 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col justify-between rounded-[28px] p-6" style={{ background: "var(--wash)" }}>
          <RatingsIcon size={48} />
          <div className="mt-10">
            <h1 className="text-[40px] leading-[44px] tracking-[-0.045em]">Know the risks behind each position.</h1>
            <p className="mt-2 text-muted-foreground">What you hold, what could go wrong, and how to get back to cash.</p>
            <div className="mt-5 flex flex-wrap gap-2"><StatusPill kind="preview" /><Btn variant="primary">Compare positions</Btn></div>
          </div>
        </div>
        <div className="rounded-[28px] bg-white p-6">
          <div className="text-[12px] text-muted-foreground">Evidence ratings</div>
          <div className="mt-2 font-display text-[56px] leading-none font-medium tracking-[-0.045em]">4 NR</div>
          <p className="mt-3 text-[14px] leading-5">No position has a sufficient basis for a grade yet. Missing evidence earns NR, never CCC.</p>
        </div>
        <div className="flex flex-col rounded-[28px] bg-white p-6">
          <div className="text-[12px] text-muted-foreground">Method</div>
          <div className="mt-2 font-display text-[18px] font-medium">Four evidence gates</div>
          <p className="mt-1 text-[14px] leading-5">Holder rights, backing, token payoff and cash access must all be supported before a grade.</p>
          <p className="mt-auto pt-4 text-[12px] text-muted-foreground">Rubric <Mono className="text-[12px]">{RUBRIC}</Mono> · {RUBRIC_DATE}</p>
        </div>
      </div>
      <div className="mt-6 mb-3 flex items-center gap-2">
        <h2 className="text-[24px] tracking-[-0.03em]">Positions</h2>
        <span className="rounded-full bg-panel px-2 text-[12px] font-bold leading-5">4</span>
        <div className="ml-auto flex gap-2">
          {["All", "Principal tokens (PT)", "Real-world assets (RWA)"].map((c, i) => (
            <span key={c} className={`inline-flex h-8 items-center rounded-full px-3 font-display text-[13px] font-bold ${i === 0 ? "bg-navy text-white" : "border border-divider bg-white"}`}>{c}</span>
          ))}
        </div>
      </div>
      <div className="grid gap-3 rounded-[42px] bg-panel p-3 md:grid-cols-2">
        {positions.map((p) => <PositionCard key={p.slug} p={p} />)}
      </div>
      <Footnotes className="mt-8" />
    </div>
  );
}

export function BentoPosition({ p }: { p: Position }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-16">
      <div className="grid gap-3 rounded-[42px] bg-panel p-3 lg:grid-cols-4">
        <div className="rounded-[28px] bg-white p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <TokenIcon slug={p.slug} size={48} />
            <div>
              <h2 className="text-[40px] leading-[44px] tracking-[-0.045em]">{p.symbol}</h2>
              <p className="text-[14px] text-muted-foreground">{p.network} / {p.protocol} · {p.tokenType}</p>
            </div>
            <span className="ml-auto"><StatusPill kind="preview" /></span>
          </div>
          <p className="mt-6 border-l-[3px] border-navy pl-4 font-display text-[17px] leading-6 font-medium">{p.bottomLine}</p>
        </div>
        <div className="rounded-[28px] bg-white p-6 lg:col-span-2">
          <GradeCell p={p} size={44} />
          <ScenarioNote className="mt-4" />
          <dl className="mt-5 grid grid-cols-2 gap-3 text-[13px] md:grid-cols-4">
            {[["As of", p.asOf], ["Evidence date", p.evidenceDate], ["Series", p.maturityLabel], ["Token type", p.tokenType]].map(([k, v]) => (
              <div key={k} className="rounded-[12px] bg-mist p-3"><dt className="text-[12px] text-muted-foreground">{k}</dt><dd className="mt-0.5 font-display font-medium tnum">{v}</dd></div>
            ))}
          </dl>
        </div>
        {p.keyRisks.map((k, i) => (
          <div key={k.id} className="rounded-[28px] bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="font-display text-[32px] leading-none font-medium text-muted-text tnum">0{i + 1}</span>
              {k.state && <StatusPill kind={k.state} />}
            </div>
            <h3 className="mt-4 text-[18px] leading-6">{k.title}</h3>
            <p className="mt-2 text-[14px] leading-5 text-muted-foreground">{k.implication}</p>
          </div>
        ))}
        <div className="rounded-[28px] bg-navy p-6 text-white">
          <Layers className="size-6" aria-hidden="true" />
          <h3 className="mt-4 text-[18px]">{p.layers.length} layers deep</h3>
          <ul className="mt-2 space-y-1 text-[13px] text-white/80">
            {p.layers.slice(0, 4).map((l) => <li key={l.id}>{l.title}</li>)}
          </ul>
        </div>
      </div>
      <div className="mt-8"><PositionTabs p={p} style="segmented" /></div>
      <Footnotes className="mt-12" />
    </div>
  );
}
