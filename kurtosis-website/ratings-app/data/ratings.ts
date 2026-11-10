// Typed access to the assessment data taken from the live Ratings site
// (https://www.kurtosislabs.com/ratings.html, retrieved 04 Nov 2026).
// ratings-data.json is generated from the site's own data files; never hand-edit a value into it.
import raw from "./ratings-data.json";

export type EvidenceState =
  | "supported"
  | "partial"
  | "conflicting"
  | "missing"
  | "unavailable"
  | "stale"
  | "na";

export type Source = {
  id: string;
  title: string;
  publisher: string | null;
  observed: string | null;
  url: string | null;
  limitation: string | null;
};

export type Factor = {
  id: string;
  title: string;
  state: EvidenceState;
  detail: string;
  implication: string | null;
  check: string | null;
  sourceIds: string[];
};

export type EvidenceItem = {
  id: string;
  title: string;
  state: EvidenceState;
  summary: string;
  gap: string | null;
  sourceIds: string[];
};

export type Layer = {
  id: string;
  title: string;
  subtitle: string;
  role: string;
  parentId: string | null;
  description: string;
  risk: string;
  sourceIds: string[];
};

export type RouteStep = {
  title: string;
  input: string;
  output: string;
  condition: string;
  risk: string;
  sourceIds: string[];
};

export type Route = { id: string; label: string; summary: string; steps: RouteStep[] };

export type Gate = { id: "rights" | "backing" | "payoff" | "cash"; state: string; finding: string };

export type Position = {
  slug: string;
  symbol: string;
  name: string;
  tokenType: string;
  network: string;
  protocol: string;
  layer: "pt" | "rwa";
  maturity: string | null;
  maturityExact: string | null;
  summary: string;
  matured: boolean;
  maturityLabel: string;
  evidenceDate: string;
  asOf: string;
  rubric: string;
  mint: string;
  market: string | null;
  lane: string;
  lossObject: string;
  identityBasis: string;
  evidenceRating: "NR";
  ratingLabel: string;
  confidence: string;
  scenarioGrade: string;
  scenarioName: string;
  scenarioSummary: string;
  keyAssumption: string;
  changeTrigger: string;
  scenarioAssumptions: string[];
  previousGrade: string | null;
  changeReason: string | null;
  actualRisk: string;
  positiveEvidence: string;
  missingEvidence: string;
  whyNotCCC: string | null;
  whyNotB: string | null;
  bottomLine: string;
  evidenceGapLine: string;
  beforeCommit: { title: string; detail: string };
  watchlist: boolean;
  gates: Gate[];
  keyRisks: { id: string; title: string; implication: string; state: EvidenceState | null }[];
  factors: Factor[];
  evidence: EvidenceItem[];
  layers: Layer[];
  routes: Route[];
  scopeAssumptions: string[];
  approvalsNeeded: string[];
  counts: { conflicting: number; missing: number; partial: number; total: number };
  sources: Source[];
};

export type Requirement = {
  id: string;
  title: string;
  group: "position" | "underlying";
  appliesTo: string[];
  naReason: string | null;
};

export type LibrarySource = Source & { group: "onyc" | "exponent" | "susdai" | "other"; retained: boolean };

export const positions = raw.positions as Position[];
export const meta = raw.meta;
// The 16 evidence requirements on the live Compare page, in its order.
export const requirements = raw.requirements as Requirement[];
// The 71 dated sources in the live Sources register.
export const library = raw.library as LibrarySource[];
export const sourceGroups: Record<LibrarySource["group"], string> = {
  onyc: "ONyc / OnRe",
  exponent: "Exponent",
  susdai: "PT-sUSDai",
  other: "Other sources",
};

export function requirementState(p: Position, r: Requirement): EvidenceState {
  if (!r.appliesTo.includes(p.slug)) return "na";
  return p.evidence.find((e) => e.id === r.id)?.state ?? "missing";
}

