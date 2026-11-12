// The six tab panels of the position page, one per Figma frame on the "Position tabs" page.
// All content comes from data/ratings.ts; nothing here is per-token.
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UPDATES_RETRIEVED,
  UPDATES_WINDOW,
  extras,
  type EvidenceState,
  type Layer,
  type Position,
} from "@/data/ratings";
import { PillTabs } from "./pill-tabs";
import { Expandable, PositionNote } from "./client";
import { Callout, Card, ExternalChip, Inset, Label, Pill, SectionHead, SourceChips, StateChip, TagChip, Tray, stateLabel } from "./ui";

export type TabId = "grade" | "dependencies" | "routes" | "risks" | "evidence" | "updates";
export type Query = { tab: TabId; route: string; state: EvidenceState | "all" };

export function hrefFor(slug: string, q: Partial<Query>) {
  const s = new URLSearchParams();
  if (q.tab && q.tab !== "grade") s.set("tab", q.tab);
  if (q.tab === "routes" && q.route) s.set("route", q.route);
  if (q.tab === "evidence" && q.state && q.state !== "all") s.set("state", q.state);
  const qs = s.toString();
  return `/ratings/positions/${slug}${qs ? `?${qs}` : ""}`;
}

const num = (i: number) => String(i + 1).padStart(2, "0");

/* ---------- Why this grade ---------- */

export function WhyPanel({ p }: { p: Position }) {
  const cards: [string, string][] = [
    ["Scenario assumption", p.scenarioSummary],
    ["Documented risk", p.actualRisk],
    ["Supporting observations", p.positiveEvidence],
    ["Still unknown", p.missingEvidence],
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 rounded-[24px] bg-panel p-3 sm:grid-cols-2">
        {cards.map(([t, b]) => (
          <Card key={t}>
            <h3 className="text-[18px] leading-6 tracking-[-0.01em] text-ink">{t}</h3>
            <p className="text-[15px] leading-6 text-ink">{b}</p>
          </Card>
        ))}
      </div>
      <section className="flex flex-col gap-3">
        <SectionHead title={`Assumptions needed for ${p.scenarioGrade}`} as="h3" />
        <ol className="flex flex-col gap-2">
          {p.scenarioAssumptions.map((a, i) => (
            <li key={i} className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-1.5 gap-y-2 rounded-[12px] bg-card-bg px-3.5 py-4 sm:grid-cols-[28px_minmax(0,1fr)_auto]">
              <span className="font-display text-[15px] leading-6 font-medium text-steel tnum">{num(i)}</span>
              <p className="text-[15px] leading-6 text-ink">{a}</p>
              <span className="col-start-2 sm:col-start-3">
                <Pill>Unverified</Pill>
              </span>
            </li>
          ))}
        </ol>
      </section>
      {p.changeReason && (
        <Callout>
          <b className="font-display font-bold">Methodology correction.</b> {p.changeReason}
        </Callout>
      )}
    </div>
  );
}

/* ---------- Dependencies ---------- */

const ROLE: Record<string, string> = { held: "Position held", D: "Economic dependency", R: "Exit route dependency" };

function LayerCard({ p, l, role }: { p: Position; l: Layer; role: string }) {
  return (
    <Card as="article">
      <div className="flex items-start gap-3">
        <h3 className="flex-1 font-display text-[16px] leading-6 font-medium text-ink">{l.title}</h3>
        <Pill>{role}</Pill>
      </div>
      <p className="text-[13px] leading-5 text-steel">{l.subtitle}</p>
      <p className="text-[15px] leading-6 text-ink">{l.description}</p>
      <div>
        <Label>What this means for your position</Label>
        <p className="mt-1 text-[15px] leading-6 text-ink">{l.risk}</p>
      </div>
      <SourceChips p={p} ids={l.sourceIds} />
    </Card>
  );
}

