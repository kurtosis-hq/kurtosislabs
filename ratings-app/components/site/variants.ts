// Ten Ondo-derived style sets for the Ratings site. Every set keeps the same content, brand palette
// and grade display rule; they differ only in structure, surfaces and density. Each one says why.

export type Variant = {
  id: string;
  /* "r2" = the ten Ondo-style sets; "hybrid" = Compact Desk × Row Cards combinations. */
  round: "r2" | "hybrid";
  /* Set only on the live copy; see liveVariant(). */
  base?: string;
  name: string;
  oneLine: string;
  why: { label: string; text: string }[];
  bestFor: string;
  tradeOff: string;
  brandNote: string;
  nav: "ondo" | "floating" | "figma";
  page: "white" | "mist";
  header: "plain" | "wash" | "navy";
  card: "border" | "shadow" | "flat" | "none";
  radius: number;
  rows: "compact" | "regular" | "airy";
  rowStyle: "lines" | "cards";
  /* Row cards only: plain white on a tinted page, or outlined with a 1 px Divider. */
  rowCard?: "flat" | "border";
  chips: "filled" | "outline" | "segmented" | "text";
  /* "kv" is the Figma frames' plain fact row with hairline dividers and no card. */
  summary: "trio" | "kpis" | "kv";
  /* The Figma frames' "No approved grades yet" callout under the header. */
  notice?: boolean;
  tabs: "underline" | "pill" | "segmented";
  headTint: boolean;
  titleSize: number;
};

