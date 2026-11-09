import assert from 'node:assert/strict';
import test from 'node:test';
import packet from '../data/research/pt-susdai-evidence.json' with { type: 'json' };
import { getAssessment } from '../lib/assessments.ts';

void test('the investor-language edition does not refresh PT-sUSDai investment evidence', () => {
  const position = getAssessment('pt-susdai')!;
  assert.equal(packet.evidence_cutoff, '2026-10-22');
  assert.equal(packet.edition_date, '2026-10-23');
  assert.equal(packet.provided_report.investment_evidence_refreshed_for_edition, false);
  assert.equal(position.observedAt, packet.evidence_cutoff);
  assert.equal(packet.identity.onchain_verified, false);
  assert.ok(packet.sources.every(source => /supplied_workpaper/.test(source.inspection_status)));
});

void test('the frozen July illustration remains outside all current rating outputs', () => {
  const position = getAssessment('pt-susdai')!;
  assert.equal(packet.historical_illustration.score, 1.450);
  assert.equal(packet.historical_illustration.grade, 'B');
  assert.equal(packet.historical_illustration.current_rating, false);
  assert.equal(packet.historical_illustration.approval_status, 'NOT APPROVED');
  for (const field of ['approvedScore', 'approvedGrade', 'approvedConfidence', 'indicatedScore', 'indicatedGrade'] as const) {
    assert.equal(position[field], null, field);
  }
});

void test('the February annex stays an unresolved candidate outside the registered October assessment', () => {
  const position = getAssessment('pt-susdai')!;
  assert.equal(packet.forward_candidate.market, '0xf86119a39f8654f38acbbd5488bd83f3f51983c8');
  assert.notEqual(packet.forward_candidate.market, position.market);
  assert.equal(packet.forward_candidate.pt_address, null);
  assert.equal(packet.forward_candidate.expiry_timestamp, null);
  assert.equal(packet.forward_candidate.approval_status, 'NOT APPROVED');
  assert.match(packet.forward_candidate.maturity_label, /24\/25 February/);
});

void test('historical loan assurance and unconfirmed price leads remain qualified', () => {
  const position = getAssessment('pt-susdai')!;
  const loanReport = packet.sources.find(source => source.id === 'SUSDAI-S13')!;
  assert.equal(loanReport.effective_at, '2026-07-15');
  assert.equal(position.evidence.find(area => area.id === 'attestation')?.state, 'stale');
  assert.equal(packet.historical_events.find(event => event.id === 'H04')?.status, 'unconfirmed_data_quality_leads');
  assert.equal(packet.historical_events.find(event => event.id === 'H06')?.status, 'excluded_from_confirmed_incidents');
});
