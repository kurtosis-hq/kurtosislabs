import onycPacket from '../data/research/onyc-evidence.json' with { type: 'json' };
import exponentPacket from '../data/research/exponent-evidence.json' with { type: 'json' };
import ptSusdaiPacket from '../data/research/pt-susdai-evidence.json' with { type: 'json' };
import { ptSusdaiAssessment } from '../data/pt-susdai.ts';

/** A research projection, not a complete canonical rating record or score engine. */
export type EvidenceState = 'complete' | 'partial' | 'stale' | 'contradictory' | 'missing' | 'unevaluable';
export type Source = {
  id: string; title: string; url: string; publisher: string;
  observedAt: string; limitation?: string;
};
export type EvidenceArea = {
  id: string; title: string; state: EvidenceState; summary: string;
  gap: string; sourceIds: string[];
};
export type RiskFactor = {
  id: string; title: string; detail: string; sourceIds: string[]; state: EvidenceState;
};
export type Layer = {
  id: string; title: string; subtitle: string; role: 'held' | 'D' | 'S' | 'R';
  description: string; risk: string; sourceIds: string[]; parentId?: string;
};
export type Route = {
  id: 'entry' | 'settlement' | 'early' | 'stress'; label: string; summary: string;
  steps: { title: string; input: string; output: string; condition: string; risk: string; sourceIds: string[] }[];
};
export type Assessment = {
  id: 'onyc' | 'pt-onyc' | 'pt-sronyc' | 'pt-susdai'; symbol: string; name: string;
  type: string; protocol: string; chain: string; maturity: string | null;
  mint: string; market: string | null; identityBasis: string; summary: string;
  blocker: string; lane: string; lossObject: string; disposition: 'NO_RATE';
  approvedScore: null; approvedGrade: null; approvedConfidence: null;
  indicatedScore: null; indicatedGrade: null; observedAt: string;
  approvalStatus?: 'NOT APPROVED'; watchlist?: boolean; indicatedEvidenceConfidence?: 'Low';
  methodologyVersion: string; scopeAssumptions: string[]; factors: RiskFactor[];
  layers: Layer[]; evidence: EvidenceArea[]; routes: Route[]; sourceIds: string[];
};

type PacketSource = {
  id: string; title: string; url: string; observed_at: string;
  publisher?: string; limitation?: string; kind?: string;
};

function projectSource(source: PacketSource): Source {
  const publisher = source.publisher ?? (
    source.id === 'ONRE-AUG' ? 'OnRe' : source.id === 'EXP-AUDIT-SEC3' ? 'Sec3' :
    source.id === 'EXP-AUDIT-ACCRETION' ? 'Accretion' : 'Exponent'
  );
  const limitation = source.limitation ?? (
    source.kind === 'protocol_api' ? 'Publisher API snapshot.' :
    source.kind === 'audit_report' || source.kind === 'independent_audit' ? 'Report inspected; correspondence to the active deployed code remains unverified.' :
    'Describes the publisher’s reported mechanics or findings; exact-route applicability and current state require separate verification.'
  );
  return { id: source.id, title: source.title, url: source.url, publisher, observedAt: source.observed_at, limitation };
}

export const sources: Source[] = [
  ...onycPacket.sources.map(projectSource),
  ...exponentPacket.sources.map(projectSource),
  ...ptSusdaiPacket.sources.map(projectSource),
];

export const gradeLadder = [
  { grade: 'A', min: 0, max: 0.5, classification: 'Investment grade' },
  { grade: 'BBB', min: 0.5, max: 0.75, classification: 'Investment grade' },
  { grade: 'BB', min: 0.75, max: 1, classification: 'Speculative grade' },
  { grade: 'B', min: 1, max: 1.5, classification: 'Speculative grade' },
  { grade: 'CCC', min: 1.5, max: 2, classification: 'Speculative grade' },
  { grade: 'CC', min: 2, max: 2.5, classification: 'Speculative grade' },
  { grade: 'C', min: 2.5, max: 3, classification: 'Speculative grade' },
  { grade: 'D', min: 3, max: null, classification: 'Uninvestable' },
] as const;

