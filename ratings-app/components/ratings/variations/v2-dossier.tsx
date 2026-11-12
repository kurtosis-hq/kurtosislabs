// Variation 2 · Dossier. A research report: one reading column, numbered sections, hairlines instead of cards.
import { ArrowRight } from "lucide-react";
import { positions, RUBRIC, RUBRIC_DATE, type Position } from "@/data/ratings";
import { Eyebrow, Footnotes, GradeCell, Mono, ScenarioNote, StatusPill, TokenIcon, layerName } from "../primitives";
import { GateDots, PositionTabs } from "../interactive";

export function DossierOverview() {
  return (
    <div className="bg-white">
      <header className="mx-auto max-w-[880px] px-4 pt-24 pb-12">
        <Eyebrow>Kurtosis Ratings · Research preview</Eyebrow>
        <h1 className="mt-4 text-[56px] leading-[58px] tracking-[-0.045em]">Know the risks behind each position.</h1>
        <p className="mt-5 max-w-[640px] text-[19px] leading-7 text-ink">
          Four onchain positions, each traced to what you own, what could make you lose money and how you would get back to cash.
          A researched starting point, not a verdict.
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-divider pt-5 text-[14px] md:grid-cols-4">
          {[
            ["Positions covered", "4"],
            ["Evidence ratings", "4 × NR"],
            ["Dated sources", "71"],
            ["Rubric", `v3 · ${RUBRIC_DATE}`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[12px] text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-display text-[20px] font-medium tracking-[-0.02em] tnum">{v}</dd>
            </div>
          ))}
        </dl>
      </header>
      <div className="mx-auto max-w-[880px] px-4 pb-20">
        <div className="flex items-baseline gap-3 border-b-2 border-ink pb-3">
          <span className="font-display text-[14px] text-horizon tnum">01</span>
          <h2 className="text-[24px] leading-[30px] tracking-[-0.03em]">Positions</h2>
          <span className="ml-auto text-[13px] text-muted-foreground">Sorted by evidence gaps</span>
        </div>
        <ol>
          {positions.map((p, i) => (
            <li key={p.slug} className="group grid gap-6 border-b border-divider py-8 md:grid-cols-[1fr_1.3fr]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-[13px] text-steel tnum">{String(i + 1).padStart(2, "0")}</span>
                  <TokenIcon slug={p.slug} size={28} />
                  <h3 className="text-[28px] leading-8 tracking-[-0.03em]">{p.symbol}</h3>
                </div>
                <p className="mt-2 text-[14px] text-muted-foreground">
                  {layerName(p)} · <Mono className="text-[13px]">{p.maturityLabel}</Mono>
                </p>
                <div className="mt-5"><GradeCell p={p} size={28} /></div>
                {p.watchlist && <StatusPill kind="watchlist" className="mt-3" />}
              </div>
              <div className="text-[15px] leading-6">
                <p className="font-display text-[17px] leading-6 font-medium">{p.bottomLine}</p>
                <ul className="mt-4 space-y-1.5">
                  {p.keyRisks.map((k) => (
                    <li key={k.id} className="flex items-baseline gap-3"><span className="h-px w-3 shrink-0 translate-y-[-4px] bg-horizon" aria-hidden="true" />{k.title}</li>
                  ))}
                </ul>
                <p className="mt-4 text-[14px] leading-5 text-muted-foreground"><b className="font-display text-ink">Evidence gap.</b> {p.evidenceGapLine}</p>
                <div className="mt-4 flex items-center gap-4">
                  <GateDots p={p} />
                  <a href="#" className="ml-auto flex items-center gap-1 font-display text-[14px] font-bold text-navy">Read the assessment<ArrowRight className="size-4" aria-hidden="true" /></a>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <Footnotes className="mt-10 border-0 pt-0" />
      </div>
    </div>
  );
}

export function DossierPosition({ p }: { p: Position }) {
  const toc = ["Summary", "Grade status", "Key risks", "Assessment"];
  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-[1120px] gap-10 px-4 pt-16 pb-20 lg:grid-cols-[200px_1fr]">
        <nav aria-label="On this page" className="hidden lg:sticky lg:top-[92px] lg:block lg:self-start">
          <div className="text-[12px] text-muted-foreground">On this page</div>
          <ol className="mt-3 space-y-2 border-l border-divider text-[14px]">
            {toc.map((t, i) => (
              <li key={t} className={`-ml-px border-l-2 pl-3 ${i === 0 ? "border-navy text-navy" : "border-transparent text-steel"}`}>{t}</li>
            ))}
          </ol>
        </nav>
        <article className="max-w-[760px]">
          <Eyebrow>{p.network} / {p.protocol} · Research preview</Eyebrow>
          <h2 className="mt-3 flex items-center gap-4 text-[56px] leading-[58px] tracking-[-0.045em]"><TokenIcon slug={p.slug} size={44} />{p.symbol}</h2>
          <p className="mt-4 text-[19px] leading-7">{p.bottomLine}</p>

          <section className="mt-10 border-t-2 border-ink pt-5">
            <div className="flex items-baseline gap-3"><span className="font-display text-[14px] text-horizon">01</span><h3 className="text-[24px] tracking-[-0.03em]">Grade status</h3></div>
            <div className="mt-5"><GradeCell p={p} size={40} /></div>
            <ScenarioNote className="mt-3" />
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-[14px] md:grid-cols-4">
              {[["As of", p.asOf], ["Evidence date", p.evidenceDate], ["Series", p.maturityLabel], ["Token type", p.tokenType]].map(([k, v]) => (
                <div key={k}><dt className="text-[12px] text-muted-foreground">{k}</dt><dd className="mt-1 font-display font-medium tnum">{v}</dd></div>
              ))}
            </dl>
          </section>

          <section className="mt-10 border-t-2 border-ink pt-5">
            <div className="flex items-baseline gap-3"><span className="font-display text-[14px] text-horizon">02</span><h3 className="text-[24px] tracking-[-0.03em]">Key risks</h3></div>
            <ol className="mt-4 divide-y divide-divider">
              {p.keyRisks.map((k, i) => (
                <li key={k.id} className="grid grid-cols-[32px_1fr_auto] gap-3 py-4">
                  <span className="font-display text-[18px] text-steel tnum">{i + 1}</span>
                  <div><div className="font-display text-[17px] font-medium">{k.title}</div><p className="mt-1 text-[15px] leading-6 text-muted-foreground">{k.implication}</p></div>
                  {k.state && <StatusPill kind={k.state} />}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10 border-t-2 border-ink pt-5">
            <div className="mb-4 flex items-baseline gap-3"><span className="font-display text-[14px] text-horizon">03</span><h3 className="text-[24px] tracking-[-0.03em]">Assessment</h3></div>
            <div className="rounded-[28px] bg-mist p-4">
              <PositionTabs p={p} style="pill" />
            </div>
          </section>
          <p className="mt-6 text-[12px] text-muted-foreground">Rubric <Mono className="text-[12px]">{RUBRIC}</Mono> · {RUBRIC_DATE}</p>
          <Footnotes className="mt-6" />
        </article>
      </div>
    </div>
  );
}
