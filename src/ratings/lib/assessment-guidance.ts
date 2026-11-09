import type { Assessment } from './assessments.ts';

/** Display priority only; this does not change the assessment or its evidence states. */
const priorities: Record<Assessment['id'], string[]> = {
  onyc: ['claim', 'valuation', 'substance'],
  'pt-onyc': ['pt-settlement', 'valuation', 'pt-exit'],
  'pt-sronyc': ['waterfall', 'valuation', 'recovery'],
  'pt-susdai': ['susdai-settlement', 'susdai-queue', 'susdai-loans'],
};

export const factorEvidence: Record<string, string> = {
  claim: 'legal', substance: 'portfolio', valuation: 'nav', exit: 'liquidity', controls: 'control', assurance: 'attestation',
  waterfall: 'tranche', recovery: 'tranche', 'pt-settlement': 'conversion', 'pt-exit': 'pt-liquidity', 'pt-control': 'exponent-control',
  'susdai-settlement': 'conversion', 'susdai-queue': 'liquidity', 'susdai-loans': 'portfolio',
  'susdai-valuation': 'nav', 'susdai-legal': 'legal', 'susdai-reserves': 'reserves',
  'susdai-access': 'access', 'susdai-controls': 'control', 'susdai-history': 'history',
  'susdai-exit': 'pt-liquidity', 'susdai-methodology': 'methodology',
};

export const approvalSummary: Record<Assessment['id'], string> = {
  onyc: 'Holder rights, current reserves, NAV pricing and executable cash exit need verification.',
  'pt-onyc': 'Exact PT settlement, underlying loss transmission and size-specific cash exit need verification.',
  'pt-sronyc': 'Senior loss allocation, withdrawal availability and underlying NAV pricing need verification.',
  'pt-susdai': 'Current redemption proceeds, withdrawal cash, the loan book and enforceable recovery rights remain unverified. Calculation rules and independent approval are outstanding; a source-backed watchlist is required.',
};

/** Investor-facing summaries of the existing findings; no scoring or evidence changes. */
export const factorTakeaways: Record<string, { finding: string; implication: string }> = {
  claim: { finding: 'Holder rights remain unverified', implication: 'Your legal claim and recovery priority depend on terms that have not been obtained.' },
  valuation: { finding: 'NAV and exit prices are unreconciled', implication: 'It is unclear how underlying losses affect the price you can actually redeem at.' },
  substance: { finding: 'Current reserves are not established', implication: 'Without dated holdings and reserves, the capacity to absorb insurance losses cannot be assessed.' },
  waterfall: { finding: 'Senior protection has a limit', implication: 'Losses can reach the senior position once junior capital is exhausted. Protection over your holding period is unverified.' },
  recovery: { finding: 'Withdrawals may pause at maturity', implication: 'Your PT can mature while senior withdrawals are paused, delaying the route to cash.' },
  'pt-settlement': { finding: 'Cash settlement is unverified', implication: 'Maturity alone does not establish the asset or dollar amount you will receive.' },
  'pt-exit': { finding: 'Early exit has no executable quote', implication: 'Published liquidity does not establish whether you can sell your intended size or at what price.' },
  exit: { finding: 'Redemption depends on a queue', implication: 'You remain exposed to ONyc while awaiting an eligible, funded redemption.' },
  controls: { finding: 'Live controls need verification', implication: 'Documented powers and audits do not establish who controls the current deployment or reserves.' },
  assurance: { finding: 'Independent assurance is unavailable', implication: 'A linked report cannot establish reserve balances or exceptions until its contents are inspected.' },
  'pt-control': { finding: 'Wrapper controls need verification', implication: 'Unverified administration and deployed code add uncertainty to settlement and exit.' },
  'susdai-settlement': { finding: 'Matured PT cash proceeds remain unverified', implication: 'The token and amount delivered at redemption, and the conversion into native USDC, still need to be demonstrated.' },
  'susdai-queue': { finding: 'An eligible withdrawal still needs cash', implication: 'The amount recoverable and the date it can be paid depend on queue servicing and cash after existing commitments.' },
  'susdai-loans': { finding: 'Current loan collections and recoveries are unknown', implication: 'The historical loan report cannot establish how much borrowers can repay or how much GPU sales could recover today.' },
  'susdai-valuation': { finding: 'Displayed value can exceed withdrawal proceeds', implication: 'The exact SY rate and PT index history are needed to trace a valuation correction into the holder’s proceeds.' },
  'susdai-legal': { finding: 'The legal route to recoveries is incomplete', implication: 'Executed ownership, priority and enforcement records must connect borrower recoveries to vault cash and the holder’s withdrawal.' },
  'susdai-reserves': { finding: 'Reserve backing needs its own reconciliation', implication: 'USDai and PYUSD reserve claims require separate evidence from the loans supporting the sUSDai vault.' },
  'susdai-access': { finding: 'Ordinary-holder redemption access is unresolved', implication: 'The October access announcement needs to agree with the deployed rules, fees and an actual holder’s execution.' },
  'susdai-controls': { finding: 'Active control powers need verification', implication: 'Source code and audit listings do not establish who can change the deployed system, interrupt withdrawals or adjust valuation.' },
  'susdai-history': { finding: 'Past valuation and withdrawal events require follow-up', implication: 'Holder outcomes and active fixes need verification before historical events can support a conclusion about current resilience.' },
  'susdai-exit': { finding: 'The assumed $1m exit remains unverified', implication: 'No executable quote establishes the net native-USDC proceeds or time to cash at the report’s assumed comparison size.' },
  'susdai-methodology': { finding: 'Rating rules and approval remain outstanding', implication: 'Product evidence alone cannot produce an approved rating until calculation rules, validation and independent review are complete.' },
};

export const investmentImplications: Record<Assessment['id'], { title: string; detail: string }> = {
  onyc: { title: 'Recovery value and cash access remain uncertain.', detail: 'The holder claim, reserves and redeemable value still need verification before an approved assessment can be issued.' },
  'pt-onyc': { title: 'Maturity does not establish a cash payout.', detail: 'The position retains ONyc exposure. Settlement, loss transmission and an executable exit still need verification before approval.' },
  'pt-sronyc': { title: 'Seniority does not establish principal protection or cash access.', detail: 'Junior capital provides conditional protection. Losses may reach the senior position, and a withdrawal pause can delay cash beyond PT maturity.' },
  'pt-susdai': { title: 'Redemption value and the time to receive USDC remain unresolved.', detail: 'The October PT has matured. USDai accounting units do not promise a payment of one USDC, and vault withdrawals depend on eligibility and available cash. The February 2027 candidate needs a separate assessment.' },
};

export function prioritizedFactors(position: Assessment) {
  const ids = priorities[position.id];
  return [...ids.map(id => position.factors.find(factor => factor.id === id)!), ...position.factors.filter(factor => !ids.includes(factor.id))];
}
