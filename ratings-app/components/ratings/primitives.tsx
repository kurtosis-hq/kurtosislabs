import Image from "next/image";
import {
  CircleCheck,
  CircleAlert,
  CircleDashed,
  CircleSlash,
  CircleDot,
  Clock,
  Eye,
  Flag,
  Info,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DISCLAIMER, MISSING_NOTE, SCENARIO_NOTE, icons, type EvidenceState, type Position } from "@/data/ratings";

/* ---------- Brand marks ---------- */

export function KMark({ className, fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="7 7 15 14" className={className} fill={fill} aria-hidden="true">
      <path d="M7 7.7C7 7.3134 7.3134 7 7.7 7H13.3C13.6866 7 14 7.3134 14 7.7V13.3589C14 13.5229 13.9425 13.6816 13.8374 13.8075L8.23742 20.5173C7.81808 21.0198 7 20.7233 7 20.0688V7.7Z" />
      <path d="M15 12.4574C15 13.0588 15.7083 13.3802 16.161 12.9842L21.5979 8.2268C22.0844 7.80117 21.7833 7 21.137 7H15.7C15.3134 7 15 7.3134 15 7.7V12.4574Z" />
      <path d="M15 14.6899C15 14.0663 15.754 13.754 16.195 14.195L21.805 19.805C22.246 20.246 21.9337 21 21.3101 21H15.7C15.3134 21 15 20.6866 15 20.3V14.6899Z" />
    </svg>
  );
}

export function RatingsIcon({ size = 62 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[16px] bg-navy"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 40 40" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round">
        <path d="M20 6 5 13l15 7 15-7Z" />
        <path d="M5 20l15 7 15-7" strokeOpacity=".6" />
        <path d="M5 27l15 7 15-7" strokeOpacity=".3" />
      </svg>
    </div>
  );
}

export function TokenIcon({ slug, size = 32 }: { slug: string; size?: number }) {
  return (
    <Image
      src={icons[slug]}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full"
      style={{ width: size, height: size }}
    />
  );
}

/* ---------- Navigation bar (brief 4.4) ---------- */

const NAV = ["Overview", "Compare", "Sources", "Methodology"];

export function NavBar({ current = "Overview" }: { current?: string }) {
  return (
    <div className="sticky top-6 z-40 flex justify-center px-4">
      <nav
        aria-label="Ratings"
        className="flex h-11 w-full max-w-[748px] items-center gap-4 rounded-[16px] bg-black pr-1.5 pl-2.5"
      >
        <a href="#" className="flex items-center gap-2.5 text-white">
          <span className="flex size-7 items-center justify-center rounded-[11%] bg-white">
            <KMark className="h-4 w-4" fill="#0B1A35" />
          </span>
          <span className="hidden text-[14px] font-medium tracking-[-0.02em] whitespace-nowrap lg:inline">
            Kurtosis <span className="text-white/70">/</span> Ratings
          </span>
        </a>
        <div className="ml-auto hidden items-center gap-10 text-[14px] md:flex">
          {NAV.map((l) => (
            <a
              key={l}
              href="#"
              aria-current={l === current ? "page" : undefined}
              className={l === current ? "text-white" : "text-white/70 hover:text-white"}
            >
              {l}
            </a>
          ))}
        </div>
        <a
          href="#"
          className="ml-auto flex h-8 items-center rounded-[10px] bg-white px-3 font-display text-[13px] font-bold whitespace-nowrap text-black md:ml-6"
          title="[CONFIRM] Button label"
        >
          [CONFIRM] CTA
        </a>
      </nav>
    </div>
  );
}

/* ---------- Status pill (brief 4.5) ---------- */

type PillKind = EvidenceState | "watchlist" | "review" | "context" | "unverified" | "matured" | "preview" | "unresolved";