export const RUBRIC = "kurtosis-underwriting.v3";
export const RUBRIC_DATE = "25 Oct 2026";

export const icons: Record<string, string> = {
  onyc: "/assets/tok-onyc.png",
  "pt-onyc": "/assets/tok-onyc.png",
  "pt-sronyc": "/assets/tok-sronyc.png",
  "pt-susdai": "/assets/tok-susdai.png",
};

export const gateLabels: Record<Gate["id"], string> = {
  rights: "Holder rights",
  backing: "Backing",
  payoff: "Token payoff",
  cash: "Cash access",
};

export function getPosition(slug: string) {
  return positions.find((p) => p.slug === slug);
}

export function sourceById(p: Position, id: string) {
  return p.sources.find((s) => s.id === id);
}

// Saved developments shown on the live ONyc page (design-ref, 03 Nov 2026).
// The live feed could not refresh, so these are the only updates on record.
export const updates = [
  {
    position: "onyc",
    tag: "context" as const,
    at: "29 Oct, 20:45 UTC",
    rel: "6d",
    headline: "OnRe fixed-rate loans surpass $10 million on Kamino",
    about: "About OnRe issuer",
    summary:
      "OnRe says more than $10 million in fixed-rate loans are active in its Kamino market, using rolling 30-day terms for reinsurance-backed strategies. A second account describes the fixed-rate reserves and related USDC vault use.",
    sources: ["X · @kamino", "X · @0xMC2", "X · @onrefinance"],
    seen: false,
  },
  {
    position: "onyc",
    tag: "review" as const,
    at: "26 Oct, 17:18 UTC",
    rel: "9d",
    headline: "Exponent and OnRe renew $8,000 in ONyc and srONyc trading rewards",
    about: "About OnRe issuer",
    summary:
      "Exponent and OnRe have renewed rewards for ONyc and srONyc limit orders and srONyc liquidity provision, with $6,000 allocated to limit orders and $2,000 to liquidity. The promotion runs through November 22–23 and advertises up to 60% APY.",
    sources: ["X · @ExponentFinance", "X · @onrefinance", "X · @_incept1on"],
    seen: false,
  },
];

// Temporarily hide research-preview labels and the accompanying notes on the live
// Ratings pages. Keep their copy and components below; set true to restore them.
export const SHOW_RESEARCH_NOTICES = false;

export const SCENARIO_NOTE =
  "Scenario letters reflect unverified assumptions, not established differences in current credit quality.";
export const MISSING_NOTE =
  "Missing information establishes neither distress nor safety. Live updates prompt review and never change a grade automatically.";
export const DISCLAIMER = "Ratings are research, not investment advice.";

/* ---------- Position page extras ----------
   Text below is copied from the live position pages (kurtosislabs.com/ratings.html, captured 08 Nov 2026):
   the Evidence tab's "Evidence still needed" lines and each page's saved Live updates and coverage.
   The live feed could not refresh, so these are the saved snapshot retrieved 30 Oct, 03:58 UTC. */

export type Update = {
  tag: "context" | "review";
  kind: "protocol" | "other";
  at: string;
  headline: string;
  about: string;
  summary: string;
  sources: string[];
  history: string;
};

