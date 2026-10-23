import type { Assessment } from './assessments.ts';

/** Display priority only; this does not change the assessment or its evidence states. */
const priorities: Record<Assessment['id'], string[]> = {
  onyc: ['claim', 'valuation', 'substance'],
  'pt-onyc': ['pt-settlement', 'valuation', 'pt-exit'],
  'pt-sronyc': ['waterfall', 'valuation', 'recovery'],
};

export const factorEvidence: Record<string, string> = {
  claim: 'legal', substance: 'portfolio', valuation: 'nav', exit: 'liquidity', controls: 'control', assurance: 'attestation',
  waterfall: 'tranche', recovery: 'tranche', 'pt-settlement': 'conversion', 'pt-exit': 'pt-liquidity', 'pt-control': 'exponent-control',
};

export const approvalSummary: Record<Assessment['id'], string> = {
  onyc: 'Holder rights, current reserves, NAV pricing and executable cash exit need verification.',
  'pt-onyc': 'Exact PT settlement, underlying loss transmission and size-specific cash exit need verification.',
  'pt-sronyc': 'Senior loss allocation, withdrawal availability and underlying NAV pricing need verification.',
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
};

export const investmentImplications: Record<Assessment['id'], { title: string; detail: string }> = {
  onyc: { title: 'Recovery value and cash access remain uncertain.', detail: 'The holder claim, reserves and redeemable value still need verification before an approved assessment can be issued.' },
  'pt-onyc': { title: 'Maturity does not establish a cash payout.', detail: 'The position retains ONyc exposure. Settlement, loss transmission and an executable exit still need verification before approval.' },
  'pt-sronyc': { title: 'Seniority does not establish principal protection or cash access.', detail: 'Junior capital provides conditional protection. Losses may reach the senior position, and a withdrawal pause can delay cash beyond PT maturity.' },
};

export function prioritizedFactors(position: Assessment) {
  const ids = priorities[position.id];
  return [...ids.map(id => position.factors.find(factor => factor.id === id)!), ...position.factors.filter(factor => !ids.includes(factor.id))];
}
