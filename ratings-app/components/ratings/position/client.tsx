"use client";
import { useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* "Show all N factors": the extra content stays in the page for search and print, hidden until opened. */
export function Expandable({ total, children }: { total: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div hidden={!open}>{children}</div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-1.5 self-start rounded-[10px] bg-card-bg px-4 font-display text-[14px] font-bold text-ink hover:bg-sky"
      >
        {open ? "Show key risks only" : `Show all ${total} factors`}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
    </>
  );
}

const LIMIT = 5000;
const NOTE_EVENT = "kurtosis-note-saved";
function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(NOTE_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(NOTE_EVENT, cb);
  };
}

/* Private follow-up note, saved only in this browser (localStorage) and never sent anywhere. */
export function PositionNote({ slug, symbol }: { slug: string; symbol: string }) {
  const key = `kurtosis-note-${slug}`;
  // The saved note is read from localStorage; edits stay in a draft until saved.
  const stored = useSyncExternalStore(
    subscribeStorage,
    () => {
      try {
        return localStorage.getItem(key) ?? "";
      } catch {
        return "";
      }
    },
    () => "",
  );
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? stored;
  const setText = setDraft;
  const [status, setStatus] = useState<"" | "saved" | "copied" | "blocked">("");
  const save = () => {
    try {
      localStorage.setItem(key, text);
      window.dispatchEvent(new Event(NOTE_EVENT));
      setStatus("saved");
    } catch {
      setStatus("blocked");
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("blocked");
    }
  };
  const btn = "inline-flex h-8 items-center rounded-full bg-st-missing-bg px-3 font-display text-[12px] font-bold text-st-missing hover:text-ink";
  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={key} className="text-[13px] leading-5 text-steel">Saved only in this browser and never sent to Kurtosis.</label>
      <textarea
        id={key}
        value={text}
        maxLength={LIMIT}
        onChange={(e) => {
          setText(e.target.value);
          setStatus("");
        }}
        placeholder={`Follow-up for ${symbol}…`}
        rows={4}
        className="w-full resize-y rounded-[10px] border border-panel bg-card-bg p-3 text-[14px] leading-5 text-ink placeholder:text-steel"
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-auto text-[13px] text-steel tnum">
          {text.length.toLocaleString("en-GB")} / {LIMIT.toLocaleString("en-GB")}
        </span>
        <span role="status" className="text-[13px] text-steel">
          {status === "saved" ? "Saved in this browser" : status === "copied" ? "Copied" : status === "blocked" ? "This browser blocked saving" : ""}
        </span>
        <button type="button" onClick={copy} className={btn}>Copy note</button>
        <button type="button" onClick={save} className={btn}>Save note</button>
      </div>
    </div>
  );
}