const noRating = {
  disposition: 'NO_RATE' as const,
  approvedScore: null, approvedGrade: null, approvedConfidence: null,
  indicatedScore: null, indicatedGrade: null, methodologyVersion: 'v0.3-alpha',
};

const commonAssumptions = [
  'Unlevered holding. Lending, borrowing and Kamino looping are outside this assessment.',
  'Position size, wallet custody and investor eligibility are unspecified; no size-specific liquidity conclusion is available.',
  'USDC is the comparison cash destination, an analytical assumption rather than a confirmed payout or executable route.',
  'Evidence is a research snapshot. Source observation dates differ; refreshing this page does not refresh the evidence.',
  'Layer roles are proposed analytical treatments. The materiality review, score formation and independent approval remain incomplete.',
];

function underlyingFactors(): RiskFactor[] {
  return [
    { id: 'claim', title: 'Holder rights remain unverified', state: 'partial',
      detail: 'OnRe describes an interest in a segregated reinsurance account. Signed participation terms, account identity and insolvency priority were not obtained.', sourceIds: ['ON-S01', 'ON-S10'] },
    { id: 'substance', title: 'The current loss-bearing portfolio is incomplete', state: 'partial',
      detail: 'Premium income and collateral returns are exposed to claims, expenses and reserve changes. Current positions, reserve adequacy and collateral weights are not established.', sourceIds: ['ON-S08', 'ON-S11', 'ON-S03'] },
    { id: 'valuation', title: 'Economic NAV and offer pricing need reconciliation', state: 'contradictory',
      detail: 'Reporting describes economic NAV updates; the technical reference describes stored pricing inputs. How realized or reserved losses reach executable mint and redemption prices remains unresolved.', sourceIds: ['ON-S02', 'ON-S08', 'ON-S09'] },
    { id: 'exit', title: 'An issuer queue is not immediate cash', state: 'partial',
      detail: 'Primary exit depends on eligibility, payout-wallet checks and available settlement assets. A pending request remains exposed to ONyc; secondary-sale capacity is unmeasured.', sourceIds: ['ON-S05', 'ON-S06'] },
    { id: 'controls', title: 'Control and audit coverage stop short of deployment', state: 'partial',
      detail: 'OnRe documents upgrade, freeze, fee and pause powers. The inspected OtterSec report does not establish the active deployment, signer configuration or current reserve custody.', sourceIds: ['ON-S07', 'ON-S14'] },
  ];
}

function underlyingEvidence(): EvidenceArea[] {
  return [
    { id: 'legal', title: 'Legal claim and account segregation', state: 'partial', summary: 'Issuer documentation describes segregated-account participation.', gap: 'Obtain signed terms, holder class, account identity, recovery priority and entity/license mapping.', sourceIds: ['ON-S01', 'ON-S10', 'ON-S21', 'ON-S22'] },
    { id: 'portfolio', title: 'Underwriting and collateral', state: 'partial', summary: 'Portfolio policy and eight collateral candidates are disclosed; current balances and weights are absent.', gap: 'Obtain dated holdings, claims/reserves, concentrations and stress losses. Do not treat the undated deal screenshot as current holdings.', sourceIds: ['ON-S03', 'ON-S08', 'ON-S11', 'ON-S12'] },
    { id: 'nav', title: 'NAV and loss transmission', state: 'contradictory', summary: 'Economic reporting and contract-price descriptions have not been reconciled.', gap: 'Trace claims and collateral impairments into the actual pricing parameters and downstream oracle consumption.', sourceIds: ['ON-S02', 'ON-S08', 'ON-S09'] },
    { id: 'attestation', title: 'Independent financial assurance', state: 'unevaluable', summary: 'The issuer index links Apex reports through June 2026. The June report content could not be inspected.', gap: 'Obtain the actual report, scope, effective date, balances and exceptions, plus subsequent reporting.', sourceIds: ['ON-S15', 'ON-S16'] },
    { id: 'control', title: 'Code, custody and administrative powers', state: 'partial', summary: 'Issuer controls and the July 2026 OtterSec review are available as research evidence.', gap: 'Match audited code to deployment; verify authorities, signer independence, timelock and reserve custody.', sourceIds: ['ON-S07', 'ON-S14'] },
    { id: 'liquidity', title: 'Executable redemption and secondary exit', state: 'partial', summary: 'The documented redemption path uses an eligibility gate and a liquidity-managed queue.', gap: 'Verify queue accounts, payout asset, delays, fee behavior and executable quotes for the intended size.', sourceIds: ['ON-S05', 'ON-S06'] },
  ];
}

