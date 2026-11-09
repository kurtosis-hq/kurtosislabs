import type { Assessment, EvidenceArea } from './assessments.ts';

type PositionId = Assessment['id'];
export type ComparisonEvidenceRow = {
  id: string;
  title: string;
  group: 'position' | 'underlying';
  appliesTo: readonly PositionId[];
  notApplicableReason?: string;
};

const allPositions: readonly PositionId[] = ['onyc', 'pt-onyc', 'pt-sronyc', 'pt-susdai'];
const principalTokens: readonly PositionId[] = ['pt-onyc', 'pt-sronyc', 'pt-susdai'];
const exponentPositions: readonly PositionId[] = ['pt-onyc', 'pt-sronyc'];
const susdaiPositions: readonly PositionId[] = ['pt-susdai'];

/** Display labels distinguish inherited evidence from each position's added requirements. */
export const comparisonEvidenceRows: readonly ComparisonEvidenceRow[] = [
  { id: 'pt-liquidity', title: 'Executable PT sale', group: 'position', appliesTo: principalTokens, notApplicableReason: 'ONyc is not a principal token.' },
  { id: 'conversion', title: 'PT redemption and conversion', group: 'position', appliesTo: principalTokens, notApplicableReason: 'ONyc has no PT conversion step.' },
  { id: 'market', title: 'PT series and account identities', group: 'position', appliesTo: principalTokens, notApplicableReason: 'ONyc has no PT series.' },
  { id: 'exponent-control', title: 'Exponent deployment and controls', group: 'position', appliesTo: exponentPositions, notApplicableReason: 'This position does not use an Exponent wrapper.' },
  { id: 'pendle-control', title: 'Pendle deployment and controls', group: 'position', appliesTo: susdaiPositions, notApplicableReason: 'This position does not use a Pendle wrapper.' },
  { id: 'tranche', title: 'ONyc senior loss waterfall and recovery', group: 'position', appliesTo: ['pt-sronyc'], notApplicableReason: 'This position does not own the ONyc senior tranche.' },
  { id: 'methodology', title: 'PT-sUSDai methodology and approval record', group: 'position', appliesTo: susdaiPositions, notApplicableReason: 'This additional workpaper record is specific to PT-sUSDai; every assessment still requires independent approval.' },
  { id: 'liquidity', title: 'Underlying redemption and sale', group: 'underlying', appliesTo: allPositions },
  { id: 'legal', title: 'Underlying holder rights', group: 'underlying', appliesTo: allPositions },
  { id: 'portfolio', title: 'Underlying portfolio and collateral', group: 'underlying', appliesTo: allPositions },
  { id: 'nav', title: 'NAV and loss transmission', group: 'underlying', appliesTo: allPositions },
  { id: 'attestation', title: 'Independent financial assurance', group: 'underlying', appliesTo: allPositions },
  { id: 'control', title: 'Underlying code, custody and controls', group: 'underlying', appliesTo: allPositions },
  { id: 'reserves', title: 'USDai / PYUSD reserves and supply', group: 'underlying', appliesTo: susdaiPositions, notApplicableReason: 'This USDai / PYUSD backing branch is not part of the ONyc position.' },
  { id: 'access', title: 'USDai holder access and redemption rules', group: 'underlying', appliesTo: susdaiPositions, notApplicableReason: 'This separate access reconciliation concerns the USDai redemption route.' },
  { id: 'history', title: 'PT-sUSDai historical incident review', group: 'underlying', appliesTo: susdaiPositions, notApplicableReason: 'This historical review concerns the sUSDai, USDai and PT-sUSDai mechanisms.' },
];

export type ComparisonEvidenceCell =
  | { kind: 'recorded'; evidence: EvidenceArea }
  | { kind: 'not-applicable'; reason: string }
  | { kind: 'unrecorded' };

export function comparisonEvidenceCell(position: Assessment, row: ComparisonEvidenceRow): ComparisonEvidenceCell {
  const evidence = position.evidence.find(area => area.id === row.id);
  if (evidence) return { kind: 'recorded', evidence };
  if (!row.appliesTo.includes(position.id)) {
    return { kind: 'not-applicable', reason: row.notApplicableReason ?? 'This mechanism is not part of this position.' };
  }
  // An absent required record must never be presented as an inapplicable mechanism.
  return { kind: 'unrecorded' };
}
