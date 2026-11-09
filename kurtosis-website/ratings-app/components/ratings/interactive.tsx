"use client";

import { useState } from "react";
import { ArrowRight, Copy, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { gateLabels, sourceById, updates, type Position } from "@/data/ratings";
import { Mono, StatusPill } from "./primitives";

/* ---------- Four evidence-gate dots, each with a tooltip ---------- */

export function GateDots({
  p,
  withLabels = false,
  inert = false,
}: {
  p: Position;
  withLabels?: boolean;
  /* Inside a link or button, render plain dots (no nested interactive tooltip trigger). */
  inert?: boolean;
}) {
  if (inert)
    return (
      <span className={cn("flex", withLabels ? "flex-col gap-1.5" : "items-center gap-1.5")}>
        {p.gates.map((g) => (
          <span key={g.id} className="flex items-center gap-2" title={`${gateLabels[g.id]}: not yet supported`}>
            <span className="size-2.5 rounded-full border-[1.5px] border-dashed border-st-missing bg-white" />
            {withLabels ? <span className="text-[13px] text-ink">{gateLabels[g.id]}</span> : <span className="sr-only">{gateLabels[g.id]}: not yet supported</span>}
          </span>
        ))}
      </span>
    );
  return (
    <div className={cn("flex", withLabels ? "flex-col gap-1.5" : "items-center gap-1.5")}>
      {p.gates.map((g) => (
        <Tooltip key={g.id}>
          <TooltipTrigger
            className="flex items-center gap-2 text-left"
            aria-label={`${gateLabels[g.id]}: not yet supported`}
          >
            <span className="size-2.5 rounded-full border-[1.5px] border-dashed border-st-missing bg-white" />
            {withLabels && <span className="text-[13px] text-ink">{gateLabels[g.id]}</span>}
          </TooltipTrigger>
          <TooltipContent className="max-w-72 bg-ink text-[12px] leading-4 text-white">
            <span>
              <b className="font-display">{gateLabels[g.id]}: not yet supported.</b> {g.finding}
            </span>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

/* ---------- "3 sources" chip that opens a popover ---------- */

export function SourcesChip({ p, ids }: { p: Position; ids: string[] }) {
  if (!ids.length) return null;
  return (
    <Popover>
      <PopoverTrigger className="inline-flex h-[22px] items-center gap-1 rounded-full border border-divider bg-white px-2 font-display text-[12px] font-bold text-ink hover:bg-sky">
        <FileText className="size-3.5 text-horizon" aria-hidden="true" />
        {ids.length} {ids.length === 1 ? "source" : "sources"}
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-[16px] border-divider p-3">
        <ul className="space-y-2.5">
          {ids.map((id) => {
            const s = sourceById(p, id);
            return (
              <li key={id} className="grid grid-cols-[64px_1fr] gap-2 text-[13px] leading-[18px]">
                <Mono className="text-[12px] text-steel">{id}</Mono>
                <span>
                  <span className="block text-ink">{s?.title ?? "[CONFIRM] source title"}</span>
                  <span className="text-[12px] text-muted-foreground">
                    {s?.publisher} · Observed {s?.observed}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/* ---------- Clamp long text with "Show more" ---------- */

export function Clamp({ text, lines = 2, className }: { text: string; lines?: number; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={className}>
      <p className={cn(!open && (lines === 2 ? "line-clamp-2" : "line-clamp-3"))}>{text}</p>
      <button onClick={() => setOpen(!open)} className="mt-1 text-[13px] text-horizon hover:underline">
        {open ? "Show less" : "Show more"}
      </button>
    </div>
  );
}

/* ---------- Position tabs: shared content for every variation ---------- */

const TABS = ["Why this grade", "Dependencies", "Exit routes", "Risk factors", "Evidence", "Live updates"] as const;
type Tab = (typeof TABS)[number];

export function PositionTabs({
  p,
  style = "underline",
  initial = "Why this grade",
}: {
  p: Position;
  style?: "underline" | "pill" | "segmented";
  initial?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initial);
  const unread = updates.filter((u) => u.position === p.slug && !u.seen).length;
  return (
    <div>
      <div
        role="tablist"
        className={cn(
          "flex gap-1 overflow-x-auto",
          style === "underline" && "border-b border-divider",
          style === "segmented" && "rounded-[14px] bg-panel p-1",
        )}
      >
        {TABS.map((t) => {
          const on = t === tab;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 font-display text-[14px] font-bold whitespace-nowrap",
                style === "underline" && cn("-mb-px border-b-2 px-3 py-3", on ? "border-navy text-navy" : "border-transparent text-steel hover:text-ink"),
                style === "pill" && cn("h-9 rounded-full px-4", on ? "bg-navy text-white" : "text-steel hover:bg-sky"),
                style === "segmented" && cn("h-9 flex-1 rounded-[10px] px-3", on ? "bg-white text-navy shadow-sm" : "text-steel"),
              )}
            >
              {t}
              {t === "Live updates" && unread > 0 && (
                <span className={cn("rounded-full px-1.5 text-[11px] leading-[18px]", on && style === "pill" ? "bg-white text-navy" : "bg-navy text-white")}>
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="pt-6">
        {tab === "Why this grade" && <WhyTab p={p} />}
        {tab === "Dependencies" && <DependenciesTab p={p} />}
        {tab === "Exit routes" && <ExitTab p={p} />}
        {tab === "Risk factors" && <RisksTab p={p} />}
        {tab === "Evidence" && <EvidenceTab p={p} />}
        {tab === "Live updates" && <UpdatesTab p={p} />}
      </div>
    </div>
  );
}

// Reads the site variant's surface variables when present; falls back to the brand card.
const card =
  "rounded-[var(--card-r,28px)] border-[length:var(--card-bw,0px)] border-divider bg-white p-6 [box-shadow:var(--card-shadow,none)]";
const label = "text-[12px] leading-4 text-muted-foreground";

function WhyTab({ p }: { p: Position }) {
  const cells = [
    ["Scenario assumption", p.scenarioSummary],
    ["Documented risk", p.actualRisk],
    ["Supporting observations", p.positiveEvidence],
    ["Still unknown", p.missingEvidence],
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-[var(--panel-r,42px)] bg-[var(--group-bg,#e3e9f0)] p-[var(--group-pad,12px)] md:grid-cols-2">
        {cells.map(([h, b]) => (
          <div key={h} className={card}>
            <h4 className="mb-2 text-[18px] leading-6 tracking-[-0.01em]">{h}</h4>
            <p className="text-[15px] leading-6 text-ink">{b}</p>
          </div>
        ))}
      </div>
      <div className={card}>
        <h4 className="mb-3 text-[18px] leading-6">Assumptions needed for {p.scenarioGrade}</h4>
        <ol className="space-y-3">
          {p.scenarioAssumptions.map((a, i) => (
            <li key={i} className="grid grid-cols-[28px_1fr_auto] items-start gap-3 text-[15px] leading-6">
              <span className="font-display font-medium text-steel tnum">{String(i + 1).padStart(2, "0")}</span>
              <span>{a}</span>
              <StatusPill kind="unverified" label="Unverified" />
            </li>
          ))}
        </ol>
      </div>
      {p.previousGrade && (
        <p className="rounded-[16px] bg-sky px-4 py-3 text-[14px] leading-5 text-ink">
          <b className="font-display">Methodology correction.</b> {p.changeReason}
        </p>
      )}
    </div>
  );
}

function DependenciesTab({ p }: { p: Position }) {
  const [sel, setSel] = useState(p.layers[0]?.id);
  const l = p.layers.find((x) => x.id === sel) ?? p.layers[0];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className={card}>
        <h4 className="text-[18px] leading-6">What your position depends on</h4>
        <p className="mt-1 mb-4 text-[14px] leading-5 text-muted-foreground">Select a layer to see the risk and its sources.</p>
        <ol className="space-y-2">
          {p.layers.map((x, i) => (
            <li key={x.id}>
              <button
                onClick={() => setSel(x.id)}
                className={cn(
                  "grid w-full grid-cols-[28px_1fr] gap-2 rounded-[14px] border px-3 py-2.5 text-left",
                  x.id === sel ? "border-2 border-navy" : "border-divider hover:bg-mist",
                )}
                style={{ marginLeft: Math.min(i, 3) * 12, width: `calc(100% - ${Math.min(i, 3) * 12}px)` }}
              >
                <span className="pt-0.5 font-display text-[13px] text-steel tnum">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-display text-[15px] font-medium text-ink">{x.title}</span>
                  <span className="block text-[13px] text-muted-foreground">{x.subtitle}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      {l && (
        <div className={card}>
          <div className={label}>{l.role === "held" ? "Position held" : "Dependency"}</div>
          <h4 className="mt-1 text-[24px] leading-[30px] tracking-[-0.03em]">{l.title}</h4>
          <p className="mt-3 text-[15px] leading-6">{l.description}</p>
          <div className={cn(label, "mt-5")}>What this means for your position</div>
          <p className="mt-1 text-[15px] leading-6">{l.risk}</p>
          <div className={cn(label, "mt-5 mb-2")}>Evidence</div>
          <SourcesChip p={p} ids={[...new Set(l.sourceIds)]} />
        </div>
      )}
    </div>
  );
}

function ExitTab({ p }: { p: Position }) {
  const [rid, setRid] = useState(p.routes[1]?.id ?? p.routes[0]?.id);
  const r = p.routes.find((x) => x.id === rid) ?? p.routes[0];
  return (
    <div className={card}>
      <div role="radiogroup" aria-label="Exit route" className="flex flex-wrap gap-1 rounded-[12px] bg-panel p-1">
        {p.routes.map((x) => (
          <button
            key={x.id}
            role="radio"
            aria-checked={x.id === rid}
            onClick={() => setRid(x.id)}
            className={cn("h-9 flex-1 rounded-[10px] px-3 font-display text-[14px] font-bold whitespace-nowrap", x.id === rid ? "bg-navy text-white" : "text-steel")}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div className="mt-4 border-l-[3px] border-navy bg-sky px-4 py-3">
        <div className={label}>Indicative route</div>
        <p className="font-display text-[15px] font-medium">{r.summary}</p>
      </div>
      <ol className="mt-2 divide-y divide-divider">
        {r.steps.map((s, i) => (
          <li key={i} className="grid grid-cols-[32px_1fr] gap-3 py-5">
            <span className="font-display text-[14px] text-steel tnum">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h5 className="font-display text-[16px] font-medium">{s.title}</h5>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="rounded-[8px] bg-mist px-2 py-1">{s.input}</span>
                <ArrowRight className="size-4 text-horizon" aria-hidden="true" />
                <span className="rounded-[8px] bg-mist px-2 py-1">{s.output}</span>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <div className={label}>What needs to happen</div>
                  <p className="text-[14px] leading-5">{s.condition}</p>
                </div>
                <div>
                  <div className={label}>What could go wrong</div>
                  <p className="text-[14px] leading-5">{s.risk}</p>
                </div>
              </div>
              <div className="mt-3">
                <SourcesChip p={p} ids={s.sourceIds} />
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="rounded-[14px] bg-mist px-4 py-3 text-[13px] leading-5 text-muted-foreground">
        Indicative route map. No transaction was simulated or submitted.
      </p>
    </div>
  );
}

function RisksTab({ p }: { p: Position }) {
  const [all, setAll] = useState(false);
  const list = all ? p.factors : p.factors.slice(0, 3);
  return (
    <div className="space-y-4">
      <div className={card}>
        <ol className="divide-y divide-divider">
          {list.map((f, i) => (
            <li key={f.id} id={`risk-${f.id}`} className="grid gap-4 py-5 first:pt-0 md:grid-cols-[1.1fr_1fr_1fr_auto]">
              <div>
                <span className="font-display text-[13px] text-steel tnum">{String(i + 1).padStart(2, "0")}</span>
                <h5 className="font-display text-[16px] leading-6 font-medium">{f.title}</h5>
                {f.implication && <p className="mt-1 text-[14px] leading-5 text-muted-foreground">{f.implication}</p>}
              </div>
              <div>
                <div className={label}>Evidence</div>
                <p className="text-[14px] leading-5">{f.detail}</p>
              </div>
              <div>
                <div className={label}>Still needs checking</div>
                <p className="text-[14px] leading-5">{f.check ?? "[CONFIRM]"}</p>
              </div>
              <div className="flex flex-row items-start gap-2 md:flex-col md:items-end">
                <StatusPill kind={f.state} />
                <SourcesChip p={p} ids={f.sourceIds} />
              </div>
            </li>
          ))}
        </ol>
        {p.factors.length > 3 && (
          <button onClick={() => setAll(!all)} className="mt-2 h-9 rounded-[10px] border border-divider px-3.5 font-display text-[14px] font-bold">
            {all ? "Show fewer" : `Show all ${p.factors.length} factors`}
          </button>
        )}
      </div>
      <div className="border-l-[3px] border-navy bg-white px-6 py-5">
        <div className={label}>Before you commit</div>
        <h4 className="mt-1 text-[24px] leading-[30px] tracking-[-0.03em]">{p.beforeCommit.title}</h4>
        <p className="mt-2 text-[15px] leading-6">{p.beforeCommit.detail}</p>
      </div>
    </div>
  );
}

function EvidenceTab({ p }: { p: Position }) {
  const [open, setOpen] = useState<string | null>(p.evidence[0]?.id ?? null);
  // The Evidence tab only mounts after a click, so reading storage here never runs on the server.
  const [note, setNote] = useState(() => {
    try {
      return window.localStorage.getItem(`kurtosis-note-${p.slug}`) ?? "";
    } catch {
      return "";
    }
  });
  const [saved, setSaved] = useState("");
  const save = () => {
    try {
      window.localStorage.setItem(`kurtosis-note-${p.slug}`, note);
      setSaved("Saved in this browser only.");
    } catch {
      setSaved("This browser blocked saving. Copy your note to keep it.");
    }
  };
  return (
    <div className="space-y-4">
      <div className={cn(card, "flex flex-wrap items-center gap-3")}>
        <h4 className="text-[18px] leading-6">Validation status</h4>
        <StatusPill kind="partial" label="Further review needed" />
        <span className="text-[14px] text-muted-foreground">Reviewed {p.asOf}. Needs: {p.approvalsNeeded.join(", ").toLowerCase()}.</span>
      </div>
      <div className={card}>
        <ul className="divide-y divide-divider">
          {p.evidence.map((e) => (
            <li key={e.id}>
              <button onClick={() => setOpen(open === e.id ? null : e.id)} aria-expanded={open === e.id} className="flex w-full items-center justify-between gap-3 py-3.5 text-left">
                <span className="font-display text-[15px] font-medium">{e.title}</span>
                <StatusPill kind={e.state} />
              </button>
              {open === e.id && (
                <div className="space-y-3 pb-4 text-[14px] leading-5">
                  <p>{e.summary}</p>
                  {e.gap && (
                    <div className="rounded-[14px] bg-mist px-4 py-3">
                      <div className={label}>Still needs checking</div>
                      <p>{e.gap}</p>
                    </div>
                  )}
                  <SourcesChip p={p} ids={e.sourceIds} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className={card}>
        <h4 className="text-[18px] leading-6">Position scope</h4>
        <dl className="mt-3 divide-y divide-divider text-[14px] leading-5">
          {[
            ["Token mint", <span key="m" className="flex flex-wrap items-center gap-2"><Mono className="break-all">{p.mint}</Mono><button onClick={() => navigator.clipboard?.writeText(p.mint)} className="inline-flex items-center gap-1 text-horizon"><Copy className="size-3.5" aria-hidden="true" />Copy</button></span>],
            ["Series maturity", p.maturity ? <Mono key="d">{p.maturity}</Mono> : "No contractual PT (principal token) maturity"],
            ["Category / loss assessed", `${p.lane} / ${p.lossObject}`],
            ["Evidence retrieved", <Mono key="e">{p.evidenceDate}</Mono>],
          ].map(([k, v]) => (
            <div key={String(k)} className="grid gap-1 py-2.5 md:grid-cols-[200px_1fr]">
              <dt className="text-muted-foreground">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={card}>
        <h4 className="text-[18px] leading-6">Your position note</h4>
        <p className="mt-1 text-[13px] text-muted-foreground">Saved only in this browser. Notes are never sent to Kurtosis.</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={5000}
          rows={4}
          placeholder="What needs to be resolved before you invest?"
          className="mt-3 w-full rounded-[10px] border border-divider bg-white p-3 text-[14px] outline-none focus:ring-2 focus:ring-horizon"
        />
        <div className="mt-2 flex items-center justify-between">
          <output className="text-[13px] text-muted-foreground" aria-live="polite">{saved}</output>
          <button onClick={save} className="h-9 rounded-[10px] bg-navy px-3.5 font-display text-[14px] font-bold text-white">Save note</button>
        </div>
      </div>
    </div>
  );
}

function UpdatesTab({ p }: { p: Position }) {
  const list = updates.filter((u) => u.position === p.slug);
  const [seen, setSeen] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-[16px] bg-white px-4 py-3">
        <StatusPill kind="partial" label="Unable to refresh" />
        <span className="text-[13px] text-muted-foreground tnum">Retrieved 30 Oct, 03:58 UTC · Next check after 02 Nov, 23:40 UTC</span>
        <button className="ml-auto h-8 rounded-[10px] border border-divider px-3 font-display text-[13px] font-bold">Refresh</button>
      </div>
      <div className={card}>
        {list.length === 0 && <p className="text-[14px] text-muted-foreground">No saved developments for this position. [CONFIRM] the feed once the provider is verified.</p>}
        <ol className="relative space-y-6">
          {list.map((u, i) => (
            <li key={i} className="grid grid-cols-[36px_14px_1fr] gap-3">
              <span className="pt-0.5 text-right text-[13px] text-muted-foreground tnum" title={u.at}>{u.rel}</span>
              <span className={cn("mt-1.5 size-2.5 rounded-full border-2 border-navy", !seen && "bg-navy")} aria-label={seen ? "Seen" : "Not seen"} />
              <div>
                <StatusPill kind={u.tag} />
                <h5 className="mt-2 font-display text-[15px] leading-5 font-bold">{u.headline}</h5>
                <Clamp text={u.summary} className="mt-1 text-[14px] leading-5" />
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex h-[22px] items-center rounded-full bg-panel px-2 text-[12px]">{u.about}</span>
                  <span className="inline-flex h-[22px] items-center rounded-full border border-divider px-2 font-display text-[12px] font-bold">{u.sources.length} sources</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
        {list.length > 0 && (
          <button onClick={() => setSeen(true)} className="mt-6 text-[14px] text-horizon hover:underline">Mark all seen</button>
        )}
      </div>
      <p className="text-[13px] text-muted-foreground">Updates prompt review and never change a grade automatically.</p>
    </div>
  );
}
