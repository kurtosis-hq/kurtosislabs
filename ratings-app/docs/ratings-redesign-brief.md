# Kurtosis Ratings redesign brief

Version 2, 03 Nov 2026. Read this together with the Ratings context prompt (`kurtosis-ratings-context.md`) and the brand guide (`kurtosis-brand-guidelines.html`, Version 2.0, October 2026). If the context prompt and this brief disagree on a rule, the context prompt wins. Every colour, radius, size and font in section 4 comes from the brand guide. If this brief and the brand guide ever differ, the brand guide wins. Anything marked [CONFIRM] stays a visible placeholder until Ernest confirms it.

## 1. Direction

- **Structure from Ondo:** dense lists you can scan, summary cards, status pills and filter chips.
- **Detail patterns from Elfa:** the stat grid, the timeline and the side panel of related items.
- **Colours, type and shapes from Kurtosis Brand Guidelines v2.0:** light only.

Take no colours, logos, images or wording from Ondo or Elfa.

Reference screenshots go in `design-ref/`: `ondo-explore.png`, `elfa-asset.png`, and `current-*.png` for the live Kurtosis pages.

## 2. What to take from each reference

| Pattern | From | Where it goes in Kurtosis |
|---|---|---|
| Three summary cards above the main list | Ondo (Top Gainers, Trending, Newly Added) | Overview: Needs attention, Latest updates, Evidence gaps |
| One container holding tabs with counts, plus a status pill top right | Ondo (Stocks & ETFs 476, Market Open) | Overview list: tabs by layer type, "Research preview" pill |
| Filter chips, search icon and sort select in one row | Ondo | Overview, Compare, Sources |
| Rows with round icon, bold name, grey sub-line, thin horizontal dividers, no vertical lines | Ondo | Every table |
| Status pill with a small dot or icon and a sentence-case label | Ondo (Asset Open, Asset Paused) | Evidence states, Watchlist, update status |
| Numbered pagination, centred | Ondo | Sources |
| Colour only where it carries meaning, everything else neutral | Ondo | Whole site |
| Compact asset header: back arrow, icon, name, small type line | Elfa | Position page header |
| Key-value stat grid with hairline cell borders | Elfa (Market Cap, Supply, FDV) | Position rating status strip |
| Right-hand "Related" list with the role right-aligned | Elfa (People, Accounts, Projects) | Position sidebar: key risks, layers, sources, downloads |
| Event timeline: relative time, unread dot, bold headline, two-line summary, "3 sources" chip | Elfa (Latest Events) | Live updates tab |
| Long text clamped with "Show more" | Elfa (About) | Evidence, Compare and Methodology text |

What we are not taking, and why:
- **Ondo's black hero banner with animated words.** It's marketing, and this is a research tool.
- **Price, percentage-change and sparkline columns.** They make the page read as a trading product showing performance, which breaks the "never imply returns" rule.
- **Elfa's dark mode and purple.** The brand is light only.
- **A Cmd+K global search.** Four positions don't need one; Sources keeps its own search.

## 3. Problems in the current build this fixes

1. **The scenario letter dominates the NR rating.** It's large and amber while NR is small, which breaks "never make it look more important than the evidence rating". Fixed by the grade display rule in section 4.6.
2. **Overview rows run about 250 px each, with 8 buttons across 4 rows.** Rows shrink to 64 px, and the whole row links to the assessment.
3. **On the position page, roughly 650 px of header repeats above the tabs on every tab.** The tabs move up, and key risks plus the bottom line move to a sticky sidebar.
4. **Source links sit in loose two-column grids.** Replace them with one "3 sources" chip that opens a popover list.
5. **ALL-CAPS tracked labels everywhere** ("WHAT NEEDS TO HAPPEN"). Use 12 px sentence-case labels.
6. **Live updates stacks three warning banners** (Unable to refresh, Updates are paused, Showing saved updates). Replace them with one status bar.
7. **The Dependencies panel has a duplicated, clipped "EVIDENCE" heading** and lists "ONyc product description" twice. Fix both.
8. **The brand's muted text colour #7D8FA7 fails contrast for small text** (3.30:1 on white). See section 4.2.
9. **The current nav bar is white.** The brand nav bar is a floating black bar. See section 4.4.

