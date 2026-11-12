// Shared layout for the /ratings pages, measured from the Figma "Position tabs" page
// (frames "Ratings / Overview — Desktop", "Ratings / Compare — Desktop", Sources and Methodology).
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DISCLAIMER, RUBRIC, RUBRIC_DATE } from "@/data/ratings";

/* 1240 px column with 16 px gutters (content 1208 px wide). */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1240px] px-4", className)}>{children}</div>;
}

/* Page header: 96 px top, 32 px bottom; title 36/39.6 Plus Jakarta Medium, -1.62 tracking. */
/* width: 1240 for most pages; Overview's header container is 1198 in Figma. */
export function PageHeader({ title, sub, right, below, width = 1240 }: { title: string; sub?: React.ReactNode; right?: React.ReactNode; below?: React.ReactNode; width?: 1240 | 1198 }) {
  return (
    <header className="px-4 pt-16 pb-8 sm:pt-24">
      <div className={cn("mx-auto flex flex-wrap items-end gap-x-8 gap-y-4", width === 1198 ? "max-w-[1198px]" : "max-w-[1240px]")}>
        <div className="min-w-[min(100%,520px)] flex-1">
          <h1 className="text-[30px] leading-[34px] tracking-[-0.045em] text-ink sm:text-[36px] sm:leading-[39.6px]">{title}</h1>
          {sub && <p className={cn("pt-2 text-[16px] leading-6 text-steel", width === 1198 ? "max-w-[560px]" : "max-w-[720px]")}>{sub}</p>}
        </div>
        {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
      </div>
      {below && <div className="mx-auto mt-6 max-w-[1240px]">{below}</div>}
    </header>
  );
}

export function RubricPill() {
  return (
    <span className="inline-flex h-[22px] items-center rounded-full bg-mist px-2 text-[12px] text-ink">
      Rubric <span className="px-1 font-mono">{RUBRIC}</span> · {RUBRIC_DATE}
    </span>
  );
}

/* Footnotes block: 48 px above, hairline, 24 px, 13/20 lines 8 px apart, 64 px below. */
export function Notes({ lines }: { lines: string[] }) {
  return (
    <Container className="pt-12 pb-16">
      <footer className="space-y-2 border-t border-divider pt-6 text-[13px] leading-5 text-steel">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
        <p className="text-ink">{DISCLAIMER}</p>
        <p>Kurtosis Ratings · Research preview · Content from kurtosislabs.com/ratings, retrieved 04 Nov 2026.</p>
      </footer>
    </Container>
  );
}

/* Accordion: chevron in a 20 px circle, 18 px title, 13 px meta in Horizon.
   Collapsed it is a white card (r12, 56 px tall); open it either keeps the card ("card") or sits on the page. */
export function Accordion({
  id,
  title,
  meta,
  open,
  card = true,
  children,
}: {
  id?: string;
  title: string;
  meta?: string;
  open?: boolean;
  card?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details id={id} open={open} className={cn("group scroll-mt-28 rounded-[12px]", card ? "bg-card-bg" : "open:bg-transparent bg-card-bg")}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-6 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-mist text-ink">
          <ChevronRight className="size-3 group-open:hidden" aria-hidden="true" />
          <ChevronDown className="hidden size-3 group-open:block" aria-hidden="true" />
        </span>
        <span className="font-display text-[18px] leading-6 font-medium tracking-[-0.01em] text-ink">{title}</span>
        {meta && <span className="text-[13px] leading-5 text-horizon">{meta}</span>}
      </summary>
      <div className={cn("pb-6", card ? "px-6" : "px-0 sm:px-6")}>{children}</div>
    </details>
  );
}