/** Parent IDs express display ancestry; roles remain proposed, not approved scoring attribution. */
function underlyingLayers(parentId?: string): Layer[] {
  return [
    { id: 'onyc-token', title: 'ONyc', subtitle: 'NAV-based token', role: parentId ? 'D' : 'held', ...(parentId ? { parentId } : {}),
      description: 'OnRe describes a token interest whose value follows a segregated reinsurance account.', risk: 'Participation rights, pricing and redemption controls remain material.', sourceIds: ['ON-S01', 'ON-S02', 'ON-S10'] },
    { id: 'onre-account', title: 'OnRe segregated account', subtitle: 'Economic claim and account', role: 'D', parentId: 'onyc-token',
      description: 'Account economics combine underwriting results and the assets supporting obligations and liquidity.', risk: 'The signed account-specific claim and recovery priority have not been verified.', sourceIds: ['ON-S01', 'ON-S10'] },
    { id: 'reinsurance', title: 'Reinsurance exposures', subtitle: 'Premiums, claims and reserves', role: 'D', parentId: 'onre-account',
      description: 'The issuer describes specialty and catastrophe exposures. Premiums are reduced by claims, expenses and reserving.', risk: 'Current exposures, concentrations, IBNR and modeled stress losses are incomplete.', sourceIds: ['ON-S08', 'ON-S11'] },
    { id: 'collateral', title: 'Collateral and liquidity assets', subtitle: 'Same account, separate economic function', role: 'D', parentId: 'onre-account',
      description: 'Issuer-listed candidates include T-bills, sUSDe, syrupUSDC, USCC, USDC, USDG, sUSDS and USYC. Weights are unknown.', risk: 'This branch supports the underwriting structure; it is not a second reserve total to add to exposures.', sourceIds: ['ON-S03', 'ON-S08'] },
    { id: 'onre-control', title: 'OnRe valuation and administration', subtitle: 'Shared control condition', role: 'S', parentId: 'onre-account',
      description: 'NAV reporting, price updates and administrative authority can affect several layers together.', risk: 'Common control failures must be retained once with their affected pathways; deployed powers remain unverified.', sourceIds: ['ON-S02', 'ON-S07', 'ON-S08', 'ON-S09'] },
  ];
}

const onycIssuerExit: Route['steps'] = [
  { title: 'Request issuer redemption', input: 'ONyc', output: 'Pending redemption request', condition: 'Eligible investor, completed checks and verified payout wallet.', risk: 'Queue acceptance is not a cash payout; ONyc exposure continues before execution.', sourceIds: ['ON-S05', 'ON-S06'] },
  { title: 'Execute against available liquidity', input: 'Pending redemption request', output: 'Available USDC or USDG; verify actual offer', condition: 'Issuer liquidity, queue processing and execution-time offer price.', risk: 'Timing, price, fee behavior and available size are unverified for this position.', sourceIds: ['ON-S05'] },
  { title: 'Reach the comparison cash asset', input: 'Settlement asset received', output: 'USDC, if available through the selected route', condition: 'If paid in another asset, a separately executable conversion is required.', risk: 'No additional conversion quote, capacity or fee has been verified.', sourceIds: ['ON-S05'] },
];

const onycSecondaryStep: Route['steps'][number] = {
  title: 'Sell ONyc on a secondary venue', input: 'ONyc', output: 'Quoted settlement asset; unverified',
  condition: 'An available market and size-specific quote, followed by conversion to USDC where needed.',
  risk: 'Issuer redemption access does not establish secondary depth. A stressed sale may be costly or unavailable.',
  sourceIds: ['ON-S05', 'ON-S06'],
};

