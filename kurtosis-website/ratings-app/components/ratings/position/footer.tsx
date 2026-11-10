// Page footnotes plus the Kurtosis Labs footer, measured from the Figma footer
// ("Frame 5" 1440 × 607 white, footer-links image 1438 × 311 at y 60, wordmark 200 px at y 514).
import Link from "next/link";
import { DISCLAIMER, SHOW_RESEARCH_NOTICES } from "@/data/ratings";
import { KMark } from "@/components/ratings/primitives";

// Keep unavailable destinations visible, but without an actionable href.
const COLUMNS: { title: string; links: [string, string | null][] }[] = [
  { title: "Product", links: [["Kurtosis Ratings", "/ratings"], ["Kurtosis Horizon", null], ["Explainable Vaults", null], ["Methodology", "/ratings/methodology"], ["Research", "/ratings/sources"]] },
  { title: "Company", links: [["Who we serve", null], ["Philosophy", null], ["Contact Kurtosis Labs", null]] },
  { title: "Legal", links: [["Terms of Use", null], ["Privacy Policy", null], ["Cookie Policy", null], ["Disclosures", null]] },
  { title: "Socials", links: [["X", null], ["LinkedIn", null], ["Back to top", "#top"]] },
];

/* Position-page footnotes (the other pages use Notes in components/ratings/pages/kit.tsx). */
export function PageNotes({ notes }: { notes: string[] }) {
  if (!SHOW_RESEARCH_NOTICES) return null;
  return (
    <footer className="mx-auto w-full max-w-[1240px] px-4 pt-12 pb-16">
      <div className="space-y-2 border-t border-divider pt-6 text-[13px] leading-5 text-steel">
        {notes.map((n) => (
          <p key={n}>{n}</p>
        ))}
        <p className="text-ink">{DISCLAIMER}</p>
        <p>Kurtosis Ratings · Research preview · Content from kurtosislabs.com/ratings, retrieved 04 Nov 2026.</p>
      </div>
    </footer>
  );
}

export function LabsFooter() {
  return (
    <footer className="relative overflow-hidden bg-[var(--footer-bg)] md:h-[607px]">
      <div className="mx-auto max-w-[1440px]">
        <div className="border-b border-[var(--footer-rule)] px-4 pt-16 pb-12 md:mx-px md:h-[370px] md:px-0 md:pt-[120px] md:pb-0 md:pl-[159px]">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[299px_237px_237px_238px_minmax(0,1fr)] md:gap-0">
            <div>
              <Link href="/" aria-label="Kurtosis Labs home" className="flex items-center gap-2 text-ink">
                <KMark className="h-3.5 w-3.5" />
                <span className="font-display text-[15px] leading-5 font-bold">Kurtosis Labs</span>
              </Link>
              <p className="mt-5 text-[12px] leading-4 text-[var(--footer-link)]">© 2026 Kurtosis Labs. All rights reserved.</p>
            </div>
            {COLUMNS.map((c) => (
              <div key={c.title}>
                <h2 className="font-display text-[12px] leading-4 font-bold tracking-[0.16em] text-ink uppercase">{c.title}</h2>
                <ul className="mt-6 flex flex-col gap-[18px] text-[13px] leading-5">
                  {c.links.map(([l, h]) => (
                    <li key={l}>
                      <a href={h ?? undefined} role={h ? undefined : "link"} aria-disabled={h ? undefined : true} tabIndex={h ? undefined : -1} className="text-[var(--footer-link)] hover:text-ink">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p
        aria-hidden="true"
        className="pointer-events-none mx-auto mt-8 text-center leading-none font-medium tracking-[-0.01em] whitespace-nowrap select-none md:absolute md:inset-x-0 md:bottom-[-0.06em] md:mt-0"
        style={{
          fontSize: "clamp(56px, 13.9vw, 200px)",
          fontFamily: '"Helvetica Neue", Helvetica, var(--font-inter), Arial, sans-serif',
          backgroundImage: "linear-gradient(to top, var(--wordmark-a) 26.4%, var(--wordmark-b) 104.6%, var(--wordmark-c) 216.4%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Kurtosis Labs
      </p>
    </footer>
  );
}