export const variants: Variant[] = [
  {
    id: "ondo",
    round: "r2",
    name: "Ondo Pure",
    oneLine: "Ondo's Explore page, almost one to one, in Kurtosis colours.",
    why: [
      { label: "Structure", text: "Full-width white top bar with search, three summary cards, then one container holding tabs, filter chips and the table. This is the exact reading order on Ondo: glance at what changed, then scan the list." },
      { label: "Surfaces", text: "White page, 1 px Divider borders, 20 px corners. Borders instead of shadows keep everything flat and quiet, so the only colour left is status." },
      { label: "Density", text: "64 px rows with a round icon, bold name and grey sub-line. Four positions fit on one screen with the summary cards." },
      { label: "Why it fits Ratings", text: "Professionals already know this pattern from trading and tokenised-asset sites, so there is nothing to learn. Price and chart columns are swapped for evidence rating, scenario grade and gates." },
    ],
    bestFor: "First-time visitors who expect a familiar asset-list layout.",
    tradeOff: "Feels closest to a trading product, so the grade rule and footnotes carry more weight.",
    brandNote: "Departs from the brand guide: the top bar is white and full width, not the floating black bar. [CONFIRM]",
    nav: "ondo",
    page: "white",
    header: "plain",
    card: "border",
    radius: 20,
    rows: "regular",
    rowStyle: "lines",
    chips: "filled",
    summary: "trio",
    tabs: "underline",
    headTint: false,
    titleSize: 32,
  },
  {
    id: "brand-bar",
    round: "r2",
    name: "Brand Bar",
    oneLine: "Ondo Pure with the brand's floating black bar. The brand-compliant version.",
    why: [
      { label: "Structure", text: "Same Ondo order: summary trio, then a tabbed container with chips and the table. Search moves out of the top bar into the table toolbar, because the black bar has no room for it." },
      { label: "Surfaces", text: "White page with 1 px borders and 20 px corners. The black bar is the only dark element, so it reads as Kurtosis without adding weight." },
      { label: "Density", text: "64 px rows, same as Ondo Pure." },
      { label: "Why it fits Ratings", text: "Keeps everything people like about Ondo's clarity while following brand guide 4.4 exactly. This is the safest starting point." },
    ],
    bestFor: "Shipping soon with no brand exceptions.",
    tradeOff: "Search is one click further away than on Ondo.",
    brandNote: "Fully within the brand guide.",
    nav: "floating",
    page: "white",
    header: "plain",
    card: "border",
    radius: 20,
    rows: "regular",
    rowStyle: "lines",
    chips: "filled",
    summary: "trio",
    tabs: "underline",
    headTint: false,
    titleSize: 32,
  },
  {
    id: "mist-paper",
    round: "r2",
    name: "Mist & Paper",
    oneLine: "Ondo structure on the brand's own surfaces: white cards on Mist, grouped in a Panel.",
    why: [
      { label: "Structure", text: "Ondo order, but the three summary cards sit together inside one pale navy Panel, as the brand guide asks for grouped cards." },
      { label: "Surfaces", text: "Mist page, borderless white cards with 28 px corners. Separation comes from the tint, not lines, which is softer than Ondo." },
      { label: "Density", text: "64 px rows." },
      { label: "Why it fits Ratings", text: "It is the brand guide's card system applied to Ondo's layout, so it looks like the rest of kurtosislabs.com." },
    ],
    bestFor: "Matching the brand guide's card system most closely.",
    tradeOff: "Slightly lower contrast between cards and page than a bordered layout.",
    brandNote: "Fully within the brand guide.",
    nav: "floating",
    page: "mist",
    header: "wash",
    card: "flat",
    radius: 28,
    rows: "regular",
    rowStyle: "lines",
    chips: "outline",
    summary: "trio",
    tabs: "underline",
    headTint: false,
    titleSize: 40,
  },
  {
    id: "hairline",
    round: "r2",
    name: "Hairline",
    oneLine: "No boxes at all. Sections are separated by thin rules on a white page.",
    why: [
      { label: "Structure", text: "Ondo's order, but the summary trio becomes three columns divided by hairlines, and the table runs straight on the page." },
      { label: "Surfaces", text: "Nothing is boxed. Removing containers takes away the last decoration, so the eye lands on the data." },
      { label: "Density", text: "Airy 76 px rows to make up for the missing card edges." },
      { label: "Why it fits Ratings", text: "The cleanest, most modern option. It reads like a research document, which suits a product that sells explainability." },
    ],
    bestFor: "A calm, editorial feel with the least visual noise.",
    tradeOff: "Groups are less obvious at a glance; spacing has to do all the work.",
    brandNote: "Within the brand guide, though it uses fewer cards than the guide shows.",
    nav: "floating",
    page: "white",
    header: "plain",
    card: "none",
    radius: 0,
    rows: "airy",
    rowStyle: "lines",
    chips: "text",
    summary: "trio",
    tabs: "underline",
    headTint: false,
    titleSize: 48,
  },
  {
    id: "soft-lift",
    round: "r2",
    name: "Soft Lift",
    oneLine: "Borderless white cards lifted by a soft navy shadow on Mist.",
    why: [
      { label: "Structure", text: "Ondo order: summary trio, tabbed table container." },
      { label: "Surfaces", text: "No borders. A very soft navy-tinted shadow lifts each card, the same shadow the brand guide uses on its tiles. It feels current without being flashy." },
      { label: "Density", text: "64 px rows." },
      { label: "Why it fits Ratings", text: "Modern product feel, still quiet. Shadows give depth so the page does not need tints or lines." },
    ],
    bestFor: "A modern SaaS look that stays restrained.",
    tradeOff: "Shadows can look heavy on low-quality screens.",
    brandNote: "Within the brand guide (tile shadow from section 03).",
    nav: "floating",
    page: "mist",
    header: "plain",
    card: "shadow",
    radius: 20,
    rows: "regular",
    rowStyle: "lines",
    chips: "filled",
    summary: "trio",
    tabs: "pill",
    headTint: false,
    titleSize: 40,
  },
  {
    id: "navy-header",
    round: "r2",
    name: "Navy Header",
    oneLine: "Ondo's black banner, rebuilt as a static navy header with the key facts.",
    why: [
      { label: "Structure", text: "A navy band holds the title and four plain facts. The summary cards overlap its bottom edge, then the Ondo table follows." },
      { label: "Surfaces", text: "Navy #0F2D4B is the Ratings product colour. No animation and no marketing words, unlike Ondo's banner." },
      { label: "Density", text: "64 px rows." },
      { label: "Why it fits Ratings", text: "Gives the page a strong, recognisable top while the data below stays white and neutral." },
    ],
    bestFor: "A stronger first impression for the Overview.",
    tradeOff: "The band costs about 160 px before the list starts.",
    brandNote: "Within the brand guide; the navy band is a large surface, so use it on Overview only.",
    nav: "floating",
    page: "mist",
    header: "navy",
    card: "border",
    radius: 20,
    rows: "regular",
    rowStyle: "lines",
    chips: "filled",
    summary: "trio",
    tabs: "underline",
    headTint: false,
    titleSize: 40,
  },
  {
    id: "compact",
    round: "r2",
    name: "Compact Desk",
    oneLine: "A tighter Ondo table for analysts: more columns, shorter rows.",
    why: [
      { label: "Structure", text: "Summary becomes one KPI strip so the table starts higher. Extra columns: evidence gates and evidence counts." },
      { label: "Surfaces", text: "White page, 1 px borders, 12 px corners. Smaller radius matches the denser grid." },
      { label: "Density", text: "52 px rows and 14 px type. All four positions plus the footnotes fit above the fold." },
      { label: "Why it fits Ratings", text: "Risk teams compare many fields side by side; this gives them more on one screen." },
    ],
    bestFor: "Repeat users and risk teams.",
    tradeOff: "Busier at first glance for new visitors.",
    brandNote: "Within the brand guide.",
    nav: "floating",
    page: "white",
    header: "plain",
    card: "border",
    radius: 12,
    rows: "compact",
    rowStyle: "lines",
    chips: "segmented",
    summary: "kpis",
    tabs: "segmented",
    headTint: true,
    titleSize: 32,
  },
  {
    id: "row-cards",
    round: "r2",
    name: "Row Cards",
    oneLine: "Each position is its own rounded row card, like the current Sources list.",
    why: [
      { label: "Structure", text: "Ondo summary trio, then rows that float as separate cards with a gap between them." },
      { label: "Surfaces", text: "Mist page, white row cards with 16 px corners. Each card is one tap target." },
      { label: "Density", text: "Airy 76 px rows. Easy to scan and easy to hit on a tablet or phone." },
      { label: "Why it fits Ratings", text: "With only four positions, giving each its own card makes every one feel considered rather than a line in a long list." },
    ],
    bestFor: "Small lists and touch screens.",
    tradeOff: "Scales less well if the list grows past 20 or so positions.",
    brandNote: "Within the brand guide.",
    nav: "floating",
    page: "mist",
    header: "wash",
    card: "flat",
    radius: 16,
    rows: "airy",
    rowStyle: "cards",
    chips: "outline",
    summary: "trio",
    tabs: "pill",
    headTint: false,
    titleSize: 40,
  },
  {
    id: "sky",
    round: "r2",
    name: "Sky Accent",
    oneLine: "Ondo with a light Sky tint on table headers and selected states.",
    why: [
      { label: "Structure", text: "Ondo order: summary trio, tabbed table container." },
      { label: "Surfaces", text: "Sky tint #E9F3FC on the table header row and active tab. A touch of brand blue makes the structure easier to read without adding a new colour." },
      { label: "Density", text: "64 px rows." },
      { label: "Why it fits Ratings", text: "Friendlier than pure white, still clean. Tints mark structure, pills mark status, so the two never compete." },
    ],
    bestFor: "A warmer, more approachable look.",
    tradeOff: "Tinted headers draw a little attention away from the first row.",
    brandNote: "Within the brand guide.",
    nav: "floating",
    page: "white",
    header: "plain",
    card: "border",
    radius: 20,
    rows: "regular",
    rowStyle: "lines",
    chips: "filled",
    summary: "trio",
    tabs: "pill",
    headTint: true,
    titleSize: 40,
  },
  {
    id: "stat-strip",
    round: "r2",
    name: "Stat Strip",
    oneLine: "A large title and one stat strip replace the three summary cards.",
    why: [
      { label: "Structure", text: "Title, then Elfa's key-value strip (positions, evidence ratings, watchlist, sources, rubric), then the Ondo table." },
      { label: "Surfaces", text: "White page, borders, 20 px corners. One strip is lighter than three cards." },
      { label: "Density", text: "64 px rows." },
      { label: "Why it fits Ratings", text: "The facts that matter most (all NR, one on watchlist) are stated once, plainly, before the list." },
    ],
    bestFor: "Putting the honest headline facts first.",
    tradeOff: "Loses the 'latest updates' preview on the Overview.",
    brandNote: "Within the brand guide.",
    nav: "floating",
    page: "white",
    header: "plain",
    card: "border",
    radius: 20,
    rows: "regular",
    rowStyle: "lines",
    chips: "outline",
    summary: "kpis",
    tabs: "underline",
    headTint: false,
    titleSize: 48,
  },

  /* ---------- Compact Desk × Row Cards ---------- */
  {
    id: "card-desk",
    round: "hybrid",
    name: "Card Desk",
    oneLine: "Compact Desk's dense table, with every row lifted into its own white card on Mist.",
    why: [
      { label: "From Compact Desk", text: "52 px rows, 13 px table text, the KPI strip instead of three summary cards, segmented chips and tabs, and the extra evidence-count column. All four positions plus the footnotes fit above the fold." },
      { label: "From Row Cards", text: "Each position is a separate white card with a 6 px gap on the Mist page, so a row is one obvious tap target and the eye can rest between rows." },
      { label: "Surfaces", text: "Flat white cards, no borders, 12 px corners. On a tinted page the white itself does the separating, so no lines are needed." },
      { label: "Why it fits Ratings", text: "Analysts get the density they want; first-time visitors still see four distinct positions rather than a spreadsheet." },
    ],
    bestFor: "A dense view that still feels friendly on a laptop or tablet.",
    tradeOff: "White-on-Mist separation is softer than a border; on a poor screen the cards can blur together.",
    brandNote: "Within the brand guide.",
    nav: "floating",
    page: "mist",
    header: "wash",
    card: "flat",
    radius: 12,
    rows: "compact",
    rowStyle: "cards",
    rowCard: "flat",
    chips: "segmented",
    summary: "kpis",
    tabs: "segmented",
    headTint: false,
    titleSize: 36,
  },
  {
    id: "outlined-desk",
    round: "hybrid",
    name: "Outlined Desk",
    oneLine: "Compact row cards with a hairline outline on a white page, plus the Figma frames' fact row.",
    why: [
      { label: "From Compact Desk", text: "52 px rows, 13 px text, the extra evidence-count column and a white page with 1 px Divider borders." },
      { label: "From Row Cards", text: "Rows stay separate cards, but outlined instead of filled, so they read on white without any tint." },
      { label: "From the Figma frames", text: "The plain fact row under the title (rubric, rubric date, networks, positions, status) with hairline dividers and no box, and the 'No approved grades yet' notice." },
      { label: "Why it fits Ratings", text: "The cleanest of the three. Everything is outline and type; the only colour left is status, which is exactly where attention should go." },
    ],
    bestFor: "The most minimal, Figma-like reading of the combination.",
    tradeOff: "Lots of thin outlines; at very small sizes they can look busy.",
    brandNote: "Within the brand guide.",
    nav: "floating",
    page: "white",
    header: "plain",
    card: "border",
    radius: 10,
    rows: "compact",
    rowStyle: "cards",
    rowCard: "border",
    chips: "outline",
    summary: "kv",
    notice: true,
    tabs: "underline",
    headTint: false,
    titleSize: 48,
  },
  {
    id: "figma-desk",
    round: "hybrid",
    name: "Figma Desk",
    oneLine: "The Figma frames' white two-level navigation over compact, outlined row cards.",
    why: [
      { label: "From Compact Desk", text: "52 px rows, the KPI-style fact row, segmented filters and the evidence-count column." },
      { label: "From Row Cards", text: "Outlined row cards with a small gap, each one a whole-row link to the assessment." },
      { label: "From the Figma frames", text: "The white Kurtosis Labs product bar with a Ratings sub-navigation underneath, the large title, the fact row and the notice. It keeps the Figma page's calm, document-like top half." },
      { label: "Why it fits Ratings", text: "Ratings sits visibly inside Kurtosis Labs, next to Horizon and Gradient, which helps visitors who arrive from the main site." },
    ],
    bestFor: "Matching the Figma design while making the table denser and more modern.",
    tradeOff: "Two navigation bars cost about 100 px of height on every page.",
    brandNote: "Follows the Figma frames, which depart from the brand guide's floating black bar. [CONFIRM] which one wins.",
    nav: "figma",
    page: "white",
    header: "plain",
    card: "border",
    radius: 10,
    rows: "compact",
    rowStyle: "cards",
    rowCard: "border",
    chips: "segmented",
    summary: "kv",
    notice: true,
    tabs: "underline",
    headTint: false,
    titleSize: 52,
  },
];