const onycRoutes: Route[] = [
  { id: 'entry', label: 'Acquire', summary: 'Primary minting and secondary acquisition have different access requirements.', steps: [
    { title: 'Choose an access path', input: 'USDC or USDG for primary mint', output: 'ONyc', condition: 'Use the issuer-supported mint path and its applicable onboarding; a secondary purchase uses its own quote.', risk: 'The wallet, access mode and size-specific execution have not been established.', sourceIds: ['ON-S04', 'ON-S06'] },
  ] },
  { id: 'settlement', label: 'Issuer redemption', summary: 'ONyc has no PT maturity. Eligible issuer redemption depends on queue and settlement liquidity.', steps: onycIssuerExit },
  { id: 'early', label: 'Secondary sale', summary: 'A secondary exit is distinct from an issuer redemption request.', steps: [onycSecondaryStep] },
  { id: 'stress', label: 'Stress exit', summary: 'A delayed issuer payout and impaired secondary market can coincide with a NAV loss.', steps: [
    { title: 'Recognize impairment', input: 'ONyc exposure', output: 'Revised economic claim', condition: 'Claims, reserve revisions or collateral losses affect account value.', risk: 'Loss recognition in NAV and executable offer prices remains unresolved.', sourceIds: ['ON-S08', 'ON-S02', 'ON-S03'] },
    { ...onycIssuerExit[1], title: 'Reassess queue availability' },
    { ...onycSecondaryStep, title: 'Test secondary fallback capacity' },
  ] },
];

function septemberMarket(symbol: 'ONyc' | 'srONyc') {
  const market = exponentPacket.candidate_markets.find((candidate) => candidate.series === `${symbol}-10SEPT26`);
  if (!market) throw new Error(`Missing research evidence for ${symbol} September series`);
  return market;
}

function ptFactors(senior: boolean): RiskFactor[] {
  return [
    ...(senior ? [{ id: 'waterfall', title: 'First-loss protection is conditional', state: 'partial' as const,
      detail: 'Junior capital absorbs losses first, but senior value can be impaired after that capacity is exhausted. A publisher buffer snapshot does not establish protection for the holding period.', sourceIds: ['EXP-TRANCHES', 'EXP-WATERFALL', 'EXP-API-TRANCHING'] },
    { id: 'recovery', title: 'Maturity can arrive during a withdrawal pause', state: 'partial' as const,
      detail: 'Documented recovery mechanics can pause senior withdrawals. The exact PT settlement path through a recovery state has not been simulated.', sourceIds: ['EXP-WATERFALL', 'EXP-API-MARKETS'] }] : []),
    { id: 'pt-settlement', title: 'PT maturity is not an immediate dollar payout', state: 'partial',
      detail: `The selected series has USD accounting metadata and ${senior ? 'srONyc' : 'ONyc'} underlying exposure. Exact conversion units, impairment handling and cash output remain unverified.`, sourceIds: ['EXP-API-MARKETS', 'EXP-API-VAULTS', 'EXP-YIELD'] },
    { id: 'pt-exit', title: 'Early exit depends on market capacity', state: 'partial',
      detail: 'A secondary sale needs a size-specific quote. Publisher TVL, pooled liquidity and implied yield do not establish an executable exit or a realized return.', sourceIds: ['EXP-FEES', 'EXP-API-POOLS'] },
    { id: 'pt-control', title: 'Exponent adds mutable execution dependencies', state: 'partial',
      detail: 'Program administration and wrapper execution affect the route. Current deployed code, authorities and audit correspondence have not been independently matched.', sourceIds: ['EXP-SECURITY', 'EXP-AUDITS', ...(senior ? ['EXP-AUDIT-SEC3', 'EXP-AUDIT-ACCRETION'] : [])] },
    ...underlyingFactors().slice(0, 3),
  ];
}

