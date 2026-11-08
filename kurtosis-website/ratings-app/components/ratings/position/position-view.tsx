// The position page template from the Figma "Position tabs" page. One template renders every token.
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { MISSING_NOTE, SCENARIO_NOTE, extras, positions, type EvidenceState, type Position } from "@/data/ratings";
import { TokenIcon } from "@/components/ratings/primitives";
import { PositionSwitcher } from "@/components/site/chrome";
import { PillTabs } from "./pill-tabs";
import { DependenciesPanel, EvidencePanel, RisksPanel, RoutesPanel, UpdatesPanel, WhyPanel, hrefFor, type Query, type TabId } from "./panels";
import { MaturedChip, Pill, StateChip, WatchChip } from "./ui";
import { PageNotes } from "./footer";

const LIVE = "https://www.kurtosislabs.com/ratings-data";

export const TABS: [TabId, string][] = [
  ["grade", "Why this grade"],
  ["dependencies", "Dependencies"],
  ["routes", "Exit routes"],
  ["risks", "Risk factors"],
  ["evidence", "Evidence"],
  ["updates", "Live updates"],
];

const STATES: (EvidenceState | "all")[] = ["all", "supported", "partial", "conflicting", "missing", "unavailable", "stale"];

/* Turns raw search params into a valid query, falling back to defaults for anything unknown. */
export function parseQuery(p: Position, sp: Record<string, string | string[] | undefined>): Query {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;
  const tab = (TABS.find(([id]) => id === one("tab"))?.[0] ?? "grade") as TabId;
  const route = p.routes.some((r) => r.id === one("route")) ? one("route")! : "settlement";
  const state = (STATES.find((s) => s === one("state")) ?? "all") as Query["state"];
  return { tab, route, state };
}

