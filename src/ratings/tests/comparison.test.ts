import assert from 'node:assert/strict';
import test from 'node:test';
import { assessments, getAssessment } from '../lib/assessments.ts';
import { comparisonEvidenceCell, comparisonEvidenceRows } from '../lib/comparison.ts';

void test('comparison includes every shared and position-specific evidence requirement exactly once', () => {
  const displayedIds = comparisonEvidenceRows.map(row => row.id);
  assert.equal(new Set(displayedIds).size, displayedIds.length);
  assert.deepEqual(new Set(displayedIds), new Set(assessments.flatMap(position => position.evidence.map(area => area.id))));
  for (const position of assessments) {
    for (const area of position.evidence) {
      const row = comparisonEvidenceRows.find(candidate => candidate.id === area.id)!;
      assert.ok(row.appliesTo.includes(position.id), `${position.id}: unexpected N/A for ${area.id}`);
      const cell = comparisonEvidenceCell(position, row);
      assert.equal(cell.kind, 'recorded');
      if (cell.kind === 'recorded') assert.equal(cell.evidence, area);
    }
  }
});

void test('PT exit gaps remain distinct from partial underlying ONyc exit evidence', () => {
  const ptExit = comparisonEvidenceRows.find(row => row.id === 'pt-liquidity')!;
  const underlyingExit = comparisonEvidenceRows.find(row => row.id === 'liquidity')!;
  assert.match(underlyingExit.title, /Underlying ONyc/);
  for (const id of ['pt-onyc', 'pt-sronyc']) {
    const position = getAssessment(id)!;
    const ptCell = comparisonEvidenceCell(position, ptExit);
    const underlyingCell = comparisonEvidenceCell(position, underlyingExit);
    assert.equal(ptCell.kind, 'recorded');
    assert.equal(underlyingCell.kind, 'recorded');
    if (ptCell.kind === 'recorded') assert.equal(ptCell.evidence.state, 'missing');
    if (underlyingCell.kind === 'recorded') assert.equal(underlyingCell.evidence.state, 'partial');
  }
});

void test('N/A is limited to an explicitly inapplicable mechanism, never missing required data', () => {
  for (const row of comparisonEvidenceRows) {
    for (const position of assessments) {
      const cell = comparisonEvidenceCell(position, row);
      assert.equal(cell.kind, row.appliesTo.includes(position.id) ? 'recorded' : 'not-applicable', `${position.id}: ${row.id}`);
    }
  }
  const position = structuredClone(getAssessment('pt-sronyc')!);
  position.evidence = position.evidence.filter(area => area.id !== 'pt-liquidity');
  const row = comparisonEvidenceRows.find(candidate => candidate.id === 'pt-liquidity')!;
  assert.equal(comparisonEvidenceCell(position, row).kind, 'unrecorded');
});