const PILLS: Record<PillKind, { label: string; icon?: LucideIcon; cls: string }> = {
  supported: { label: "Supported", icon: CircleCheck, cls: "bg-st-supported-bg text-st-supported" },
  partial: { label: "Partial", icon: CircleDot, cls: "bg-st-partial-bg text-st-partial" },
  conflicting: { label: "Conflicting", icon: CircleAlert, cls: "bg-st-conflicting-bg text-st-conflicting" },
  missing: { label: "Missing", icon: CircleDashed, cls: "bg-st-missing-bg text-st-missing" },
  unavailable: { label: "Unavailable", icon: CircleSlash, cls: "bg-st-missing-bg text-st-missing" },
  stale: { label: "Stale", icon: Clock, cls: "bg-st-stale-bg text-st-stale" },
  na: { label: "N/A", cls: "bg-transparent text-steel px-0" },
  watchlist: { label: "Watchlist", icon: Eye, cls: "bg-st-partial-bg text-st-partial" },
  review: { label: "For review", icon: Flag, cls: "bg-st-partial-bg text-st-partial" },
  context: { label: "For context", icon: Info, cls: "bg-sky text-navy" },
  // No icon: removed from every "Unverified" pill in the Figma frames.
  unverified: { label: "Assumptions unverified", cls: "bg-st-missing-bg text-st-missing" },
  unresolved: { label: "Not yet supported", icon: CircleDashed, cls: "bg-st-missing-bg text-st-missing" },
  matured: { label: "Matured", icon: Clock, cls: "bg-panel text-ink" },
  preview: { label: "Research preview", icon: Info, cls: "bg-sky text-navy" },
};

export function StatusPill({ kind, label, className }: { kind: PillKind; label?: string; className?: string }) {
  const p = PILLS[kind];
  const Icon = p.icon;
  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center gap-1 rounded-full px-2 font-display text-[12px] leading-none font-bold whitespace-nowrap",
        p.cls,
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />}
      {label ?? p.label}
    </span>
  );
}

/* ---------- Grade cell (brief 4.6). Every grade on every page renders through here. ---------- */

export function GradeCell({
  p,
  size = 24,
  layout = "row",
  showLabels = true,
  part = "both",
}: {
  p: Position;
  size?: number;
  layout?: "row" | "stack";
  showLabels?: boolean;
  /* Tables split the two halves into separate columns; the evidence column always comes first. */
  part?: "both" | "evidence" | "scenario";
}) {
  const letter = { fontSize: size, lineHeight: 1.1 };
  return (
    <div className={cn("flex gap-x-6 gap-y-3", layout === "stack" ? "flex-col" : "flex-row flex-wrap items-start")}>
      {part !== "scenario" && (
      <div className="min-w-0">
        {showLabels && <div className="mb-1 text-[12px] leading-4 text-muted-foreground">Evidence rating</div>}
        <div className="font-display font-medium tracking-[-0.03em] text-ink" style={letter}>
          {p.evidenceRating}
        </div>
        <div className="mt-1 text-[12px] leading-4 text-muted-foreground">{p.confidence} confidence</div>
      </div>
      )}
      {part !== "evidence" && (
      <div className="min-w-0">
        {showLabels && <div className="mb-1 text-[12px] leading-4 text-muted-foreground">Scenario grade</div>}
        <div className="flex items-center gap-2">
          <span className="font-display font-medium tracking-[-0.03em] text-ink" style={letter}>
            {p.scenarioGrade}
          </span>
          <StatusPill kind="unverified" />
        </div>
      </div>
      )}
    </div>
  );
}

/* ---------- Footnotes ---------- */

export function ScenarioNote({ className }: { className?: string }) {
  return <p className={cn("text-[12px] leading-4 text-muted-foreground", className)}>{SCENARIO_NOTE}</p>;
}

export function Footnotes({ className }: { className?: string }) {
  return (
    <footer className={cn("space-y-2 border-t border-divider pt-6 text-[14px] leading-5 text-muted-foreground", className)}>
      <p>{SCENARIO_NOTE}</p>
      <p>{MISSING_NOTE}</p>
      <p className="text-ink">{DISCLAIMER}</p>
    </footer>
  );
}

/* ---------- Small pieces ---------- */

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("font-display text-[12px] leading-4 font-medium tracking-[0.2em] text-steel uppercase", className)}>
      {children}
    </div>
  );
}

export function Btn({
  children,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ink" | "outline" | "white";
  className?: string;
}) {
  const v = {
    primary: "bg-navy text-white",
    ink: "bg-ink text-white",
    outline: "bg-white text-ink border border-divider",
    white: "bg-white text-black",
  }[variant];
  return (
    <a href="#" className={cn("inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 font-display text-[14px] font-bold whitespace-nowrap", v, className)}>
      {children}
    </a>
  );
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[13px] tnum", className)}>{children}</span>;
}

export function layerName(p: Position) {
  return `${p.network} · ${p.protocol}`;
}