function GradeStrip({ p }: { p: Position }) {
  const label = "text-[12px] leading-6 text-steel";
  const value = "font-display text-[16px] leading-6 font-medium text-ink lg:whitespace-nowrap";
  const cells: [string, React.ReactNode][] = [
    [
      "Evidence rating",
      <div key="e">
        <div className={`${value} tracking-[-0.03em]`}>{p.evidenceRating}</div>
        <div className="font-display text-[12px] leading-4 font-medium text-steel">{p.confidence} confidence</div>
      </div>,
    ],
    [
      "Scenario grade",
      <div key="s" className="flex flex-wrap items-center gap-2">
        <span className={`${value} tracking-[-0.03em]`}>{p.scenarioGrade}</span>
        <Pill>Assumptions unverified</Pill>
      </div>,
    ],
    ["As of", <span key="a" className={value}>{p.asOf}</span>],
    ["Evidence date", <span key="d" className={value}>{p.evidenceDate}</span>],
    ["Series", <span key="m" className={value}>{p.maturityLabel}</span>],
    ["Token type", <span key="t" className={value}>{p.tokenType}</span>],
  ];
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-[1fr_1.7fr_1fr_1fr_1fr_1fr]">
      {cells.map(([k, v], i) => (
        <div key={k} className={`rounded-[12px] bg-card-bg px-5 py-4 ${i < 2 ? "col-span-2 sm:col-span-1" : ""}`}>
          <dt className={label}>{k}</dt>
          <dd className="pt-1">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Sidebar({ p }: { p: Position }) {
  const h = "font-display text-[15px] leading-5 font-medium text-ink";
  const card = "rounded-[12px] bg-card-bg p-6";
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-[96px] lg:self-start" aria-label={`${p.symbol} summary`}>
      <section className={card}>
        <h2 className={h}>Key risks</h2>
        <ol className="mt-3 flex flex-col gap-3">
          {p.keyRisks.map((k, i) => (
            <li key={k.id} className="flex items-start gap-3 text-[14px] leading-5">
              <span className="font-display text-steel tnum">{i + 1}</span>
              <Link href={hrefFor(p.slug, { tab: "risks" })} className="flex-1 text-ink hover:underline">{k.title}</Link>
              {k.state && <StateChip state={k.state} />}
            </li>
          ))}
        </ol>
      </section>
      <section className={card}>
        <h2 className={h}>Layers</h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {p.layers.map((l) => (
            <li key={l.id} className="flex justify-between gap-3 text-[14px] leading-5">
              <span className="text-ink">{l.title}</span>
              <span className="text-right text-[13px] text-steel">{l.role === "held" ? "Position held" : l.subtitle}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className={`${card} text-[14px]`}>
        <div className="flex items-center justify-between">
          <h2 className={h}>Sources</h2>
          <span className="text-ink tnum">{p.sources.length}</span>
        </div>
        <Link href="/ratings/sources" className="mt-1 inline-flex items-center gap-1 text-horizon hover:underline">
          <FileText className="size-4" aria-hidden="true" />
          Browse sources
        </Link>
        <h2 className={`${h} mt-5`}>Downloads</h2>
        <a href={`${LIVE}/briefs/${p.slug}.txt`} className="mt-2 flex items-center gap-2 text-horizon hover:underline">
          <Download className="size-4" aria-hidden="true" />
          Assessment report (plain text)
        </a>
        <a href={`${LIVE}/assessments/${p.slug}.json`} className="mt-1 flex items-center gap-2 text-horizon hover:underline">
          <Download className="size-4" aria-hidden="true" />
          Assessment data (JSON)
        </a>
        <h2 className={`${h} mt-5`}>Your note</h2>
        <Link href={hrefFor(p.slug, { tab: "evidence" })} className="mt-1 block text-steel hover:underline">
          On the Evidence tab. Saved only in this browser.
        </Link>
      </section>
    </aside>
  );
}

export function PositionView({ p, q }: { p: Position; q: Query }) {
  const count = extras[p.slug]?.updates.length ?? 0;
  const tabItems = TABS.map(([id, label]) => ({
    id,
    label,
    href: hrefFor(p.slug, { tab: id, route: q.route, state: q.state }),
    badge: id === "updates" ? count : undefined,
  }));
  const panel = {
    grade: <WhyPanel p={p} />,
    dependencies: <DependenciesPanel p={p} />,
    routes: <RoutesPanel p={p} route={q.route} />,
    risks: <RisksPanel p={p} />,
    evidence: <EvidencePanel p={p} state={q.state} />,
    updates: <UpdatesPanel p={p} />,
  }[q.tab];
  return (
    <div className="page-mist -mt-12 bg-mist pt-12">
      <main id="top" className="mx-auto w-full max-w-[1240px] px-4 pt-16 sm:pt-24">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/ratings" className="flex items-center gap-1 text-[14px] text-horizon hover:underline">
            <ArrowLeft className="size-4" aria-hidden="true" />
            All positions
          </Link>
          <PositionSwitcher base="/ratings" current={p.slug} options={positions.map((x) => ({ slug: x.slug, symbol: x.symbol }))} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <TokenIcon slug={p.slug} size={40} />
          <div className="min-w-0">
            <h1 className="text-[32px] leading-9 tracking-[-0.03em] text-ink">{p.symbol}</h1>
            <p className="text-[14px] leading-6 text-steel">
              {p.network} / {p.protocol} · {p.tokenType} · Research preview
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            {p.matured && <MaturedChip />}
            {p.watchlist && <WatchChip />}
          </div>
        </div>
        <div className="mt-6">
          <GradeStrip p={p} />
          <p className="pt-2 text-[12px] leading-4 text-steel">{SCENARIO_NOTE}</p>
        </div>
        <p className="mt-6 border-l-[3px] border-navy pl-4 font-display text-[16px] leading-6 font-medium text-ink">{p.bottomLine}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <PillTabs label={`${p.symbol} assessment`} active={q.tab} items={tabItems} />
            <div role="tabpanel" aria-label={TABS.find(([id]) => id === q.tab)?.[1]} className="pt-6">
              {panel}
            </div>
          </div>
          <Sidebar p={p} />
        </div>
      </main>
      <PageNotes notes={[MISSING_NOTE]} />
    </div>
  );
}
