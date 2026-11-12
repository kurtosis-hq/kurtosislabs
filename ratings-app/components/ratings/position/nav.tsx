"use client";
// The black floating nav from the Figma frames ("Navigation - Ratings"), with the light/dark toggle.
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { KMark } from "@/components/ratings/primitives";

const LINKS = [
  ["Overview", "/ratings"],
  ["Compare", "/ratings/compare"],
  ["Sources", "/ratings/sources"],
  ["Methodology", "/ratings/methodology"],
] as const;

type Theme = "light" | "dark";

// The theme lives on <html data-theme>, set before paint by the script in app/layout.tsx.
const THEME_EVENT = "kurtosis-theme-change";
const subscribe = (cb: () => void) => {
  window.addEventListener(THEME_EVENT, cb);
  return () => window.removeEventListener(THEME_EVENT, cb);
};
const readTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

function useTheme(): [Theme, (t: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);
  const set = (t: Theme) => {
    if (t === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      sessionStorage.setItem("kurtosis-theme", t);   // this visit only: every new visit starts in light mode
    } catch {
      /* Private windows can block storage; the toggle still works for this visit. */
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };
  return [theme, set];
}

function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const btn = (t: Theme, Icon: typeof Sun, label: string) => (
    <button
      type="button"
      onClick={() => setTheme(t)}
      aria-pressed={theme === t}
      aria-label={label}
      className={cn("flex size-6 items-center justify-center rounded-full", theme === t ? "keep-white bg-white text-black" : "text-white/70 hover:text-white")}
    >
      <Icon className="size-3.5" aria-hidden="true" />
    </button>
  );
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-white/[0.14] p-0.5" role="group" aria-label="Colour theme">
      {btn("light", Sun, "Light theme")}
      {btn("dark", Moon, "Dark theme")}
    </div>
  );
}

/* One round button in the top-right corner of the page (Figma "Navigation - Ratings"): a moon in light mode,
   a sun in dark mode. Click it to switch. */
function CornerThemeButton() {
  const [theme, setTheme] = useTheme();
  const dark = theme === "dark";
  const Icon = dark ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="fixed top-[24px] right-[32px] z-50 hidden size-[28px] items-center justify-center rounded-full border-[1.5px] border-[#7d8fa7] bg-transparent text-[#1e2b3c] transition-colors hover:bg-black/5 md:flex dark-corner"
    >
      <Icon className="size-[14px]" aria-hidden="true" />
    </button>
  );
}

export function FloatingNav() {
  const raw = usePathname();
  const path = raw.length > 1 ? raw.replace(/\/$/, "") : raw;   // static pages end in "/"
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/ratings" ? path === "/ratings" || path.startsWith("/ratings/positions") : path.startsWith(href));
  return (
    <>
    <CornerThemeButton />
    <div className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <nav aria-label="Ratings" className="pointer-events-auto relative w-full max-w-[818px]">
        <div className="flex h-11 items-center gap-4 rounded-[8px] bg-black pr-1.5 pl-2.5">
          <Link href="/" aria-label="Kurtosis Labs home" className="flex items-center gap-2.5 text-white">
            <span className="keep-white flex size-7 items-center justify-center rounded-[3px] bg-white">
              <KMark className="h-4 w-4" fill="#0B1A35" />
            </span>
            <span className="hidden text-[14px] leading-6 font-medium tracking-[-0.02em] whitespace-nowrap sm:inline">
              Kurtosis <span className="text-white/70">/</span> Ratings
            </span>
          </Link>
          <div className="ml-auto hidden items-center gap-[38px] text-[14px] leading-6 md:flex">
            {LINKS.map(([l, h]) => (
              <Link key={l} href={h} aria-current={isActive(h) ? "page" : undefined} className={isActive(h) ? "text-white" : "text-white/70 hover:text-white"}>
                {l}
              </Link>
            ))}
          </div>
          <div className="ml-auto md:hidden">
            <ThemeToggle />
          </div>
          <a
            href="/contact.html"
            className="keep-white ml-2 hidden h-8 items-center rounded-[4px] bg-white px-3 font-display text-[13px] leading-6 font-bold whitespace-nowrap text-black sm:ml-10 sm:flex"
            title="Label from the Figma nav. Destination [CONFIRM]"
          >
            Request a demo
          </a>
          <button className="px-1 text-white md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <ul className="absolute inset-x-0 top-[52px] rounded-[8px] bg-black p-2 md:hidden">
            {LINKS.map(([l, h]) => (
              <li key={l}>
                <Link href={h} onClick={() => setOpen(false)} className={cn("block rounded-[10px] px-3 py-2.5 text-[15px]", isActive(h) ? "bg-white/15 text-white" : "text-white/75")}>
                  {l}
                </Link>
              </li>
            ))}
            <li>
              <a href="/contact.html" className="block rounded-[10px] px-3 py-2.5 text-[15px] text-white/75">
                Request a demo
              </a>
            </li>
          </ul>
        )}
      </nav>
    </div>
    </>
  );
}
