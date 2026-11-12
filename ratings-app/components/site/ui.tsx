import { cn } from "@/lib/utils";
import type { Variant } from "./variants";

/* A card in the current variant's surface style (border, shadow, flat or none). */
export function Surface({
  className,
  children,
  pad = true,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  pad?: boolean;
  as?: "div" | "section" | "aside";
}) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--card-r)] border-[length:var(--card-bw)] border-divider bg-[var(--card-bg)] [box-shadow:var(--card-shadow)]",
        pad && "p-[var(--card-pad)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* The pale navy Panel that groups cards; transparent in variants that do not use it. */
export function Group({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[var(--panel-r)] bg-[var(--group-bg)] p-[var(--group-pad)]", className)}>{children}</div>;
}

export function PageHeader({
  v,
  title,
  sub,
  right,
  children,
}: {
  v: Variant;
  title: string;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const navy = v.header === "navy";
  return (
    <header
      className={cn("px-4", navy ? "bg-navy pt-24 pb-28 text-white" : "pt-14 pb-8", v.nav === "floating" && !navy && "pt-24")}
      style={v.header === "wash" ? { background: "var(--wash)" } : undefined}
    >
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-end gap-x-8 gap-y-4">
        <div className="min-w-[min(100%,520px)] flex-1">
          <h1
            className={cn("tracking-[-0.045em]", navy ? "text-white" : "text-ink")}
            style={{ fontSize: v.titleSize, lineHeight: 1.1 }}
          >
            {title}
          </h1>
          {sub && <p className={cn("mt-2 max-w-[720px] text-[16px] leading-6", navy ? "text-white/80" : "text-muted-foreground")}>{sub}</p>}
        </div>
        {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
      </div>
      {children && <div className="mx-auto mt-6 max-w-[1240px]">{children}</div>}
    </header>
  );
}

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1240px] px-4", className)}>{children}</div>;
}

export function Chip({ v, active, children }: { v: Variant; active?: boolean; children: React.ReactNode }) {
  const base = "inline-flex h-8 items-center gap-1.5 whitespace-nowrap font-display text-[13px] font-bold";
  const styles = {
    filled: active ? "rounded-[10px] bg-panel px-3 text-ink" : "rounded-[10px] px-3 text-steel hover:bg-mist",
    outline: active ? "rounded-full border border-navy bg-navy px-3 text-white" : "rounded-full border border-divider bg-white px-3 text-ink hover:bg-mist",
    segmented: active ? "rounded-[8px] bg-white px-3 text-navy shadow-sm" : "rounded-[8px] px-3 text-steel",
    text: active ? "border-b-2 border-navy px-0.5 text-navy" : "border-b-2 border-transparent px-0.5 text-steel hover:text-ink",
  }[v.chips];
  return <span className={cn(base, styles)}>{children}</span>;
}

export function CountBadge({ children, inverted }: { children: React.ReactNode; inverted?: boolean }) {
  return (
    <span className={cn("rounded-full px-1.5 text-[11px] leading-[18px] font-bold tnum", inverted ? "bg-white text-navy" : "bg-panel text-ink")}>
      {children}
    </span>
  );
}
