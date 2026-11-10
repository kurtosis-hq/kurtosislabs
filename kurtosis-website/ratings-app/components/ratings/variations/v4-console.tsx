"use client";
// Variation 4 · Console. Master and detail on one screen: pick a position on the left, read it on the right.
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { positions, RUBRIC, RUBRIC_DATE } from "@/data/ratings";
import { Footnotes, GradeCell, Mono, ScenarioNote, StatusPill, TokenIcon, layerName } from "../primitives";
import { GateDots, PositionTabs } from "../interactive";

export function ConsoleView() {
  const [slug, setSlug] = useState(positions[0].slug);
  const p = positions.find((x) => x.slug === slug)!;
  return (
    <div className="mx-auto max-w-[1360px] px-4 pt-20 pb-16">
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <div className="flex-1">
          <h1 className="text-[32px] leading-9 tracking-[-0.045em]">Know the risks behind each position.</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">Select a position to read its assessment. Research preview · Rubric <Mono className="text-[12px]">{RUBRIC}</Mono> · {RUBRIC_DATE}</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-[28px] bg-white p-3 lg:sticky lg:top-[92px] lg:self-start">
          <div className="flex h-9 items-center gap-2 rounded-[10px] bg-mist px-3 text-[14px] text-muted-foreground"><Search className="size-4" aria-hidden="true" />Token, network or protocol</div>
          <ul className="mt-2 space-y-1" role="listbox" aria-label="Positions">
            {positions.map((x) => (
              <li key={x.slug}>
                <button
                  role="option"
                  aria-selected={x.slug === slug}
                  onClick={() => setSlug(x.slug)}
                  className={cn("w-full rounded-[16px] p-3 text-left", x.slug === slug ? "bg-sky ring-2 ring-navy" : "hover:bg-mist")}
                >
                  <div className="flex items-center gap-3">
                    <TokenIcon slug={x.slug} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[15px] font-bold">{x.symbol}</div>
                      <div className="truncate text-[12px] text-muted-foreground">{layerName(x)}</div>
                    </div>
                    <GateDots p={x} inert />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <GradeCell p={x} size={16} showLabels={false} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {x.watchlist && <StatusPill kind="watchlist" />}
                    {x.matured && <StatusPill kind="matured" />}
                    <span className="text-[12px] text-muted-foreground tnum">{x.counts.conflicting} conflicting · {x.counts.missing} missing</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <section className="min-w-0 rounded-[28px] bg-white p-6" aria-live="polite">
          <div className="flex flex-wrap items-center gap-3">
            <TokenIcon slug={p.slug} size={40} />
            <div className="flex-1">
              <h2 className="text-[28px] leading-8 tracking-[-0.03em]">{p.symbol}</h2>
              <p className="text-[13px] text-muted-foreground">{p.network} / {p.protocol} · {p.tokenType} · Research preview</p>
            </div>
          </div>
          <div className="mt-5 grid gap-px overflow-hidden rounded-[16px] bg-divider md:grid-cols-[2.4fr_1fr_1fr_1fr]">
            <div className="bg-mist p-4"><GradeCell p={p} size={24} /></div>
            {[["As of", p.asOf], ["Evidence date", p.evidenceDate], ["Series", p.maturityLabel]].map(([k, v]) => (
              <div key={k} className="bg-mist p-4"><div className="text-[12px] text-muted-foreground">{k}</div><div className="mt-1 font-display font-medium tnum">{v}</div></div>
            ))}
          </div>
          <ScenarioNote className="mt-2" />
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr]">
            <p className="border-l-[3px] border-navy pl-4 font-display text-[16px] leading-6 font-medium">{p.bottomLine}</p>
            <ol className="space-y-1.5 text-[14px] leading-5">
              {p.keyRisks.map((k, i) => (
                <li key={k.id} className="flex gap-2"><span className="font-display text-steel tnum">{i + 1}</span><span className="flex-1">{k.title}</span>{k.state && <StatusPill kind={k.state} />}</li>
              ))}
            </ol>
          </div>
          <div className="mt-6"><PositionTabs key={p.slug} p={p} /></div>
        </section>
      </div>
      <Footnotes className="mt-10" />
    </div>
  );
}