export function getVariant(id: string) {
  return variants.find((v) => v.id === id);
}

/* Card Desk is the chosen design (04 Nov 2026). It is served as the real site at /ratings. */
export const LIVE_ID = "card-desk";
export function liveVariant(): Variant {
  return { ...getVariant(LIVE_ID)!, base: "/ratings" };
}

/* Where this variant's pages live: /ratings for the live site, /v/<id> for review copies. */
export function siteBase(v: Variant) {
  return v.base ?? `/v/${v.id}`;
}

export function rowHeight(v: Variant) {
  return { compact: 52, regular: 64, airy: 76 }[v.rows];
}

/* CSS variables the shared components read, so one component tree renders all ten styles. */
export function variantStyle(v: Variant): React.CSSProperties {
  const shadow = "0 4px 14px rgba(15,45,75,.08), 0 1px 3px rgba(15,45,75,.05)";
  return {
    ["--page" as string]: v.page === "white" ? "#ffffff" : "#f4f9fd",
    ["--card-r" as string]: `${v.radius}px`,
    ["--panel-r" as string]: `${v.radius === 0 ? 0 : v.radius + 12}px`,
    ["--card-bw" as string]: v.card === "border" ? "1px" : "0px",
    ["--card-shadow" as string]: v.card === "shadow" ? shadow : "none",
    ["--card-bg" as string]: v.card === "none" ? "transparent" : "#ffffff",
    ["--card-pad" as string]: v.card === "none" ? "0px" : "24px",
    ["--group-bg" as string]: v.card === "flat" ? "#e3e9f0" : "transparent",
    ["--group-pad" as string]: v.card === "flat" ? "12px" : "0px",
    ["--row-h" as string]: `${rowHeight(v)}px`,
    ["--head-bg" as string]: v.headTint ? "#e9f3fc" : "transparent",
    // Clears whichever navigation bar is sticky: floating 24 + 44, Ondo 64, Figma 64 + 44.
    ["--sticky-top" as string]: { floating: "92px", ondo: "84px", figma: "128px" }[v.nav],
  };
}