function ptEvidence(senior: boolean): EvidenceArea[] {
  return [
    { id: 'market', title: 'PT series and account identities', state: 'partial', summary: 'September PT, YT, SY and vault identities agree across the inspected publisher endpoints.', gap: 'Confirm the intended maturity, independently verify finalized accounts, and fix investor size, custody and horizon.', sourceIds: ['EXP-API-MARKETS', 'EXP-API-VAULTS', 'EXP-API-POOLS'] },
    { id: 'conversion', title: 'PT redemption and conversion', state: 'partial', summary: 'Yield stripping mechanics and USD accounting metadata are documented.', gap: `Simulate the exact PT-to-${senior ? 'srONyc' : 'ONyc'} path, conversion rate, impairment and downstream cash exit.`, sourceIds: ['EXP-YIELD', 'EXP-API-MARKETS'] },
    ...(senior ? [{ id: 'tranche', title: 'Senior loss waterfall and recovery', state: 'partial' as const, summary: 'Documentation and a publisher snapshot identify senior/junior NAV and configured protection mechanics.', gap: 'Verify active state, synchronization, loss allocation and maturity during a recovery pause. Score relief needs an approved methodology change.', sourceIds: ['EXP-TRANCHES', 'EXP-WATERFALL', 'EXP-API-TRANCHING'] }] : []),
    { id: 'exponent-control', title: 'Exponent deployment and controls', state: 'partial', summary: senior ? 'Sec3 and Accretion tranching reports were inspected; neither has been matched to active deployed code.' : 'The protocol publishes security documentation and an audit register.', gap: 'Verify binary versions, upgrade authorities, signer threshold and timelock; reconcile applicable audit scope and findings.', sourceIds: senior ? ['EXP-SECURITY', 'EXP-AUDIT-SEC3', 'EXP-AUDIT-ACCRETION'] : ['EXP-SECURITY', 'EXP-AUDITS'] },
    { id: 'pt-liquidity', title: 'Executable PT exit', state: 'missing', summary: 'Publisher liquidity metadata exists, but no executable quote for the intended size was obtained.', gap: 'Measure normal/stress depth, fees and fallback capacity for every leg to the chosen cash asset.', sourceIds: ['EXP-API-POOLS', 'EXP-FEES'] },
    ...underlyingEvidence(),
  ];
}

function ptLayers(senior: boolean): Layer[] {
  const base = senior ? 'srONyc' : 'ONyc';
  return [
    { id: 'pt', title: `PT-${base}`, subtitle: '10 Sep 2026 · principal token', role: 'held', description: 'Principal token for the 10 September 2026 series.', risk: 'Payoff requires maturity execution and the underlying realization path.', sourceIds: ['EXP-API-MARKETS', 'EXP-YIELD'] },
    { id: 'sy', title: senior ? 'wsrONyc / Exponent vault' : 'wONyc / Exponent vault', subtitle: 'Candidate wrapper layer', role: 'D', parentId: 'pt', description: `Publisher metadata links the series to the ${base} wrapper and vault. Whether this warrants its own scoring layer is under review.`, risk: 'Conversion rates, accounting denomination and deployment need verification.', sourceIds: ['EXP-API-MARKETS', 'EXP-API-VAULTS'] },
    ...(senior ? [
      { id: 'senior', title: 'srONyc', subtitle: 'Senior tranche claim', role: 'D' as const, parentId: 'sy', description: 'Senior NAV depends on the ONyc pool and the loss-allocation mechanism.', risk: 'Protection is finite; recovery or settlement conditions can constrain realization.', sourceIds: ['EXP-TRANCHES', 'EXP-WATERFALL'] },
      { id: 'junior', title: 'jrONyc first-loss capital', subtitle: 'Protection dependency · not a held asset', role: 'S' as const, parentId: 'senior', description: 'Junior capital bears losses ahead of senior capital under documented tranche mechanics.', risk: 'Capacity can deplete. This is not extra collateral owned by the PT holder or an approved score reduction.', sourceIds: ['EXP-TRANCHES', 'EXP-WATERFALL', 'EXP-API-TRANCHING'] },
    ] : []),
    ...underlyingLayers(senior ? 'senior' : 'sy'),
    { id: 'exponent-control', title: 'Exponent programs and administration', subtitle: 'Shared execution/control condition', role: 'S', parentId: 'pt', description: 'Shared control failures can affect wrapping, yield stripping and, where applicable, tranching.', risk: 'A repeated failure condition is assessed once and attached to the affected layers; program-specific faults may differ.', sourceIds: ['EXP-SECURITY', 'EXP-YIELD', ...(senior ? ['EXP-WATERFALL'] : [])] },
    { id: 'pt-market', title: 'PT secondary market', subtitle: 'Early-exit route dependency', role: 'R', parentId: 'pt', description: 'An alternative sale depends on market counterparties and execution at the chosen size.', risk: 'Displayed liquidity is not measured cash-exit capacity.', sourceIds: ['EXP-FEES', 'EXP-API-POOLS'] },
  ];
}

