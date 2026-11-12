"use client";
// Sources register: search plus two selects, 52 px rows, numbered pagination centred under the list.
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { library, sourceGroups, type LibrarySource } from "@/data/ratings";
import { Mono } from "@/components/ratings/primitives";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Surface } from "./ui";

const PER = 10;

export function SourcesRegister() {
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
  const field = "h-10 rounded-[10px] border border-divider bg-white px-3 text-[14px]";

  return (
    <>
      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <label className="text-[12px] text-muted-foreground">
          Search sources
          <span className={cn(field, "mt-1 flex items-center gap-2")}>
            <Search className="size-4 text-steel" aria-hidden="true" />
            <input value={q} onChange={(e) => reset(() => setQ(e.target.value))} placeholder="Title, publisher or source ID" className="w-full bg-transparent text-ink outline-none placeholder:text-steel" />
          </span>
        </label>
        <label className="text-[12px] text-muted-foreground">
          Source group
          <select value={group} onChange={(e) => reset(() => setGroup(e.target.value as typeof group))} className={cn(field, "mt-1 w-full text-ink")}>
            <option value="all">All groups</option>
            {Object.entries(sourceGroups).filter(([g]) => library.some((s) => s.group === g)).map(([g, l]) => <option key={g} value={g}>{l}</option>)}
          </select>
        </label>
        <label className="text-[12px] text-muted-foreground">
          Record content
          <select value={rec} onChange={(e) => reset(() => setRec(e.target.value as typeof rec))} className={cn(field, "mt-1 w-full text-ink")}>
            <option value="all">All records</option>
            <option value="retained">Retained extract</option>
            <option value="reference">Reference only</option>
          </select>
        </label>
      </div>
      <div className="mt-3 flex items-center justify-between text-[13px]">
        <Popover>
          <PopoverTrigger className="text-horizon hover:underline">What do the source labels mean?</PopoverTrigger>
          <PopoverContent className="w-80 rounded-[16px] border-divider p-4 text-[13px] leading-5">
            <p><b className="font-display">Retained extract:</b> a saved passage or selected source fields.</p>
            <p className="mt-2"><b className="font-display">Reference only:</b> dated metadata and attributed notes.</p>
          </PopoverContent>
        </Popover>
        <output aria-live="polite" className="text-muted-foreground tnum">
          Showing {matches.length ? cur * PER + 1 : 0}–{Math.min(matches.length, cur * PER + PER)} of {matches.length} sources
        </output>
      </div>

      <Surface pad={false} className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-divider text-[12px] text-muted-foreground" style={{ background: "var(--head-bg)" }}>
              {["ID", "Source", "Group", "Observed", "Record", ""].map((h) => <th key={h} className="px-4 py-2.5 font-normal">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {visible.map((s) => (
              <tr key={s.id} className="h-[52px] hover:bg-mist">
                <td className="px-4"><Mono className="text-[12px] text-steel">{s.id}</Mono></td>
                <td className="px-4 py-2">
                  <span className="block font-display text-[14px] font-bold text-ink">{s.title}</span>
                  <span className="block text-[12px] text-muted-foreground">{s.publisher}</span>
                </td>
                <td className="px-4 text-[13px] whitespace-nowrap">{sourceGroups[s.group]}</td>
                <td className="px-4 whitespace-nowrap"><Mono className="text-[12px]">{s.observed}</Mono></td>
                <td className="px-4 whitespace-nowrap">
                  <span className={cn("inline-flex h-[22px] items-center rounded-full px-2 font-display text-[12px] font-bold", s.retained ? "bg-sky text-navy" : "bg-mist text-steel")}>
                    {s.retained ? "Retained extract" : "Reference only"}
                  </span>
                </td>
                <td className="px-4 text-right">
                  {s.url && (
                    <a href={s.url} target="_blank" rel="noreferrer" aria-label={`Open ${s.title}`} className="inline-flex text-horizon"><ArrowUpRight className="size-4" aria-hidden="true" /></a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="py-8 text-center text-[14px] text-muted-foreground">No sources match these filters.</p>}
      </Surface>

      <nav aria-label="Source pages" className="mt-4 flex items-center justify-center gap-1">
        <button onClick={() => setPage(cur - 1)} disabled={cur === 0} aria-label="Previous page" className="flex size-9 items-center justify-center rounded-[10px] text-steel disabled:opacity-40"><ChevronLeft className="size-4" /></button>
        {Array.from({ length: pages }, (_, i) => (
          <button key={i} onClick={() => setPage(i)} aria-current={i === cur ? "page" : undefined} className={cn("size-9 rounded-[10px] font-display text-[14px] tnum", i === cur ? "bg-panel font-bold text-ink" : "text-steel hover:bg-mist")}>
            {i + 1}
          </button>
        ))}
        <button onClick={() => setPage(cur + 1)} disabled={cur >= pages - 1} aria-label="Next page" className="flex size-9 items-center justify-center rounded-[10px] text-steel disabled:opacity-40"><ChevronRight className="size-4" /></button>
      </nav>
    </>
  );
}
