// Building blocks for the position page, matching the Figma "Position tabs" frames:
// grey tray (r24, p12) holding white cards (r12, p24), the blue callout (r16) and 22 px pills.
import { ArrowRight, ArrowUpRight, CircleAlert, CircleDashed, CircleDot, CircleSlash, Clock, CircleCheck, Eye, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvidenceState, Position } from "@/data/ratings";

export function Tray({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex flex-col gap-2 rounded-[24px] bg-panel p-3", className)}>{children}</div>;
}

export function Card({ className, children, as: Tag = "div" }: { className?: string; children: React.ReactNode; as?: "div" | "article" | "li" }) {
  return <Tag className={cn("flex min-w-0 flex-col gap-2.5 rounded-[12px] bg-card-bg p-5 sm:p-6", className)}>{children}</Tag>;
}

export function Callout({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[16px] bg-sky px-4 py-3 text-[14px] leading-5", className)}>{children}</div>;
}

/* Grey inset box inside a card ("What needs to happen", "Evidence"). */
export function Inset({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 rounded-[10px] bg-panel p-3.5">
      <Label>{label}</Label>
      <p className="mt-1 text-[15px] leading-6 text-ink">{children}</p>
    </div>
  );
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("font-display text-[13px] leading-5 font-medium text-steel", className)}>{children}</div>;
}

export function SectionHead({ title, intro, as: Tag = "h2" }: { title: string; intro?: string; as?: "h2" | "h3" }) {
  return (
    <div className="space-y-2">
      <Tag className="text-[18px] leading-6 tracking-[-0.01em] text-ink">{title}</Tag>
      {intro && <p className="text-[13px] leading-5 text-steel">{intro}</p>}
    </div>
  );
}

/* Neutral pill: "Assumptions unverified", "Unverified", route inputs and outputs. */
export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex min-h-[22px] max-w-full items-center rounded-full bg-st-missing-bg px-2 py-[3px] font-display text-[12px] leading-4 font-bold text-st-missing", className)}>
      {children}
    </span>
  );
}

const STATES: Record<EvidenceState, { label: string; icon?: typeof CircleDot; cls: string }> = {
  supported: { label: "Complete", icon: CircleCheck, cls: "bg-st-supported-bg text-st-supported" },
  partial: { label: "Partial", icon: CircleDot, cls: "bg-st-partial-bg text-st-partial" },
  conflicting: { label: "Conflicting", icon: CircleAlert, cls: "bg-st-conflicting-bg text-st-conflicting" },
  missing: { label: "Missing", icon: CircleDashed, cls: "bg-st-missing-bg text-st-missing" },
  unavailable: { label: "Unavailable", icon: CircleSlash, cls: "bg-st-missing-bg text-st-missing" },
  stale: { label: "Stale", icon: Clock, cls: "bg-st-stale-bg text-st-stale" },
  na: { label: "N/A", cls: "bg-transparent text-steel" },
};

export function StateChip({ state, className }: { state: EvidenceState; className?: string }) {
  const s = STATES[state];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex h-[22px] shrink-0 items-center gap-1 rounded-full px-2 font-display text-[12px] leading-none font-bold whitespace-nowrap", s.cls, className)}>
      {Icon && <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />}
      {s.label}
    </span>
  );
}
export const stateLabel = (s: EvidenceState) => STATES[s].label;

export function TagChip({ tag }: { tag: "context" | "review" }) {
  return tag === "review" ? (
    <span className="inline-flex h-[22px] shrink-0 items-center gap-1 rounded-full bg-st-partial-bg px-2 font-display text-[12px] leading-none font-bold text-st-partial">
      <Flag className="size-3.5" aria-hidden="true" />For review
    </span>
  ) : (
    <Pill>For context</Pill>
  );
}

export function WatchChip() {
  return (
    <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-st-partial-bg px-2 font-display text-[12px] leading-none font-bold text-st-partial">
      <Eye className="size-3.5" aria-hidden="true" />Watchlist
    </span>
  );
}

export function MaturedChip() {
  return (
    <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-panel px-2 font-display text-[12px] leading-none font-bold text-ink">
      <Clock className="size-3.5" aria-hidden="true" />Matured
    </span>
  );
}

/* Source chips: each opens the dated source record on its publisher's site. */
export function SourceChips({ p, ids }: { p: Position; ids: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Sources">
      {ids.map((id) => {
        const s = p.sources.find((x) => x.id === id);
        const title = s?.title ?? id;
        const cls = "inline-flex min-h-[22px] max-w-full items-center gap-1 rounded-full bg-st-missing-bg px-2 py-[3px] font-display text-[12px] leading-4 font-bold text-st-missing";
        return (
          <li key={id} className="max-w-full">
            {s?.url ? (
              <a href={s.url} target="_blank" rel="noreferrer" className={cn(cls, "hover:bg-track hover:text-ink")} title={s.publisher ? `${s.publisher} · observed ${s.observed ?? "date unknown"}` : undefined}>
                {title}
                <ArrowRight className="size-3 shrink-0" aria-hidden="true" />
              </a>
            ) : (
              <span className={cls}>{title}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ExternalChip({ label }: { label: string }) {
  return (
    <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-st-missing-bg px-2 font-display text-[12px] leading-none font-bold text-st-missing">
      {label}
      <ArrowUpRight className="size-3" aria-hidden="true" />
    </span>
  );
}