## 4. Theme (Kurtosis Brand Guidelines v2.0)

### 4.1 Brand colours

| Name | Hex | Use |
|---|---|---|
| Primary navy | #0F2D4B | Ratings product colour, primary buttons, selected states |
| Ink | #152D49 | Body and heading text, second button style |
| Logo navy | #172A42 | The K mark and wordmark on light grounds |
| Deep | #0B1A35 | The K inside the white tile on the black nav bar |
| Black | #000000 | Floating navigation bar |
| Horizon | #456E99 | Horizon product colour, icons, links, focus ring |
| Gradient | #718BA7 | Gradient product colour. Not used on Ratings pages |
| Steel | #375987 | Supporting colour |
| Mid | #637B9D | Supporting colour |
| Light | #899BB1 | Supporting colour |
| Muted text | #7D8FA7 | Brand muted text. Large text and non-text only (see 4.2) |
| White | #FFFFFF | Cards |
| Mist | #F4F9FD | Page body |
| Sky tint | #E9F3FC | Selected rows, info callouts, secondary surfaces |
| Panel | #E3E9F0 | The pale navy panel that groups cards |
| Track | #D8DEE5 | Progress and slider tracks |
| Divider | #CED5DB | Hairlines, input borders |

Washes:
- **Section wash** (page header areas): `linear-gradient(180deg, #FFFFFF 24%, #F4F9FD 51%, #E9F3FC 76%)`
- **Dusk** (large feature bands only, not data pages): `linear-gradient(90deg, #E6EEFB 0%, #7B8DA3 50%, #0F2D4B 100%)`
- **Photo wash:** #010813 at 69% over any photo with text on it. Ratings data pages use no photos.

### 4.2 shadcn variables

| Variable | Value | Brand name |
|---|---|---|
| `--background` | #F4F9FD | Mist |
| `--card`, `--popover` | #FFFFFF | White |
| `--foreground`, `--card-foreground` | #152D49 | Ink |
| `--primary` | #0F2D4B | Primary navy |
| `--primary-foreground` | #FFFFFF | White |
| `--secondary`, `--accent` | #E9F3FC | Sky tint |
| `--secondary-foreground`, `--accent-foreground` | #0F2D4B | Primary navy |
| `--muted` | #E3E9F0 | Panel |
| `--muted-foreground` | #375987 | Steel (see note) |
| `--border`, `--input` | #CED5DB | Divider |
| `--ring` | #456E99 | Horizon |
| `--radius` | 10px | Button corner |

Note on muted text. The brand's Muted text colour, #7D8FA7, is too faint for small text. It scores 3.30:1 on white, and AA needs 4.5:1 below 18 px. So the variable uses Steel #375987, another brand colour, which scores 7.14:1. Keep #7D8FA7 for text 18 px and larger on white, and for decorative icons and chart lines. This stays inside the brand palette, so no new colour is introduced.

Measured contrast:

| Colour | On White | On Mist | On Panel | Small text (4.5:1) |
|---|---|---|---|---|
| #0F2D4B Primary navy | 14.03 | 13.23 | 11.47 | Pass |
| #375987 Steel | 7.14 | 6.74 | 5.84 | Pass |
| #456E99 Horizon | 5.33 | 5.02 | 4.36 | Pass on White and Mist; fail on Panel |
| #637B9D Mid | 4.33 | 4.09 | 3.54 | Fail |
| #7D8FA7 Muted text | 3.30 | 3.12 | 2.70 | Fail |
| #899BB1 Light | 2.84 | 2.68 | 2.33 | Fail |

