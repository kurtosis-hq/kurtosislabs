import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { variants } from "@/components/site/variants";
import { Eyebrow, KMark } from "@/components/ratings/primitives";
import { DISCLAIMER } from "@/data/ratings";
import { cn } from "@/lib/utils";

export const metadata = { title: "Ratings redesign · ten styles" };

const PAGES = [
  ["Overview", ""],
  ["ONyc", "/positions/onyc"],
  ["Compare", "/compare"],
  ["Sources", "/sources"],
  ["Methodology", "/methodology"],
];

/* A small schematic of each style's surfaces, drawn from its own settings. */
function Thumb({ v }: { v: (typeof variants)[number] }) {
  const card = cn(
    "bg-white",
    v.card === "border" && "border border-divider",
    v.card === "shadow" && "shadow-[0_2px_8px_rgba(15,45,75,.12)]",
    v.card === "none" && "bg-transparent",
  );
  const r = { borderRadius: Math.max(3, v.radius / 4) };
  return (
    <div className={cn("relative h-36 overflow-hidden rounded-[14px] border border-divider p-3", v.page === "mist" ? "bg-mist" : "bg-white")}>
      {v.nav === "floating" ? (
        <div className="mx-auto mb-2 h-3 w-1/2 rounded-[4px] bg-black" />
      ) : (
        <div className={cn("-mx-3 -mt-3 mb-2 border-b border-divider bg-white", v.nav === "figma" ? "h-6" : "h-4")} />
      )}
      {v.header === "navy" && <div className="-mx-3 mb-1 h-8 bg-navy" />}
      <div className={cn("mb-1.5 h-2.5 w-2/5 rounded-full", v.header === "navy" ? "bg-white/0" : "bg-ink/80")} />
      {v.summary === "kv" ? (
        <div className="mb-2 flex h-5 items-center gap-2">
          {[0, 1, 2, 3].map((i) => <span key={i} className="h-3 w-8 border-l border-divider first:border-0" />)}
        </div>
      ) : v.summary === "trio" ? (
        <div className={cn("mb-2 grid grid-cols-3 gap-1", v.card === "flat" && "rounded-[6px] bg-panel p-1")}>
          {[0, 1, 2].map((i) => <div key={i} className={cn("h-6", card, v.card === "none" && "border-y border-divider")} style={r} />)}
        </div>
      ) : (
        <div className={cn("mb-2 h-5", card)} style={r} />
      )}
      <div className={cn("space-y-1 p-1.5", v.rowStyle === "cards" ? "" : card)} style={r}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("flex items-center gap-1", v.rowStyle === "cards" ? cn("rounded-[4px] bg-white px-1 py-1", v.rowCard === "border" && "border border-divider") : "border-b border-divider/70 pb-1 last:border-0")} style={{ height: v.rows === "compact" ? 8 : v.rows === "airy" ? 13 : 10 }}>
            <span className="size-1.5 rounded-full bg-mid" />
            <span className="h-1 w-6 rounded bg-ink/60" />
            <span className="ml-auto h-1 w-8 rounded bg-light" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Cards({ list }: { list: typeof variants }) {
  return (
    <ol className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {list.map((v) => {
        const n = variants.indexOf(v) + 1;
        return (
          <li key={v.id} className="flex flex-col rounded-[20px] border border-divider p-4">
            <Link href={`/v/${v.id}`} aria-label={`Open ${v.name}`}><Thumb v={v} /></Link>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-[13px] text-steel tnum">{String(n).padStart(2, "0")}</span>
              <h3 className="text-[20px] leading-6 tracking-[-0.02em]">{v.name}</h3>
            </div>
            <p className="mt-1 text-[14px] leading-5">{v.oneLine}</p>
            <p className="mt-2 text-[13px] leading-5 text-muted-foreground"><b className="font-display text-ink">Best for:</b> {v.bestFor}</p>
            <p className="mt-1 text-[13px] leading-5 text-muted-foreground"><b className="font-display text-ink">Brand fit:</b> {v.brandNote}</p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
              {PAGES.map(([l, h]) => (
                <Link key={l} href={`/v/${v.id}${h}`} className="inline-flex h-8 items-center rounded-[10px] bg-mist px-2.5 font-display text-[12px] font-bold text-ink hover:bg-sky">{l}</Link>
              ))}
            </div>
            <Link href={`/v/${v.id}`} className="mt-3 inline-flex items-center gap-1 font-display text-[14px] font-bold text-navy">Open this style <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </li>
        );
      })}
    </ol>
  );
}

export default function Gallery() {
  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-divider">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-2 px-4">
          <KMark className="h-5 w-5" fill="#172A42" />
          <span className="text-[15px] font-medium tracking-[-0.02em]">Kurtosis / Ratings · Redesign review</span>
          <Link href="/variations" className="ml-auto text-[13px] text-horizon hover:underline">Round 1 layouts</Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1240px] px-4 pt-14 pb-20">
        <Eyebrow>Ratings redesign</Eyebrow>
        <h1 className="mt-3 text-[40px] leading-[44px] tracking-[-0.045em]">Clean styles, each a full site.</h1>
        <p className="mt-3 max-w-[760px] text-[16px] leading-6 text-muted-foreground">
          Every style is a working copy of the Ratings site with its own Overview, position pages, Compare, Sources and Methodology. All use the same content from kurtosislabs.com/ratings, the brand colours and the grade display rule. On any page, open <b className="text-ink">Why it looks like this</b> in the dark strip at the top to read the reasoning.
        </p>

        <Link href="/ratings" className="mt-8 flex flex-wrap items-center gap-3 rounded-[16px] bg-navy px-5 py-4 text-white">
          <span className="font-display text-[15px] font-bold">Chosen design: Card Desk</span>
          <span className="text-[14px] text-white/80">Now the main site at /ratings. The styles below are kept for reference.</span>
          <ArrowRight className="ml-auto size-4" aria-hidden="true" />
        </Link>

        <section className="mt-12">
          <h2 className="text-[24px] leading-[30px] tracking-[-0.03em]">Round 3 · Compact Desk × Row Cards</h2>
          <p className="mt-1 max-w-[760px] text-[15px] leading-6 text-muted-foreground">
            Three ways to combine Compact Desk&apos;s density with Row Cards&apos; separate card per position. Outlined Desk and Figma Desk also borrow the Figma frames&apos; fact row and notice.
          </p>
          <Cards list={variants.filter((v) => v.round === "hybrid")} />
        </section>

        <section className="mt-16">
          <h2 className="text-[24px] leading-[30px] tracking-[-0.03em]">Round 2 · Ten Ondo-style sets</h2>
          <Cards list={variants.filter((v) => v.round === "r2")} />
        </section>
        <p className="mt-10 text-[14px] text-ink">{DISCLAIMER}</p>
      </div>
    </main>
  );
}
