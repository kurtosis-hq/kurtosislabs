# Kurtosis Ratings: handoff

A working, clickable build of the Kurtosis Ratings site, made from the Figma file
https://www.figma.com/design/EeSpwUfCOmczyuhXUuShag (pages "Position tabs" and "Page 1").
Read `CLAUDE.md` and `docs/` before changing anything: `docs/kurtosis-ratings-context.md` wins on conflict.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000/ratings
npm run build      # production check
```

Next.js 16 (App Router, Cache Components on), React 19, Tailwind v4. Read
`node_modules/next/dist/docs/` before writing Next code: APIs differ from older versions
(`params` and `searchParams` are promises; pages that read them export `instant = false`).

## Routes

| URL | What it is |
|---|---|
| `/ratings` | Overview: all four positions |
| `/ratings/compare` | Side-by-side table and requirements |
| `/ratings/sources` | 71-source register with search and filters |
| `/ratings/methodology` | Methodology reading page |
| `/ratings/positions/[slug]` | Position page. `slug` = `onyc`, `pt-onyc`, `pt-sronyc`, `pt-susdai` |

Position page state is in the URL, so every view can be linked:

- `?tab=` `grade` (default) · `dependencies` · `routes` · `risks` · `evidence` · `updates`
- `&route=` (Exit routes only) `entry` · `settlement` (default) · `early` · `stress`
  (labels differ per token, e.g. ONyc "Issuer redemption", PT-sUSDai "After maturity")
- `&state=` (Evidence only) `supported` · `partial` · `stale` · `conflicting` · `missing` · `unavailable`

Example: `/ratings/positions/pt-susdai?tab=evidence&state=missing`

`/v/...` and `/variations/...` are earlier design-review copies. They are not part of the site.

## File map

| Path | Purpose |
|---|---|
| `app/ratings/layout.tsx` | Floating nav, page background (`.ratings-root`), Kurtosis Labs footer |
| `app/ratings/positions/[slug]/page.tsx` | Reads `searchParams`, renders `PositionView` |
| `app/layout.tsx` | Fonts and the before-paint theme script |
| `app/globals.css` | Brand tokens, light and "Dark Blue" themes, `.ratings-root` surface values |
| `components/ratings/position/position-view.tsx` | Position template: header, grade strip, tab bar, sidebar; `parseQuery` |
| `components/ratings/position/panels.tsx` | The six tab panels and `hrefFor` (builds every position URL) |
| `components/ratings/position/ui.tsx` | Tray, Card, Callout, Inset, Pill, StateChip, SourceChips and other small parts |
| `components/ratings/position/pill-tabs.tsx` | Pill bar for main tabs, route selector and evidence filter (links plus arrow-key focus) |
| `components/ratings/position/client.tsx` | "Show all N factors" expander and the private position note |
| `components/ratings/position/nav.tsx` | Floating black nav, light/dark toggle, mobile menu |
| `components/ratings/position/footer.tsx` | Page footnotes and the Kurtosis Labs footer with wordmark |
| `components/ratings/pages/kit.tsx` | Page header, accordion and footnotes measured from the Figma frames |
| `components/ratings/pages/{overview,compare,sources,methodology}.tsx` | The four list pages, built to the Figma frames at the top of the "Position tabs" page |
| `components/site/*` | Older Card Desk components, still used by the `/v` review copies only |
| `data/ratings-data.json` | All assessment content, scraped from kurtosislabs.com/ratings data files |
| `data/ratings.ts` | Types, helpers, and `extras` (evidence still needed, live updates, coverage per position) |

One template renders every token. Do not hand-build per-token pages; change the data or the template.

## Data shape

`positions: Position[]` in `data/ratings.ts`. The fields the position page uses:

- Header: `symbol`, `network`, `protocol`, `tokenType`, `matured`, `watchlist`, `bottomLine`
- Grade strip: `evidenceRating` (always NR), `confidence`, `scenarioGrade`, `asOf`, `evidenceDate`, `maturityLabel`
- Why this grade: `scenarioSummary`, `actualRisk`, `positiveEvidence`, `missingEvidence`, `scenarioAssumptions[]`, `changeReason`
- Dependencies: `layers[]` with `role` = `held` | `D` (economic chain) | `S` (shared control or protection) | `R` (alternative exit)
- Exit routes: `routes[]` (`id`, `label`, `summary`, `steps[]` with `input`, `output`, `condition`, `risk`, `sourceIds`)
- Risk factors: `keyRisks[]` (order and ids), `factors[]` (`state`, `implication`, `detail`, `check`, `sourceIds`), `beforeCommit`
- Evidence: `evidence[]` (`state`, `summary`, `gap`, `sourceIds`), `mint`, `maturityExact`, `lane`, `lossObject`, `scopeAssumptions`
- Sources: `sources[]` (`id`, `title`, `publisher`, `observed`, `url`); chips link to `url`
- `extras[slug]`: `evidenceNeeded[]`, `updates[]`, `coverage[]`, `coverageNote` (copied from the live pages, snapshot of 30 Oct, 03:58 UTC)

Rules: never invent values; unknowns render as `[CONFIRM]`. British spelling, no em-dashes.
Every scenario grade shows the "Assumptions unverified" pill. Keep "Ratings are research, not investment advice."

## Design tokens

Utilities read CSS variables (`@theme` in `globals.css`), so the dark theme swaps colours in one place.

| Token | Light | Dark Blue | Used for |
|---|---|---|---|
| `--color-mist` | #f4f9fd | #070f1f | Page background |
| `--color-card-bg` | #ffffff | #10233f | Cards, grade cells, active pill |
| `--color-panel` | #e3e9f0 | #0b1834 | Grey tray, tab track, inset boxes |
| `--color-sky` | #e9f3fc | #13274a | Blue callout |
| `--color-ink` | #152d49 | #e8ebf3 | Main text |
| `--color-steel` | #375987 | #9dafcf | Secondary text, labels |
| `--color-horizon` | #456e99 | #afc4ec | Links |
| `--color-navy` | #0f2d4b | #3c6cc8 | Active tab text, count badge, quote rule |
| `--color-divider` | #ced5db | #1e3358 | Hairlines |
| `--color-st-missing(-bg)` | #4a5a70 / #edf1f6 | #b8c5df / #1b3466 | Neutral pills and source chips |
| `--color-st-partial(-bg)` | #8a5300 / #fff3db | #f0c36a / #3a2a0d | Partial, Watchlist, For review |
| `--color-st-conflicting(-bg)` | #a1281c / #fdecea | #f4a196 / #3d1a17 | Conflicting, Unable to refresh |
| `--color-st-stale(-bg)` | #6a4c93 / #f2edf9 | #c4aeea / #2a2140 | Stale |
| `--glow` | none | royal-blue radial, top left | Page background accent |

Page backgrounds: list pages `--color-page-alt` (#f7f9fa), position pages Mist (#f4f9fd).
Nav: fixed 16 px from the top, 818 × 44, radius 8. Footer: white 607 px block, columns from 159 px, rule at 370 px, 200 px gradient wordmark.
Radii: tray 24, card and grade cells 12, callout 16, pill bar track 14 and items 10, inset 10, pills full.
Spacing: tray padding 12 with 8 between cards; card padding 24 (20 on phones); page max width 1240 with 16 gutters.
Fonts: Plus Jakarta Sans (headings, tabs, chips, numbers); body `"Helvetica Neue", Helvetica, Inter, Arial`.

Dark mode: the nav toggle sets `<html data-theme="dark">` and stores `kurtosis-theme` in localStorage.
The brand guide is light-only, so light is the default. Older components that hard-code `bg-white` become
cards in dark mode through one override in `globals.css`; add `.keep-white` to anything that must stay white.

## Link it from the landing page

The site lives entirely under `/ratings`. Pick one of these:

**A. Run it as its own app and link to it (simplest).**
Deploy this folder (for example on Vercel: `npm install`, `npm run build`, `npm start`), then point the
landing page's "Kurtosis Ratings" link at `https://<ratings-domain>/ratings`. Deep links work too:
`/ratings/positions/onyc`, `/ratings/compare`, `/ratings/sources`, `/ratings/methodology`.

**B. Copy it into the landing page repo (if that is also Next.js 16 with Tailwind v4).**
Copy these paths across unchanged:

- `app/ratings/` (all routes) and the theme script plus fonts from `app/layout.tsx`
- `components/ratings/` (pages, position, primitives)
- `components/site/chrome.tsx` (only `PositionSwitcher` is used) and `components/ui/popover.tsx`
- `data/ratings.ts` and `data/ratings-data.json`
- `lib/utils.ts`
- `public/assets/tok-*.png` (token icons)
- From `app/globals.css`: the `@theme` brand palette, `:root` tokens, `.ratings-root`, and every
  `:root[data-theme="dark"]` block

Packages needed: `next@16`, `react@19`, `lucide-react`, `@base-ui/react` (popover), `cn`
(used by `lib/utils.ts`), and fonts Plus Jakarta Sans and Inter via `next/font/google`.
Then link the landing page to `/ratings`.

The ratings nav's "Request a demo" button and the footer's Legal, Socials and Contact links are placeholders
(`#request-a-demo`, `#terms` and so on). Point them at the landing page's real sections when you connect the two.

## Open [CONFIRM] items

1. **"Request a demo" destination.** The label comes from the Figma nav; the link is a placeholder (`#request-a-demo`).
2. **Footer links.** Product, Company, Legal and Socials labels come from the Figma footer. Who we serve,
   Philosophy, Horizon and Explainable Vaults point at kurtosislabs.com anchors; Legal, Socials and Contact are placeholders.
3. **Status colours** (`globals.css`, brief section 4.5). The brand guide has none; these are proposed.
4. **Contact email** for "Contact Kurtosis" (`docs/kurtosis-ratings-context.md` section 10).
5. **Regulatory wording** of letter grades (Singapore "credit rating services"; legal review pending).
6. **Audience priority order** and **which partner and protocol names may appear in marketing** (context doc section 10).
7. **Which downloads the final page offers** (`components/site/pages/sources.tsx`).
8. **Live updates are a saved snapshot.** The live feed could not refresh (provider identity unverified),
   so Refresh and Pause are shown disabled; wiring a real feed is future work.
9. **Matured positions.** Three of the four showcase positions have matured; how the site should treat them is undecided.

## Checked so far

- All 24 position views (4 tokens × 6 tabs) render with no console errors and no horizontal scroll at 375 px.
- Route switching, evidence filtering (counts update), "Show all N factors", position note save and reload,
  and light/dark toggle with persistence all work.
- `npm run build`, `tsc --noEmit` and ESLint on the new files pass.
