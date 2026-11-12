import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { siteBase, type Variant } from "@/components/site/variants";
import { Container, Surface } from "@/components/site/ui";
import { SiteFooter } from "@/components/site/blocks";
import { PositionSwitcher } from "@/components/site/chrome";
import { GradeCell, ScenarioNote, StatusPill, TokenIcon } from "@/components/ratings/primitives";
import { PositionTabs } from "@/components/ratings/interactive";
import { MISSING_NOTE, getPosition, positions } from "@/data/ratings";
import { cn } from "@/lib/utils";


const LIVE = "https://www.kurtosislabs.com/ratings-data";

export function PositionPage({ v, slug }: { v: Variant; slug: string }) {
  const p = getPosition(slug);
  if (!p) notFound();
  const base = siteBase(v);
  const cells: [string, React.ReactNode][] = [
    ["Evidence rating", <GradeCell key="e" p={p} part="evidence" size={16} showLabels={false} />],
    ["Scenario grade", <GradeCell key="s" p={p} part="scenario" size={16} showLabels={false} />],
    ["As of", p.asOf],
    ["Evidence date", p.evidenceDate],
    ["Series", p.maturityLabel],
    ["Token type", p.tokenType],
  ];
  const side = "text-[15px] leading-5 font-display font-medium";
  return (
    <>
      <Container className={cn(v.nav === "floating" ? "pt-24" : "pt-10")}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={base} className="flex items-center gap-1 text-[14px] text-horizon hover:underline"><ArrowLeft className="size-4" aria-hidden="true" />All positions</Link>
          <PositionSwitcher base={base} current={p.slug} options={positions.map((x) => ({ slug: x.slug, symbol: x.symbol }))} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <TokenIcon slug={p.slug} size={40} />
          <div>
            <h1 className="text-[32px] leading-9 tracking-[-0.03em]">{p.symbol}</h1>
            <p className="text-[14px] text-muted-foreground">{p.network} / {p.protocol} · {p.tokenType} · Research preview</p>
          </div>
          <div className="ml-auto flex gap-2">
            {p.matured && <StatusPill kind="matured" />}
            {p.watchlist && <StatusPill kind="watchlist" />}
          </div>
        </div>

        <Surface pad={false} className="mt-6 grid grid-cols-2 overflow-hidden md:grid-cols-3 lg:grid-cols-[1fr_1.7fr_1fr_1fr_1fr_1fr]">
          {cells.map(([k, val], i) => (
            <div key={k} className={cn("px-5 py-4", i > 0 && "lg:border-l border-divider", v.card === "none" && i === 0 && "pl-0")}>
              <div className="text-[12px] text-muted-foreground">{k}</div>
              <div className="mt-1 font-display text-[16px] font-medium tnum">{val}</div>
            </div>
          ))}
        </Surface>
        <ScenarioNote className="mt-2" />

        <p className="mt-6 border-l-[3px] border-navy pl-4 font-display text-[16px] leading-6 font-medium">{p.bottomLine}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <PositionTabs key={p.slug} p={p} style={v.tabs} />
          </div>
          <aside className="space-y-4 lg:sticky lg:top-[var(--sticky-top,92px)] lg:col-span-4 lg:self-start">
            <Surface>
              <h2 className={side}>Key risks</h2>
              <ol className="mt-3 space-y-3">
                {p.keyRisks.map((k, i) => (
                  <li key={k.id} className="flex gap-3 text-[14px] leading-5">
                    <span className="font-display text-steel tnum">{i + 1}</span>
                    <span className="flex-1">{k.title}</span>
                    {k.state && <StatusPill kind={k.state} />}
                  </li>
                ))}
              </ol>
            </Surface>
            <Surface>
              <h2 className={side}>Layers</h2>
              <ul className="mt-3 space-y-2.5">
                {p.layers.map((l) => (
                  <li key={l.id} className="flex justify-between gap-3 text-[14px] leading-5">
                    <span>{l.title}</span>
                    <span className="text-right text-[13px] text-muted-foreground">{l.role === "held" ? "Position held" : l.subtitle}</span>
                  </li>
                ))}
              </ul>
            </Surface>
            <Surface className="text-[14px]">
              <div className="flex items-center justify-between"><h2 className={side}>Sources</h2><span className="tnum">{p.sources.length}</span></div>
              <Link href={`${base}/sources`} className="mt-1 inline-flex items-center gap-1 text-horizon hover:underline"><FileText className="size-4" aria-hidden="true" />Browse sources</Link>
              <h2 className={cn(side, "mt-5")}>Downloads</h2>
              <a href={`${LIVE}/briefs/${p.slug}.txt`} className="mt-2 flex items-center gap-2 text-horizon hover:underline"><Download className="size-4" aria-hidden="true" />Assessment report (plain text)</a>
              <a href={`${LIVE}/assessments/${p.slug}.json`} className="mt-1 flex items-center gap-2 text-horizon hover:underline"><Download className="size-4" aria-hidden="true" />Assessment data (JSON)</a>
              <h2 className={cn(side, "mt-5")}>Your note</h2>
              <p className="mt-1 text-muted-foreground">On the Evidence tab. Saved only in this browser.</p>
            </Surface>
          </aside>
        </div>
      </Container>
      <SiteFooter extra={<p>{MISSING_NOTE}</p>} />
    </>
  );
}
