"use client";
// Sources, built to the Figma frame "Container" (Sources) on the Position tabs page:
// 52 px white row cards 8 px apart, edge to edge in the 1240 px column, numbered pagination, report cards in a tray.
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { library, sourceGroups, type LibrarySource } from "@/data/ratings";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Container, Notes } from "./kit";

const PER = 10;
const LIVE = "https://www.kurtosislabs.com/ratings-data";
// The live site's per-position report files. [CONFIRM] which downloads the final page should offer.
const REPORTS = [
  ["Real-world asset", "ONyc assessment report", "Claims, reserves, asset valuations, controls and the route to cash.", `${LIVE}/briefs/onyc.txt`],
  ["Principal token", "PT-ONyc assessment report", "Matured PT settlement, inherited ONyc exposure and the cash exit.", `${LIVE}/briefs/pt-onyc.txt`],
  ["Principal token", "PT-srONyc assessment report", "Senior loss allocation, withdrawal locks and recovery.", `${LIVE}/briefs/pt-sronyc.txt`],
  ["Investor report", "PT-sUSDai assessment", "Full investor edition, 23 Oct 2026. Investment evidence cutoff: 22 Oct 2026.", `${LIVE}/documents/pt-susdai.md`],
];
const COLS = "grid-cols-[135px_348px_196px_213px_minmax(0,1fr)_32px]";

function Register() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [group, setGroup] = useState<"all" | LibrarySource["group"]>("all");
  const [rec, setRec] = useState<"all" | "retained" | "reference">("all");
  const [page, setPage] = useState(0);
  const matches = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return library.filter(
      (s) =>
        words.every((w) => `${s.id} ${s.title} ${s.publisher}`.toLowerCase().includes(w)) &&
        (group === "all" || s.group === group) &&
        (rec === "all" || s.retained === (rec === "retained")),
    );
  }, [q, group, rec]);
  const pages = Math.max(1, Math.ceil(matches.length / PER));
  const cur = Math.min(page, pages - 1);
  const visible = matches.slice(cur * PER, cur * PER + PER);
  const reset = (f: () => void) => {
    f();
    setPage(0);
  };
  const field = "h-10 w-full rounded-[8px] border border-divider bg-card-bg text-[14px] text-ink";
  const label = "flex flex-col gap-1.5 text-[12px] leading-4 text-steel";
  return (
    <>
      <div className="grid gap-3 md:grid-cols-[minmax(0,607px)_minmax(0,302px)_minmax(0,303px)]">
        <label className={label}>
          Search sources
          <span className={cn(field, "flex items-center gap-2 px-3")}>
            <Search className="size-4 shrink-0 text-steel" aria-hidden="true" />
            <input value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder="Title, publisher or source ID" className="w-full bg-transparent outline-none placeholder:text-steel" />
          </span>
        </label>
        <label className={label}>
          Source group
          <span className="relative">
            <select value={group} onChange={(e) => reset(() => setGroup(e.target.value as typeof group))} className={cn(field, "appearance-none px-4")}>
              <option value="all">All groups</option>
              {Object.entries(sourceGroups).filter(([g]) => library.some((s) => s.group === g)).map(([g, l]) => <option key={g} value={g}>{l}</option>)}
            </select>
          </span>
        </label>
        <label className={label}>
          Record content
          <span className="relative">
            <select value={rec} onChange={(e) => reset(() => setRec(e.target.value as typeof rec))} className={cn(field, "appearance-none px-4")}>
              <option value="all">All records</option>
              <option value="retained">Retained extract</option>
              <option value="reference">Reference only</option>
            </select>
          </span>
        </label>
      </div>
      <div className="flex items-center justify-between pt-5 text-[13px] leading-5">
        <Popover>
          <PopoverTrigger className="text-horizon hover:underline">What do the source labels mean?</PopoverTrigger>
          <PopoverContent className="w-80 rounded-[16px] border-divider p-4 text-[13px] leading-5">
            <p><b className="font-display">Retained extract:</b> a saved passage or selected source fields.</p>
            <p className="mt-2"><b className="font-display">Reference only:</b> dated metadata and attributed notes.</p>
          </PopoverContent>
        </Popover>
        <output aria-live="polite" className="text-horizon tnum">
          Showing {matches.length ? cur * PER + 1 : 0}–{Math.min(matches.length, cur * PER + PER)} of {matches.length} sources
        </output>
      </div>

      <div className="overflow-x-auto pt-4">
        <div role="table" aria-label="Sources" className="flex min-w-[1000px] flex-col gap-2">
          <div role="row" className={cn("grid px-4 pb-1 text-[12px] leading-5 text-steel", COLS)}>
            {["ID", "Source", "Group", "Observed", "Record", ""].map((h, i) => <span role="columnheader" key={i}>{h}</span>)}
          </div>
          {visible.map((s) => (
            <div role="row" key={s.id} className={cn("grid h-[52px] items-center rounded-[8px] bg-card-bg px-4", COLS)}>
              <span role="cell" className="font-mono text-[12px] text-steel">{s.id}</span>
              <span role="cell" className="min-w-0 pr-4">
                <span className="block truncate font-display text-[14px] leading-4 font-bold text-ink">{s.title}</span>
                <span className="block text-[12px] leading-4 text-horizon">{s.publisher}</span>
              </span>
              <span role="cell" className="text-[14px] text-ink">{sourceGroups[s.group]}</span>
              <span role="cell" className="font-mono text-[12px] text-ink">{s.observed}</span>
              <span role="cell">
                <span className={cn("inline-flex h-[22px] items-center rounded-full bg-sky px-2 font-display text-[12px] font-bold", s.retained ? "text-ink" : "text-horizon")}>
                  {s.retained ? "Retained extract" : "Reference only"}
                </span>
              </span>
              <span role="cell" className="text-right">
                {s.url && (
                  <a href={s.url} target="_blank" rel="noreferrer" aria-label={`Open ${s.title}`} className="inline-flex text-horizon hover:text-ink">
                    <ArrowUpRight className="size-[18px]" aria-hidden="true" />
                  </a>
                )}
              </span>
            </div>
          ))}
          {visible.length === 0 && <p className="rounded-[8px] bg-card-bg py-8 text-center text-[14px] text-steel">No sources match these filters.</p>}
        </div>
      </div>

      <nav aria-label="Source pages" className="flex items-center justify-center gap-1 pt-4">
        <button onClick={() => setPage(cur - 1)} disabled={cur === 0} aria-label="Previous page" className="flex size-9 items-center justify-center text-steel disabled:opacity-40">
          <ChevronLeft className="size-5" />
        </button>
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i)}
            aria-current={i === cur ? "page" : undefined}
            className={cn("size-9 rounded-[8px] font-display text-[14px] tnum", i === cur ? "bg-panel font-bold text-ink" : "text-steel hover:text-ink")}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => setPage(cur + 1)} disabled={cur >= pages - 1} aria-label="Next page" className="flex size-9 items-center justify-center text-ink disabled:opacity-40">
          <ChevronRight className="size-5" />
        </button>
      </nav>
    </>
  );
}