const U = {
  onreLoans: { tag: "context", kind: "protocol", at: "29 Oct, 20:45 UTC", headline: "OnRe fixed-rate loans surpass $10 million on Kamino", about: "About OnRe issuer", summary: "OnRe says more than $10 million in fixed-rate loans are active in its Kamino market, using rolling 30-day terms for reinsurance-backed strategies. A second account describes the fixed-rate reserves and related USDC vault use.", sources: ["X · @kamino", "X · @0xMC2", "X · @onrefinance"], history: "Revision 2" },
  rewards: { tag: "review", kind: "protocol", at: "26 Oct, 17:18 UTC", headline: "Exponent and OnRe renew $8,000 in ONyc and srONyc trading rewards", about: "About OnRe issuer · About Exponent Finance", summary: "Exponent and OnRe have renewed rewards for ONyc and srONyc limit orders and srONyc liquidity provision, with $6,000 allocated to limit orders and $2,000 to liquidity. The promotion runs through 22–23 November and advertises up to 60% APY.", sources: ["X · @ExponentFinance", "X · @onrefinance", "X · @_incept1on"], history: "" },
  bulk: { tag: "context", kind: "protocol", at: "26 Oct, 13:35 UTC", headline: "BulkTrade will close its BulkSOL market on Exponent and redirect AURA rewards to BULK Exchange", about: "About Exponent Finance", summary: "BulkTrade says the BulkSOL market on Exponent will close at the end of the current maturity. After 31 October, the AURA pool currently rewarding stakers weekly will instead reward activity on BULK Exchange.", sources: ["X · @ExponentFinance", "X · @bulktrade", "X · @SneakypeekSol"], history: "" },
  fxsave: { tag: "context", kind: "protocol", at: "27 Oct, 13:33 UTC", headline: "Pendle opens a new fxSAVE market with FXN incentives", about: "About Pendle protocol", summary: "A new Pendle market for f(x)’s fxSAVE is live, offering FXN incentives and advertised yields of 64% APY for LPs, 28.45% for YT, and 6.7% fixed for PT. One post notes that the headline LP yield includes incentives and may not persist.", sources: ["X · @PhilMrlo", "X · @leonZR1394"], history: "Revision 7" },
  buybacks: { tag: "review", kind: "protocol", at: "27 Oct, 10:17 UTC", headline: "Pendle buybacks top 3 million PENDLE, running about six times above V2 emissions", about: "About Pendle protocol", summary: "Pendle says it has bought back more than 3 million PENDLE in roughly eight months, with buybacks running at about six times V2 emissions. The purchased tokens are distributed to eligible sPENDLE stakers rather than burned, and buybacks are funded by protocol fees.", sources: ["X · @pendle_fi", "X · @DeFi_Andree"], history: "Revision 6" },
  loop: { tag: "context", kind: "protocol", at: "26 Oct, 13:57 UTC", headline: "Pendle Loop waives fees on non-PT asset looping through year-end", about: "About Pendle protocol", summary: "Pendle Loop is offering zero-fee looping on non-PT assets through the end of the year, with promoted maximum APYs including about 68% on apyUSD. The posts describe access through Pendle alongside lending protocols including Morpho and Aave.", sources: ["X · @PendleIntern", "X · @0xgilllee", "X · @yield"], history: "Revision 3" },
  stocks: { tag: "context", kind: "protocol", at: "24 Oct, 09:57 UTC", headline: "Pendle enables leveraged tokenised-stock exposure using Aave borrowing on Base", about: "About Pendle protocol", summary: "Tokenised shares on Base can now be used to build roughly 2x–3x leveraged positions through Pendle, with USDC borrowing supplied by Aave. The posts describe the shift from simply holding tokenised shares to using them as collateral within DeFi.", sources: ["X · @GpaAndy", "X · @MeshClans", "X · @Defi_Maestro", "X · @2xnmore", "X · @madame1829", "X · @WilcosX", "X · @0xkyliekim", "X · @Dadivan_sol", "X · @TheCryptoSquire"], history: "Revision 4" },
  rwa: { tag: "context", kind: "other", at: "23 Oct, 12:49 UTC", headline: "RWA lending deployment remains a small share of onchain assets", about: "Also mentions Pendle protocol", summary: "Two posts cite DeFiLlama figures showing roughly $31B in active onchain real-world assets, with about 14% deployed in DeFi. They describe lending and borrowing against tokenised assets as a developing use case, with capital concentrated across several lending protocols.", sources: ["X · @yannisDeFi", "X · @Eliteonchain"], history: "" },
  ngi: { tag: "context", kind: "protocol", at: "23 Oct, 09:55 UTC", headline: "Pendle offers fixed-rate exposure to Partners Group’s infrastructure fund onchain", about: "About Pendle protocol", summary: "Asseto Finance says NGI+ on Pendle lets users lock in a fixed rate on Partners Group’s infrastructure fund through PT, while separating NAV growth through YT. A second post highlights the fixed-rate onchain product.", sources: ["X · @pendle_fi", "X · @DarkLord_gr"], history: "" },
} satisfies Record<string, Update>;

