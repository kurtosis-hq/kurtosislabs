import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { assessments, sources } from '../lib/assessments.ts';
import { createResearchFiles, serveResearchFile } from '../lib/downloads.ts';

const customerDocuments = ['methodology', 'research', 'onyc', 'exponent', 'pt-susdai'];

test('only the five customer documents are exposed; unknown and internal paths are rejected', () => {
  const files = createResearchFiles();
  assert.equal([...files.keys()].filter(p => p.includes('/documents/')).length, customerDocuments.length);
  for (const name of ['plan', 'visualization', '__proto__', 'constructor', '../../package.json', 'unknown']) {
    assert.equal(serveResearchFile(`/ratings-data/documents/${name}.md`).status, 404);
  }
  assert.equal(serveResearchFile('/ratings-data/documents/').status, 404);
});
test('all customer documents can be read and downloaded without a server filesystem', async () => {
  for (const name of customerDocuments) {
    const path = `/ratings-data/documents/${name}.md`;
    const inline = serveResearchFile(path);
    const download = serveResearchFile(path, true);
    assert.equal(inline.status, 200);
    assert.match(inline.headers.get('Content-Type')!, /text\/markdown/);
    assert.match(inline.headers.get('Content-Disposition')!, /^inline;/);
    assert.match(download.headers.get('Content-Disposition')!, /^attachment; filename="kurtosis-.*\.md"$/);
    const text = await inline.text();
    assert.ok(text.length > 100);
    assert.equal(await download.text(), text);
  }
});
test('the PT-sUSDai document preserves the complete supplied investor edition byte for byte', async () => {
  const response = serveResearchFile('/ratings-data/documents/pt-susdai.md', true);
  const content = Buffer.from(await response.arrayBuffer());
  assert.equal(createHash('sha256').update(content).digest('hex'), 'e282cfe27ba3bba2e2b05f93d0003e273e7362ed162201c129e555bca2058c8e');
  assert.match(response.headers.get('Content-Disposition')!, /kurtosis-pt-susdai-investor-assessment\.md/);
});
test('each assessment export retains its exact position, source inventory and withheld results', async () => {
  for (const p of assessments) {
    const response = serveResearchFile(`/ratings-data/assessments/${p.id}.json`, true);
    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.assessment.id, p.id);
    assert.equal(payload.assessment.mint, p.mint);
    assert.equal(payload.assessment.disposition, 'NO_RATE');
    for (const field of ['approvedGrade', 'approvedScore', 'approvedConfidence', 'indicatedGrade', 'indicatedScore']) assert.equal(payload.assessment[field], null);
    assert.deepEqual(new Set(payload.sources.map((s: { id: string }) => s.id)), new Set(p.sourceIds));
    assert.equal(payload.metadata.live, false);
    assert.equal(payload.metadata.researchDate, p.observedAt.slice(0, 10));
    assert.deepEqual(payload.metadata.researchDateRange, { from: p.observedAt.slice(0, 10), to: p.observedAt.slice(0, 10) });
    assert.deepEqual(payload.metadata.researchDates, { [p.id]: p.observedAt.slice(0, 10) });
  }
  assert.equal(serveResearchFile('/ratings-data/assessments/unknown.json').status, 404);
});
test('research and all preserved source records form a complete downloadable dated snapshot', async () => {
  const files = createResearchFiles();
  assert.equal(files.size, 2 + assessments.length + sources.length + customerDocuments.length);
  const payload = await serveResearchFile('/ratings-data/research.json', true).json();
  assert.equal(payload.metadata.live, false);
  assert.equal(payload.metadata.approvalDisposition, 'NO_RATE');
  assert.deepEqual(Object.keys(payload.packets), ['onyc', 'exponent', 'pt-susdai']);
  const dates = assessments.map(assessment => assessment.observedAt.slice(0, 10)).sort();
  assert.equal(payload.metadata.researchDate, null);
  assert.deepEqual(payload.metadata.researchDateRange, { from: dates[0], to: dates.at(-1) });
  assert.deepEqual(payload.metadata.documentEditions, [{
    assessmentId: 'pt-susdai', documentEditionDate: '2026-10-23', documentEditionTimezone: 'Asia/Singapore',
    investmentEvidenceCutoff: '2026-10-22', investmentEvidenceTimezone: 'UTC', investmentEvidenceRefreshed: false,
  }]);
  for (const source of sources) {
    const record = await serveResearchFile(`/ratings-data/sources/${source.id}.json`).json();
    assert.equal(record.source.id, source.id);
    assert.equal(record.fullResearchPacketUrl, '/ratings-data/research.json');
  }
});