function ptRoutes(senior: boolean): Route[] {
  const base = senior ? 'srONyc' : 'ONyc';
  const unwrap: Route['steps'][number] = {
    title: 'Redeem the matured principal token', input: `PT-${base} · September series`, output: `${base} is the candidate underlying output; unverified`,
    condition: 'Maturity reached, exact vault and conversion path executable.', risk: 'USD accounting metadata does not establish a USDC payout or one underlying token per PT.', sourceIds: ['EXP-YIELD', 'EXP-API-MARKETS', 'EXP-API-VAULTS'],
  };
  const seniorWithdrawal: Route['steps'][number] = {
    title: 'Realize the senior claim', input: 'srONyc', output: 'ONyc through the applicable withdrawal path',
    condition: 'Tranche state permits withdrawal and NAV has synchronized.', risk: 'Recovery may pause withdrawals; the active-state mapping and actual output have not been independently verified.', sourceIds: ['EXP-TRANCHES', 'EXP-WATERFALL', 'EXP-API-TRANCHING'],
  };
  return [
    { id: 'entry', label: 'Acquire', summary: `Buying an existing PT-${base} does not require manually building every underlying layer.`, steps: [
      { title: 'Buy the selected September PT', input: 'Quoted purchase asset; exact route unverified', output: `PT-${base} · 10 Sep 2026`, condition: 'Correct PT mint, executable quote and sufficient market capacity.', risk: 'Quote size, slippage and any input conversion have not been measured.', sourceIds: ['EXP-YIELD', 'EXP-API-MARKETS', 'EXP-API-POOLS'] },
    ] },
    { id: 'settlement', label: 'At maturity', summary: 'Maturity starts a realization sequence. It does not guarantee immediate cash availability.', steps: [unwrap, ...(senior ? [seniorWithdrawal] : []), ...onycIssuerExit] },
    { id: 'early', label: 'Before maturity', summary: 'Selling PT is one route. A matching PT/YT merge is a separate alternative that also requires available YT and underlying exit.', steps: [
      { title: 'Obtain an executable PT sale', input: `PT-${base}`, output: 'Quoted settlement asset; unverified', condition: 'Counterparty liquidity at the intended size.', risk: 'Sale proceeds can differ from the implied maturity payoff. No normal or stressed exit quote is available.', sourceIds: ['EXP-FEES', 'EXP-API-POOLS'] },
      { title: 'Convert sale proceeds if required', input: 'Quoted settlement asset', output: 'USDC comparison destination', condition: 'A separately available conversion route.', risk: 'Each additional conversion introduces its own price, fee and capacity constraints.', sourceIds: ['EXP-FEES'] },
    ] },
    { id: 'stress', label: 'Stress exit', summary: senior ? 'The critical path combines underlying impairment, junior depletion, a possible senior pause and PT maturity.' : 'Underlying impairment or pricing failure can coincide with a thin PT market and issuer withdrawal limits.', steps: [
      { title: senior ? 'Reconcile NAV and protection capacity' : 'Reconcile underlying impairment', input: 'ONyc economic exposure', output: senior ? 'Revised senior/junior claims' : 'Revised underlying claim', condition: 'Recognize economic losses and applicable NAV updates.', risk: senior ? 'Junior depletion can transmit loss to senior.' : 'The relationship between economic losses and executable offer pricing remains unresolved.', sourceIds: senior ? ['EXP-WATERFALL', 'EXP-API-TRANCHING', 'ON-S08'] : ['ON-S02', 'ON-S08'] },
      { ...unwrap, title: 'Test maturity execution under stress' },
      ...(senior ? [{ ...seniorWithdrawal, title: 'Resolve any senior withdrawal pause' }] : []),
      { ...onycSecondaryStep, title: 'Test the ONyc cash-exit fallback' },
    ] },
  ];
}

