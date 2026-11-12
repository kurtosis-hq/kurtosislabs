// Server-rendered building blocks shared by the five page templates.
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { DISCLAIMER, MISSING_NOTE, SCENARIO_NOTE, positions, updates, RUBRIC, RUBRIC_DATE, type Position } from "@/data/ratings";
import { Mono, StatusPill, TokenIcon, layerName } from "@/components/ratings/primitives";
import { Container, CountBadge, Group, Surface } from "./ui";
import type { Variant } from "./variants";

export function RubricPill({ dark }: { dark?: boolean }) {
  return (
    <span className={cn("inline-flex h-[22px] items-center rounded-full px-2 text-[12px]", dark ? "bg-white/10 text-white" : "bg-mist text-ink")}>
      Rubric <Mono className="mx-1 text-[12px]">{RUBRIC}</Mono> · {RUBRIC_DATE}
    </span>
  );
}

export function SiteFooter({ extra }: { extra?: React.ReactNode }) {
  return (
    <Container className="mt-12 pb-16">
      <footer className="space-y-2 border-t border-divider pt-6 text-[13px] leading-5 text-muted-foreground">
        {extra}
        <p className="text-ink">{DISCLAIMER}</p>
        <p>Kurtosis Ratings · Research preview · Content from kurtosislabs.com/ratings, retrieved 04 Nov 2026.</p>
      </footer>
    </Container>
  );
}

export function OverviewNotes() {
  return (
    <>
      <p>{SCENARIO_NOTE}</p>
      <p>{MISSING_NOTE}</p>
    </>
  );
}

/* ---------- Overview summary: three Ondo cards, or one stat strip ---------- */

function Row({ p, right }: { p: Position; right: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 border-t border-divider py-3 first:border-0 first:pt-0">
      <TokenIcon slug={p.slug} size={32} />
      <div className="min-w-0 flex-1">
        <div className="font-display text-[15px] font-bold">{p.symbol}</div>
        <div className="truncate text-[12px] text-muted-foreground">{layerName(p)}</div>
      </div>
      <div className="shrink-0 text-right text-[13px]">{right}</div>
    </li>
  );
}

export function Summary({ v }: { v: Variant }) {
  const onyc = positions[0];
  const susdai = positions.find((p) => p.watchlist)!;
  const byGaps = [...positions].sort((a, b) => b.counts.conflicting + b.counts.missing - (a.counts.conflicting + a.counts.missing));

  if (v.summary === "kv") {
    // The Figma frames' fact row: label over value, hairline dividers, no card.
    const facts: [string, React.ReactNode][] = [
      ["Rubric", <Mono key="r" className="text-[13px]">{RUBRIC}</Mono>],
      ["Rubric date", RUBRIC_DATE],
      ["Networks", "Solana · Arbitrum One"],
      ["Covered positions", "4"],
      ["Evidence ratings", "NR for all 4"],
      ["Status", <span key="s" className="text-st-conflicting">Not approved</span>],
    ];
    return (
      <dl className="flex flex-wrap gap-y-3">
        {facts.map(([k, val], i) => (
          <div key={k} className={cn("pr-6", i > 0 && "border-l border-divider pl-6")}>
            <dt className="text-[12px] text-muted-foreground">{k}</dt>
            <dd className="mt-0.5 text-[14px] font-medium text-ink tnum">{val}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (v.summary === "kpis") {
    const cells: [string, React.ReactNode][] = [
      ["Positions covered", "4"],
      ["Evidence ratings", "NR for all 4"],
      ["On watchlist", <span key="w" className="flex items-center gap-2">1 <StatusPill kind="watchlist" label="PT-sUSDai" /></span>],
      ["Unseen updates", `${updates.length}`],
      ["Dated sources", "71"],
    ];
    return (
      <Surface pad={false} className="grid grid-cols-2 overflow-hidden md:grid-cols-5">
        {cells.map(([k, val], i) => (
          <div key={k} className={cn("px-5 py-4", i > 0 && "md:border-l border-divider")}>
            <div className="text-[12px] text-muted-foreground">{k}</div>
            <div className="mt-1 font-display text-[18px] leading-6 font-medium tracking-[-0.02em] tnum">{val}</div>
          </div>
        ))}
      </Surface>
    );
  }

  const cards = [
    {
      title: "Needs attention",
      count: 2,
      rows: [
        <Row key="a" p={susdai} right={<StatusPill kind="watchlist" />} />,
        <Row key="b" p={onyc} right={<span className="font-display font-bold">{updates.length} new updates</span>} />,
      ],
    },
    {
      title: "Latest updates",
      count: updates.length,
      rows: updates.map((u) => (
        <Row key={u.headline} p={onyc} right={<span className="flex items-center gap-2"><span className="text-muted-foreground tnum">{u.rel}</span><StatusPill kind={u.tag} /></span>} />
      )),
    },
    {
      title: "Evidence gaps",
      count: 4,
      rows: byGaps.slice(0, 3).map((p) => (
        <Row key={p.slug} p={p} right={<span className="tnum">{p.counts.conflicting} conflicting · {p.counts.missing} missing</span>} />
      )),
    },
  ];
  const hair = v.card === "none";
  return (
    <Group className={cn("grid gap-3 md:grid-cols-3", hair && "gap-0 md:divide-x divide-divider border-y border-divider py-5")}>
      {cards.map((c) => (
        <Surface key={c.title} className={cn(hair && "md:px-6 md:first:pl-0 md:last:pr-0")}>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-[16px] leading-5">{c.title}</h2>
            <CountBadge>{c.count}</CountBadge>
          </div>
          <ul>{c.rows}</ul>
        </Surface>
      ))}
    </Group>
  );
}

/* ---------- The Figma frames' "No approved grades yet" notice ---------- */

export function GradesNotice() {
  return (
    <div className="flex gap-3 rounded-[var(--card-r)] bg-mist px-5 py-4 text-[14px] leading-5">
      <Info className="mt-0.5 size-4 shrink-0 text-horizon" aria-hidden="true" />
      <p>
        <b className="font-display text-ink">No approved grades yet.</b>{" "}
        <span className="text-muted-foreground">
          All four positions are NR: there is not enough evidence yet to grade them. Scenario grades show how a position would rate if its key assumptions were verified. They are not current ratings.
        </span>
      </p>
    </div>
  );
}

/* ---------- Accordion built on <details> (works without JavaScript) ---------- */

export function Accordion({
  title,
  meta,
  open,
  children,
  id,
}: {
  title: string;
  meta?: string;
  open?: boolean;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <details id={id} open={open} className="group scroll-mt-36 rounded-[var(--card-r)] border-[length:var(--card-bw)] border-divider bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] [&:not([open])]:hover:bg-mist">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-[var(--card-pad)] py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex size-6 items-center justify-center rounded-full bg-mist text-navy transition-transform group-open:rotate-90" aria-hidden="true">›</span>
        <span className="font-display text-[17px] font-medium">{title}</span>
        {meta && <span className="text-[13px] text-muted-foreground">{meta}</span>}
      </summary>
      <div className="px-[var(--card-pad)] pb-6">{children}</div>
    </details>
  );
}