export function DependenciesPanel({ p }: { p: Position }) {
  const chain = p.layers.filter((l) => l.role === "held" || l.role === "D");
  const shared = p.layers.filter((l) => l.role === "S");
  const control = shared.filter((l) => /control/i.test(`${l.title} ${l.subtitle}`));
  const protection = shared.filter((l) => !control.includes(l));
  const alt = p.layers.filter((l) => l.role === "R");
  const groups: [string, string, Layer[], string][] = [
    ["Protection behind your position", "Protection that can absorb losses before they reach your position. It is not an asset you hold.", protection, "Protection dependency"],
    ["Who controls your access to cash", "Shared controls that can affect several layers together.", control, "Shared control"],
    ["Alternative exit", "A route to cash that does not rely on redemption.", alt, ROLE.R],
  ];
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <SectionHead title="What your position depends on" intro="Trace your position to the assets, cash flows and rights behind it. Each layer shows what it means for your position and the evidence behind it." />
        <Tray>
          {chain.map((l, i) => (
            <div key={l.id} className="flex flex-col gap-2">
              {i > 0 && <p className="px-4 text-[13px] leading-5 text-steel">↓&nbsp;&nbsp;Economic dependency</p>}
              <LayerCard p={p} l={l} role={ROLE[l.role]} />
            </div>
          ))}
        </Tray>
      </section>
      {groups.map(([title, intro, list, role]) =>
        list.length ? (
          <section key={title} className="flex flex-col gap-3">
            <SectionHead title={title} intro={intro} />
            <Tray>
              {list.map((l) => (
                <LayerCard key={l.id} p={p} l={l} role={role} />
              ))}
            </Tray>
          </section>
        ) : null,
      )}
      <p className="text-[13px] leading-5 text-steel">Relationships describe the current assessment scope.</p>
    </div>
  );
}

/* ---------- Exit routes ---------- */

export function RoutesPanel({ p, route }: { p: Position; route: string }) {
  const r = p.routes.find((x) => x.id === route) ?? p.routes[0];
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <SectionHead title="Exit routes" intro="Follow each step from your holding back to cash, including the conditions that could delay or block an exit. This comparison targets USDC; executable outputs remain unverified." />
        <PillTabs
          label="Route"
          active={r.id}
          items={p.routes.map((x) => ({ id: x.id, label: x.label, href: hrefFor(p.slug, { tab: "routes", route: x.id }) }))}
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <Pill>Indicative route</Pill>
          <p className="min-w-0 flex-1 text-[13px] leading-5 text-steel">{r.summary}</p>
        </div>
      </section>
      <Tray>
        <ol className="flex flex-col gap-2" aria-label={`${r.label} steps`}>
          {r.steps.map((s, i) => (
            <Card as="li" key={i} className="gap-3.5">
              <div className="flex items-center gap-3">
                <span className="font-display text-[15px] font-medium text-steel tnum">{num(i)}</span>
                <h3 className="flex-1 font-display text-[16px] leading-6 font-medium text-ink">{s.title}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill>{s.input}</Pill>
                <ArrowRight className="size-3.5 text-steel" aria-label="becomes" />
                <Pill>{s.output}</Pill>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Inset label="What needs to happen">{s.condition}</Inset>
                <Inset label="What could go wrong">{s.risk}</Inset>
              </div>
              <SourceChips p={p} ids={s.sourceIds} />
            </Card>
          ))}
        </ol>
      </Tray>
      <p className="text-[13px] leading-5 text-steel">Indicative route map. No transaction was simulated or submitted. Exit capacity, fees and settlement units require verification for the chosen size and wallet.</p>
    </div>
  );
}

/* ---------- Risk factors ---------- */