### 4.3 Type

- **Plus Jakarta Sans,** loaded with `next/font/google`, weights 500 and 700 only.
  - Medium 500: every heading, the small labels above headings, and numbers (including 01 to 03 step numbers and grades). Headings are set tight: -0.03em at 24 px and up, -0.045em on the page title.
  - Bold 700: buttons, chips, pills and bar labels.
- **Helvetica Neue,** never loaded from the web. Stack: `"Helvetica Neue", Helvetica, Arial, sans-serif`.
  - Regular 400: body copy, navigation links and the footer.
  - Medium 500: the wordmark (letter spacing -0.02em) and short emphasis.
- **Monospace for IDs, dates and mint addresses:** `ui-monospace, SFMono-Regular, Menlo, monospace`. [CONFIRM] The brand guide names no monospace font.
- **Numbers:** `font-variant-numeric: tabular-nums` in tables, stat strips and dates.

Scale:

| Use | Size / line height |
|---|---|
| Page title | 40 / 44 |
| Section heading | 24 / 30 |
| Card heading | 18 / 24 |
| Body | 16 / 24 |
| Table text | 14 / 20 |
| Field and column labels | 12 / 16, sentence case |
| Eyebrow label above a heading | 12 / 16, Plus Jakarta Sans 500, uppercase, 0.2em letter spacing. At most one per section |

### 4.4 Surfaces and components

