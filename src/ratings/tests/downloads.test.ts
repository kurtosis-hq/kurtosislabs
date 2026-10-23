import assert from 'node:assert/strict';
import test from 'node:test';
import { assessments, sources } from '../lib/assessments.ts';
import { createResearchFiles, serveResearchFile } from '../lib/downloads.ts';

test('only the four customer documents are exposed; unknown and internal paths are rejected', () => {
  const files = createResearchFiles();
  assert.equal([...files.keys()].filter(p => p.includes('/documents/')).length, 4);
  for (const name of ['plan', 'visualization', '__proto__', 'constructor', '../../package.json', 'unknown']) {
    assert.equal(serveResearchFile(`/ratings-data/documents/${name}.md`).status, 404);
  }
  assert.equal(serveResearchFile('/ratings-data/documents/').status, 404);
});
test('all customer documents can be read and downloaded without a server filesystem', async () => {
  for (const name of ['methodology', 'research', 'onyc', 'exponent']) {
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
  }
  assert.equal(serveResearchFile('/ratings-data/assessments/unknown.json').status, 404);
});
test('research and all preserved source records form a complete downloadable dated snapshot', async () => {
  const files = createResearchFiles();
  assert.equal(files.size, 46);
  const payload = await serveResearchFile('/ratings-data/research.json', true).json();
  assert.equal(payload.metadata.live, false);
  assert.equal(payload.metadata.approvalDisposition, 'NO_RATE');
  assert.deepEqual(Object.keys(payload.packets), ['onyc', 'exponent']);
  for (const source of sources) {
    const record = await serveResearchFile(`/ratings-data/sources/${source.id}.json`).json();
    assert.equal(record.source.id, source.id);
    assert.equal(record.fullResearchPacketUrl, '/ratings-data/research.json');
  }
});