const PT_NOTE = "This PT series has no direct coverage. Updates follow its underlying assets and dependencies; they do not verify this maturity’s settlement.";
const ONRE_COVERAGE = [
  { kind: "Underlying asset group", name: "ONyc family", count: 0 },
  { kind: "Issuer", name: "OnRe issuer", count: 2 },
];

export type PositionExtras = {
  evidenceNeeded: string[];
  updates: Update[];
  coverage: { kind: string; name: string; count: number }[];
  coverageNote: string | null;
};

export const extras: Record<string, PositionExtras> = {
  onyc: {
    evidenceNeeded: [
      "Signed holder rights and claim priority; current treaty reserves and claims.",
      "Latest attestation contents, valuation reconciliation and a complete USDC cash exit.",
    ],
    updates: [U.onreLoans, U.rewards],
    coverage: ONRE_COVERAGE,
    coverageNote: null,
  },
  "pt-onyc": {
    evidenceNeeded: [
      "ONyc reserves and holder rights; reconcile PT supply counters.",
      "Validate the exact PT payoff and every conversion through to USDC.",
    ],
    updates: [U.onreLoans, U.rewards, U.bulk],
    coverage: [...ONRE_COVERAGE, { kind: "Protocol", name: "Exponent Finance", count: 2 }],
    coverageNote: PT_NOTE,
  },
  "pt-sronyc": {
    evidenceNeeded: [
      "ONyc reserves and holder rights; reconcile PT supply counters.",
      "Validate senior loss protection, withdrawal locks and every cash-exit leg.",
    ],
    updates: [U.onreLoans, U.rewards, U.bulk],
    coverage: [...ONRE_COVERAGE, { kind: "Protocol", name: "Exponent Finance", count: 2 }],
    coverageNote: PT_NOTE,
  },
  "pt-susdai": {
    evidenceNeeded: [
      "Current loan performance and recovery values; reserve and bridge reconciliation.",
      "Validate withdrawal cash after commitments, PT impairment and a funded-holder USDC exit.",
    ],
    updates: [U.fxsave, U.buybacks, U.loop, U.stocks, U.rwa, U.ngi],
    coverage: [
      { kind: "Underlying asset group", name: "USDai / sUSDai family", count: 0 },
      { kind: "Protocol", name: "Pendle protocol", count: 6 },
    ],
    coverageNote: PT_NOTE,
  },
};

export const UPDATES_RETRIEVED = "30 Oct, 03:58 UTC";
export const UPDATES_WINDOW = "23 Oct – 30 Oct, 03:58 UTC";

/* Overview table copy, as written in the Figma frame "Ratings / Overview — Desktop" (Position tabs page). */
export const overviewRow: Record<string, { subtitle: string; risk: string }> = {
  onyc: { subtitle: "NAV-based token", risk: "Insurance claims, reserve adequacy and restricted redemption access" },
  "pt-onyc": { subtitle: "Principal token", risk: "ONyc exposure plus exact-series conversion and execution risk" },
  "pt-sronyc": { subtitle: "Senior principal token", risk: "ONyc exposure, finite junior protection and recovery-state withdrawal limits" },
  "pt-susdai": { subtitle: "Principal token · Pendle", risk: "GPU private credit, agent-led recoveries and cash-dependent epoch withdrawals" },
};