function allSourceIds(record: Pick<Assessment, 'factors' | 'layers' | 'evidence' | 'routes'>): string[] {
  return [...new Set([
    ...record.factors.flatMap((factor) => factor.sourceIds),
    ...record.layers.flatMap((layer) => layer.sourceIds),
    ...record.evidence.flatMap((area) => area.sourceIds),
    ...record.routes.flatMap((route) => route.steps.flatMap((step) => step.sourceIds)),
  ])];
}

const onycContent = { factors: underlyingFactors(), layers: underlyingLayers(), evidence: underlyingEvidence(), routes: onycRoutes };

const onyc: Assessment = {
  ...noRating, id: 'onyc', symbol: 'ONyc', name: 'OnRe tokenized reinsurance', type: 'NAV-based token', protocol: 'OnRe', chain: 'Solana', maturity: null,
  mint: onycPacket.identity.mint, market: null,
  identityBasis: 'Mint identified in the issuer reference.',
  summary: 'Reinsurance exposure with a NAV-based claim and a conditional route back to cash.',
  blocker: 'Signed holder rights, current portfolio/reserves, valuation reconciliation and executable exit remain unresolved. Score formation is unapproved.',
  lane: 'RWA / tokenized fund', lossObject: 'NAV and claim-recovery impairment', observedAt: onycPacket.observed_at,
  scopeAssumptions: [...commonAssumptions, 'ONyc has no contractual PT maturity. The assessment horizon has not been fixed.'],
  ...onycContent, sourceIds: allSourceIds(onycContent),
};

function createPT(senior: boolean): Assessment {
  const base = senior ? 'srONyc' : 'ONyc';
  const market = septemberMarket(base);
  const content = { factors: ptFactors(senior), layers: ptLayers(senior), evidence: ptEvidence(senior), routes: ptRoutes(senior) };
  return {
    ...noRating, id: senior ? 'pt-sronyc' : 'pt-onyc', symbol: `PT-${base}`,
    name: senior ? 'Principal token on senior ONyc' : 'Principal token on ONyc',
    type: senior ? 'Senior principal token' : 'Principal token', protocol: 'Exponent · OnRe', chain: 'Solana',
    maturity: market.maturity_utc, mint: market.pt_mint, market: market.vault_address,
    identityBasis: 'PT mint and vault are publisher API observations cross-checked across endpoints, without independent chain verification. Market identifier shown is the vault address.',
    summary: senior ? 'A fixed-maturity claim on senior ONyc, with finite first-loss support and an additional withdrawal state.' : 'A fixed-maturity claim that retains ONyc exposure and adds wrapper, settlement and early-exit dependencies.',
    blocker: senior ? 'Tranche state, executable redemption and loss allocation need verification. Senior protection has no approved score transformation; ONyc evidence gaps also remain.' : 'Exact redemption output, deployment coverage and size-specific exit are unverified. ONyc evidence gaps and unapproved score formation also remain.',
    lane: senior ? 'PT / senior-tranche claim' : 'PT / yield-stripped claim',
    lossObject: senior ? 'Senior payoff and realization impairment' : 'Maturity payoff and realization impairment',
    observedAt: exponentPacket.observed_at,
    scopeAssumptions: [...commonAssumptions,
      'Scope assumption: this assessment covers the 10 September 2026 series. Confirm that it matches your holding; the January 2027 series is a different instrument.',
      'Expected realization is considered around the selected maturity; delays and stressed exit beyond that date remain unresolved.',
      'USD is the publisher’s accounting denomination. Cash settlement and the exact underlying redemption quantity are unverified.',
      ...(senior ? ['Junior capital is a protection dependency, not another asset owned by the senior holder. No automatic rating uplift is credited.'] : []),
    ],
    ...content, sourceIds: allSourceIds(content),
  };
}

export const assessments: Assessment[] = [onyc, createPT(false), createPT(true), ptSusdaiAssessment];

export function getAssessment(id: string): Assessment | undefined {
  return assessments.find((assessment) => assessment.id === id);
}

export function sourceById(id: string): Source | undefined {
  return sources.find((source) => source.id === id);
}