**Navigation bar.**
- A floating black (#000000) bar, 748 × 44 px, 16 px corners, 24 px from the top of the screen, centred.
- Left: the K mark on a white square with 11% corner radius, the K in Deep #0B1A35. Then "Kurtosis / Ratings" in white Helvetica Neue once there is room. Below 768 px, show the square alone.
- Links: Overview, Compare, Sources, Methodology. White, 14 px, 40 px gaps. The current page link sits at full white and the others at 70% white.
- Right: one white button with black text, 32 px tall. [CONFIRM] the label. The context prompt's CTA is "Request a walkthrough".
- Below 768 px, the links move into a menu (shadcn `sheet`) opened from the bar.

**Page background.**
- Page header areas (title and subline) sit on the section wash.
- Everything below sits on Mist.

**Cards.**
- White, 28 px corners, no border.
- Grouped cards sit inside a Panel (#E3E9F0) container with 42 px corners and 12 px padding. Use this for the summary card trio, the "Why this grade" 2 × 2, the four gates on Methodology, and the assessment reports.
- A single table or list is one white card with 28 px corners straight on Mist, with no Panel around it.

**Buttons.**
- 36 px tall, 14 px side padding, 10 px corners, Plus Jakarta Sans 700 at 14 px.
- Primary: navy #0F2D4B with white text.
- Alternate: Ink #152D49 with white text, for a second solid button next to a primary.
- On black or navy: white with black text.
- [CONFIRM] Outline button (white, Ink text, 1 px Divider border) for secondary actions on light pages such as "Compare positions". The brand guide doesn't define one.

**Icons.**
- Lucide, 24 × 24 box, 2 px stroke, rounded caps and joins, in Horizon #456E99 or navy.
- 16 px inside pills and table cells, 14 px inside status pills.
- The Ratings product icon (white layered line art on a 62 px navy square with 16 px corners, secondary strokes at 60% white) goes beside the page title on Overview only.

**Motion.**
- Calm and in order. Page header blocks rise 90 px and sharpen from a light blur, then their words drift up one after another. Blocks that arrive together appear top to bottom, a beat apart.
- Tables, pills, tabs and data never animate in. They appear at once, so numbers are readable immediately.
- No "hold, then step" scroll locking on Ratings pages; that pattern is for the marketing site.
- Nothing bounces or flashes. Turn off all motion under `prefers-reduced-motion: reduce`.

### 4.5 Status colours

[CONFIRM] The brand guide has no status colours. These are proposed, and all pass AA measured on the pill's own background.

| State | Text | Background | Contrast | Lucide icon |
|---|---|---|---|---|
| Supported | #1D6B44 | #E6F4EC | 5.72 | `circle-check` |
| Partial | #8A5300 | #FFF3DB | 5.76 | `circle-half` |
| Conflicting | #A1281C | #FDECEA | 6.48 | `circle-alert` |
| Missing | #4A5A70 | #EDF1F6 | 6.20 | `circle-dashed` |
| Unavailable | #4A5A70 | #EDF1F6 | 6.20 | `circle-slash` |
| Stale | #6A4C93 | #F2EDF9 | 5.95 | `clock` |
| N/A | #375987 plain text, no pill | none | 7.14 | none |
| Watchlist | #8A5300 | #FFF3DB | 5.76 | `eye` |
| For review | Partial colours | | | `flag` |
| For context | `--secondary` colours | | | `info` |

Pill shape:
- 22 px tall, fully rounded, 14 px icon, Plus Jakarta Sans 700 at 12 px, sentence case.
- Always show the icon and the label together. Never rely on colour alone, because Missing and Unavailable share a colour and differ only by icon.

### 4.6 Grade display rule

This applies everywhere a grade appears, and all of it lives in one `GradeCell` component. If the pending legal review changes how grades may be shown, it's one edit.

1. **Evidence rating first.** NR is set in Plus Jakarta Sans 500, at the same size as the scenario letter, with "Low confidence" underneath.
2. **Scenario grade second, at the same size, in Ink #152D49.** No amber. Put an "Assumptions unverified" pill (Missing style) directly beside it.
3. **Required wording.** Below any table, card or strip that shows a scenario grade: "Scenario letters reflect unverified assumptions, not established differences in current credit quality."
4. **Banned words.** Never use "rated", "approved" or "verified" for an NR position.

## 5. Page by page

### 5.1 Overview

Top to bottom:

1. **Floating black nav bar** as specified in section 4.4.
2. **Header.**
   - Title: "Know the risks behind each position."
   - Subline under it.
   - On the right: a "Research preview" pill, a "Rubric kurtosis-underwriting.v3 · 25 Oct 2026" pill, and a secondary "Compare positions" button.
3. **Three summary cards in a row.** Each card has a title, a small count badge and three rows. Each row shows an icon, the position name and a value on the right.
   - **Needs attention:** positions with unread updates or a Watchlist flag. Value: "6 new updates" or a Watchlist pill.
   - **Latest updates:** the three newest reported developments across all positions. Value: relative time plus a For review or For context pill.
   - **Evidence gaps:** positions ordered by their count of Conflicting and Missing requirements. Value: for example "1 conflicting · 2 missing". [CONFIRM] Take the counts from the data, never estimate them.
4. **Positions container.**
   - Tabs: All 4, Principal tokens 3, Real-world assets 1.
   - Chips: Solana, Arbitrum One, Watchlist, Matured.
   - On the right: a search input and a sort select (Coverage gaps first, Name, Evidence date).
5. **Table.** Rows are 64 px, and the whole row links to `/ratings/[slug]`.

   | Column | Content |
   |---|---|
   | Position | Icon, name, "Solana · OnRe" in muted text |
   | Evidence rating | NR pill, "Low confidence" underneath |
   | Scenario grade | Letter plus "Assumptions unverified" pill |
   | Evidence gates | Four small state dots (holder rights, backing, token payoff, cash access), each with a tooltip. [CONFIRM] which evidence requirements feed each gate. If they can't be mapped, drop the column. |
   | Main risk | The first key risk on one line. A hover card shows all three plus the evidence-gap line. |
   | Maturity | Monospace: "Open-ended" or "Matured 10 Sept 2026" |
   | Updates | "3 new" with a dot, or blank |
   | (no heading) | Chevron |

   Below 768 px, each row becomes a card: name, the two grade cells side by side, then the main risk.
6. **Footnotes.**
   - The required scenario wording.
   - "Missing information establishes neither distress nor safety. Live updates prompt review and never change a grade automatically."
   - "Ratings are research, not investment advice."

Remove the View assessment and View risk factors buttons from each row.

### 5.2 Position page

Layout: main column 8/12 wide, sidebar 4/12 wide and sticky (92 px from the top, clearing the 24 px offset plus the 44 px nav bar) at 1024 px and up. Below that width the sidebar sits under the tabs.

1. **Header row** (Elfa pattern).
   - "← All positions".
   - 40 px icon.
   - "ONyc" at 32 px.
   - Sub-line: "Solana / OnRe · NAV-based token · Research preview".
   - Position switcher select on the right.
2. **Status strip.** One white card with six equal cells and hairline dividers. Each cell has a 12 px muted label and a 16 px Plus Jakarta Sans 500 value:
   - Evidence rating: NR · Low confidence
   - Scenario grade: BB- · Assumptions unverified
   - As of: 25 Oct 2026
   - Evidence date: 08 Sept 2026
   - Series: Open-ended
   - Token type: NAV-based token

   Put the required scenario wording directly under the strip.
3. **Bottom line.** One sentence in a callout with a 3 px navy left rule, for example "Treat this as insurance exposure with conditional cash access…".
4. **Tabs, straight after:** Why this grade, Dependencies, Exit routes, Risk factors, Evidence, Live updates. Live updates carries an unread count badge. [CONFIRM] "Why this grade" moves from an expander to the first tab, matching Figma frame 1:1385.

**Sidebar** (Elfa "Related" pattern). Each block is a small heading with a list underneath, and labels right-aligned in muted text:
- **Key risks:** three numbered items, each linking to its row in Risk factors.
- **Layers:** the Russian Doll stack in short form. For example, "OnRe segregated account" with "Economic dependency" right-aligned.
- **Sources:** the count, plus a "Browse sources" link.
- **Downloads:** the assessment report and the JSON data. This replaces the "Scope, sources & downloads" expander.
- **Your note:** a link to the note on the Evidence tab.

**Tabs:**

- **Why this grade.**
  - Four cards in a 2 × 2 grid: Scenario assumption, Documented risk, Supporting observations, Still unknown.
  - Then "Assumptions needed for BB-" as a numbered list with state pills.
  - Then the risks list, with a sources chip on each item.
- **Dependencies.**
  - Keep the layer stack on the left and the detail panel on the right. The selected layer gets a 2 px navy border.
  - Fix the duplicated heading and the duplicated source.
- **Exit routes.**
  - A segmented control (`toggle-group`): Acquire, Issuer redemption, Secondary sale, Stress exit.
  - An "Indicative route" label at the top.
  - Numbered steps, each showing the from → to chips, "What needs to happen" and "What could go wrong".
  - "No transaction was simulated or submitted." is always visible, never collapsed.
- **Risk factors.**
  - One block per risk: number, title and a one-line summary on the left; Evidence and "Still needs checking" in two columns; the state pill on the right; a sources chip that opens a popover of source IDs and titles.
  - Show the first three, then a "Show all 5 factors" button.
  - Keep the "Before you commit" box.
- **Evidence.**
  - Validation status card at the top.
  - Evidence items as accordion rows: title with the state pill on the right; expanding shows the summary, "Still needs checking" and the sources chip.
  - Position scope as a key-value table, with the mint address in monospace and a copy button.
  - The private note saves to `localStorage` only, with every read and write wrapped in try/catch. It is never sent anywhere.
- **Live updates.**
  - One status bar: state pill, "Retrieved 30 Oct, 03:58 UTC · Next check after 02 Nov, 23:40 UTC", and a Refresh button.
  - A timeline in the Elfa pattern. Each entry has:
    - relative time on the left ("4d"), with the exact UTC time on hover
    - a navy dot, filled if unseen and hollow if seen
    - a For review or For context pill
    - a 15 px bold headline
    - a summary clamped to two lines, with "Show more"
    - an "About OnRe issuer" chip
    - a sources chip
  - "Mark all seen" at the end.
  - Footer line: "Updates prompt review and never change a grade automatically."

### 5.3 Compare

- **Main table in the Ondo style, with a sticky first column.** Columns: Position, Evidence rating, Scenario grade, Risk updates, Key assumption, What would change it. Clamp Key assumption and What would change it to three lines with "Show more".
- **Controls:** tabs (All 4, Needs attention 4), a sort select and a Share view button.
- **Evidence comparison matrix:** small state pills, N/A as plain muted text, and group headings as subtle full-width rows.
- **The three expandable sections become accordions:** What could affect your decision, Evidence comparison, Exposure and routes to cash.

### 5.4 Sources

- **Table in the Ondo style, 52 px rows:** ID (monospace), Source (bold title over the publisher in muted text), Group, Observed (monospace date), Record (pill: Retained extract or Reference only), chevron.
- **Controls:** search plus two selects in one row. "What do the source labels mean?" opens a popover. Numbered, centred pagination.
- **Assessment reports:** four white cards in a 2 × 2 grid inside a Panel, each with a Download button, followed by the JSON download link.

### 5.5 Methodology

- **Layout:** a sticky "On this page" contents list on the left at 1024 px and up. Body text column at most 720 px wide, 16 / 26 type.
- **Content:**
  - Keep the four gates as a row of four cards.
  - Every expandable section becomes an accordion, with the first one open.
  - Two-column definition lists become label-above-text pairs, so the text runs wide enough to read.
  - The glossary stays at the end.

## 6. Components

Install:

```
npx shadcn@latest add navigation-menu button badge tabs toggle-group input select table tooltip hover-card popover accordion collapsible card separator pagination scroll-area textarea skeleton
```

Build as project components in `components/ratings/`:

| Component | Job |
|---|---|
| `StatusPill` | Maps an evidence state, Watchlist or update tag to its colours and icon (section 4.5) |
| `GradeCell` | Evidence rating and scenario grade together, enforcing section 4.6 |
| `GateDots` | The four evidence-gate dots, each with a tooltip |
| `SourcesChip` | "3 sources" chip that opens a popover of source IDs and titles |
| `StatStrip` | The six-cell rating status strip |
| `LayerStack` | The Russian Doll dependency list, in full and sidebar sizes |
| `UpdateTimeline` | The Live updates timeline |

## 7. Build order

1. Theme variables, fonts, the nav bar, card and Panel surfaces, `StatusPill` and `GradeCell`. Check every text colour against the contrast table in section 4.2 before moving on.
2. `data/ratings.ts`: typed data taken from the existing build and assessment JSON. Never invent a value; anything unknown becomes `null` and renders as a [CONFIRM] placeholder.
3. Overview.
4. Position page shell: header, status strip, sidebar, tabs.
5. Each tab, in order: Why this grade, Dependencies, Exit routes, Risk factors, Evidence, Live updates.
6. Compare.
7. Sources.
8. Methodology.

After each step, screenshot the page at 1440 px and 390 px wide and compare it against `design-ref/`.

## 8. Open items

- [CONFIRM] Which evidence requirements feed each of the four gate dots.
- [CONFIRM] The status colour set in section 4.5, and the outline button and nav button label in section 4.4.
- [CONFIRM] Which monospace font to use.
- [CONFIRM] Whether "Why this grade" moves from an expander to the first tab.
- [CONFIRM] Three of the four positions have matured. Keep them in the default view as showcase cases with a Matured chip, or filter them out by default.
- Legal review of letter grades is still pending. Keep all grade rendering inside `GradeCell`.