function FactorCard({ p, i, f }: { p: Position; i: number; f: Position["factors"][number] }) {
  return (
    <Card as="article" className="gap-3">
      <div className="flex items-start gap-3">
        <span className="font-display text-[15px] leading-6 font-medium text-steel tnum">{num(i)}</span>
        <h3 className="flex-1 font-display text-[16px] leading-6 font-medium text-ink">{f.title}</h3>
        <StateChip state={f.state} />
      </div>
      {f.implication && <p className="text-[15px] leading-6 font-medium text-ink">{f.implication}</p>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Inset label="Evidence">{f.detail}</Inset>
        {f.check && <Inset label="What still needs checking">{f.check}</Inset>}
      </div>
      <SourceChips p={p} ids={f.sourceIds} />
    </Card>
  );
}

export function RisksPanel({ p }: { p: Position }) {
  const keyIds = p.keyRisks.map((k) => k.id);
  const key = keyIds.map((id) => p.factors.find((f) => f.id === id)).filter((f): f is Position["factors"][number] => !!f);
  const rest = p.factors.filter((f) => !keyIds.includes(f.id));
  return (
    <div className="flex flex-col gap-6">
      <SectionHead title="What could cause a loss" intro="Start with the three key risks to your capital, then review the full list before making your investment case." />
      <Tray>
        {key.map((f, i) => (
          <FactorCard key={f.id} p={p} i={i} f={f} />
        ))}
      </Tray>
      {rest.length > 0 && (
        <Expandable total={p.factors.length}>
          <section className="flex flex-col gap-3">
            <SectionHead title="Other risk factors" />
            <Tray>
              {rest.map((f, i) => (
                <FactorCard key={f.id} p={p} i={key.length + i} f={f} />
              ))}
            </Tray>
          </section>
        </Expandable>
      )}
      <Callout className="flex flex-col gap-1.5">
        <Label>Before you commit</Label>
        <p className="font-medium text-ink">{p.beforeCommit.title}</p>
        <p className="text-[15px] leading-6 text-ink">{p.beforeCommit.detail}</p>
        <Link href={hrefFor(p.slug, { tab: "routes", route: "settlement" })} className="mt-1 inline-flex items-center gap-1 font-display text-[14px] font-bold text-horizon hover:underline">
          Review your route to cash <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Callout>
    </div>
  );
}

/* ---------- Evidence ---------- */

const FILTERS: (EvidenceState | "all")[] = ["all", "supported", "partial", "stale", "conflicting", "missing", "unavailable"];

export function EvidencePanel({ p, state }: { p: Position; state: EvidenceState | "all" }) {
  const x = extras[p.slug];
  const shown = state === "all" ? p.evidence : p.evidence.filter((e) => e.state === state);
  const scope: [string, string][] = [
    ["Full token mint", p.mint],
    ["Series maturity", p.maturityExact ? `${p.maturityExact} · matured` : "No contractual PT maturity"],
    ["Category", `${p.lane} · ${p.lossObject}`],
    ["Evidence retrieved", `${p.evidenceDate} · no automatic refresh`],
  ];
  return (
    <div className="flex flex-col gap-6">
      <Callout className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-start gap-3">
          <h2 className="flex-1 font-display text-[16px] leading-6 font-medium text-ink">Further review needed</h2>
          <Pill>Reviewed {p.asOf}</Pill>
        </div>
        <Label>Evidence still needed</Label>
        <ul className="list-disc space-y-1 pl-5 text-[15px] leading-6 text-ink">
          {x.evidenceNeeded.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </Callout>
      <section className="flex flex-col gap-3">
        <SectionHead title="Evidence and open questions" intro="See what supports the investment case and which questions remain open. Documentation describes how a position should work; deployed contracts, legal rights and executable exits need separate verification." />
        <PillTabs
          label="Filter evidence by state"
          active={state}
          items={FILTERS.map((f) => ({ id: f, label: f === "all" ? "All" : stateLabel(f), href: hrefFor(p.slug, { tab: "evidence", state: f }) }))}
        />
        <p role="status" className="text-[13px] leading-5 text-steel">
          Showing {shown.length} of {p.evidence.length} evidence items
        </p>
      </section>
      {shown.length ? (
        <Tray>
          {shown.map((e) => (
            <Card as="article" key={e.id}>
              <div className="flex items-start gap-3">
                <h3 className="flex-1 font-display text-[16px] leading-6 font-medium text-ink">{e.title}</h3>
                <StateChip state={e.state} />
              </div>
              <p className="text-[15px] leading-6 text-ink">{e.summary}</p>
              {e.gap && (
                <div>
                  <Label>Still to check</Label>
                  <p className="mt-0.5 text-[15px] leading-6 text-ink">{e.gap}</p>
                </div>
              )}
              <SourceChips p={p} ids={e.sourceIds} />
            </Card>
          ))}
        </Tray>
      ) : (
        <Callout>No evidence items are {stateLabel(state as EvidenceState).toLowerCase()} for this position.</Callout>
      )}
      <div className="grid items-start gap-3 md:grid-cols-2">
        <Card>
          <h3 className="font-display text-[16px] leading-6 font-medium text-ink">Position scope</h3>
          <dl className="flex flex-col gap-2.5">
            {scope.map(([k, v]) => (
              <div key={k}>
                <dt><Label>{k}</Label></dt>
                <dd className={cn("text-ink", k === "Full token mint" ? "font-mono text-[13px] leading-5 break-all" : "text-[15px] leading-6")}>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[13px] leading-5 text-steel">{p.scopeAssumptions[0]}</p>
        </Card>
        <Card>
          <h3 className="font-display text-[16px] leading-6 font-medium text-ink">Your position note</h3>
          <PositionNote slug={p.slug} symbol={p.symbol} />
        </Card>
      </div>
    </div>
  );
}

/* ---------- Live updates ---------- */

export function UpdatesPanel({ p }: { p: Position }) {
  const x = extras[p.slug];
  const ghost = "inline-flex h-8 items-center rounded-full bg-st-missing-bg px-3 font-display text-[12px] font-bold text-st-missing opacity-70";
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>From Kurtosis · Live updates</Label>
        <h2 className="text-[26px] leading-8 tracking-[-0.02em] text-ink">Reported developments.</h2>
        <p className="text-[13px] leading-5 text-steel">Follow developments around {p.symbol} and the assets and protocols it depends on. Use them to track potential changes to the position’s risk profile.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled className={ghost} title="The provider identity could not be verified, so refresh is paused.">Refresh updates</button>
        <button type="button" disabled className={ghost} title="Automatic updates are already paused.">Pause automatic updates</button>
        <span className="ml-auto text-[13px] text-steel">Retrieved {UPDATES_RETRIEVED}</span>
      </div>
      <Callout className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex h-[22px] items-center rounded-full bg-st-conflicting-bg px-2 font-display text-[12px] font-bold text-st-conflicting">Unable to refresh</span>
        <span className="min-w-0 flex-1 text-[13px] leading-5 text-steel">Updates are paused because the provider identity could not be verified. Showing saved updates.</span>
      </Callout>
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="flex-1 text-[18px] leading-6 text-ink">Saved developments</h3>
          <span className="text-[13px] text-steel">{x.updates.length} updates · {x.updates.length} not marked seen</span>
        </div>
        <Tray>
          {x.updates.map((u) => (
            <Card as="article" key={u.headline}>
              <div className="flex flex-wrap items-center gap-2.5">
                <TagChip tag={u.tag} />
                <span className="text-[13px] text-steel">{u.kind} · analysis updated {u.at}</span>
              </div>
              <h4 className="font-display text-[16px] leading-6 font-medium text-ink">{u.headline}</h4>
              <p className="text-[13px] text-steel">{u.about}</p>
              <p className="text-[15px] leading-6 text-ink">{u.summary}</p>
              <div className="flex flex-wrap items-center gap-2">
                <ul className="flex flex-1 flex-wrap gap-1.5">
                  {u.sources.map((s) => (
                    <li key={s}><ExternalChip label={s} /></li>
                  ))}
                </ul>
                <span className="text-[13px] text-steel">Source &amp; update history{u.history ? ` · ${u.history}` : ""}</span>
              </div>
            </Card>
          ))}
        </Tray>
      </section>
      <Card>
        <h3 className="font-display text-[16px] leading-6 font-medium text-ink">Assets and protocols covered</h3>
        <p className="text-[13px] text-steel">{UPDATES_WINDOW}</p>
        <ul className="flex flex-col gap-2">
          {x.coverage.map((c) => (
            <li key={c.name} className="flex items-center gap-2 rounded-[10px] bg-panel p-3">
              <div className="flex-1">
                <Label>{c.kind}</Label>
                <p className="text-[15px] leading-6 font-medium text-ink">{c.name}</p>
              </div>
              <Pill>{c.count ? `${c.count} updates` : "No updates"}</Pill>
            </li>
          ))}
        </ul>
        {x.coverageNote && <p className="text-[13px] leading-5 text-steel">{x.coverageNote}</p>}
      </Card>
      <p className="text-[13px] leading-5 text-steel">Reported developments from Kurtosis. Coverage is checked at most once every five minutes while this page is visible. Refreshing updates does not change the dated assessment or rating status.</p>
    </div>
  );
}