export function SourcesPage() {
  return (
    <>
      <header className="px-4 pt-16 pb-8 sm:pt-24">
        <div className="mx-auto max-w-[1240px]">
          <h1 className="text-[30px] leading-[34px] tracking-[-0.045em] text-ink sm:text-[36px] sm:leading-[39.6px]">Sources.</h1>
          <p className="pt-2 text-[16px] leading-6 text-steel">Trace each investment case to its sources. Check the dates, supporting records and limitations.</p>
          <p className="pt-6 text-[13px] leading-5 text-steel tnum">
            {library.length} dated sources · {library.filter((s) => s.retained).length} saved extracts. PT-sUSDai uses the 22 Oct 2026 cutoff; original sources have not been refreshed.
          </p>
        </div>
      </header>
      {/* Figma runs the filters and table edge to edge across the 1240 px column (no inner gutter). */}
      <div className="mx-auto w-full max-w-[1272px] px-4 pt-4">
        <Register />
      </div>
      <Container className="pt-12">
        <h2 className="text-[24px] leading-[30px] tracking-[-0.03em] text-ink">Assessment reports</h2>
        <div className="mt-3 grid gap-3 rounded-[24px] bg-panel p-3 md:grid-cols-2">
          {REPORTS.map(([eyebrow, title, body, href]) => (
            <div key={title} className="flex flex-col rounded-[12px] bg-card-bg p-6">
              <div className="font-display text-[12px] leading-4 font-medium tracking-[0.2em] text-steel uppercase">{eyebrow}</div>
              <h3 className="mt-3 text-[18px] leading-6 text-ink">{title}</h3>
              <p className="mt-1 flex-1 text-[14px] leading-5 text-horizon">{body}</p>
              <a href={href} className="mt-6 inline-flex h-9 w-fit items-center gap-1.5 rounded-[8px] bg-navy px-3.5 font-display text-[14px] font-bold text-white">
                <Download className="size-4" aria-hidden="true" />
                Download
              </a>
            </div>
          ))}
        </div>
        <a href={`${LIVE}/research.json`} className="mt-4 inline-flex items-center gap-1.5 text-[14px] text-horizon hover:underline">
          <Download className="size-4" aria-hidden="true" />
          Download assessment data (JSON)
        </a>
      </Container>
      <Notes lines={[]} />
    </>
  );
}
