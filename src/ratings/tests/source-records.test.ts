import assert from 'node:assert/strict';
import test from 'node:test';
import { serveResearchFile } from '../lib/downloads.ts';
const GET = (request: Request) => { const url = new URL(request.url); return serveResearchFile(`/ratings-data/sources/${url.searchParams.get('id') || ''}.json`, url.searchParams.get('download') === '1'); };
import { sources } from '../lib/assessments.ts';
import { getSourceCapture, getSourceRecord, type SourceCapture } from '../lib/source-observations.ts';
import onyc from '../data/research/onyc-evidence.json' with { type: 'json' };
import exponent from '../data/research/exponent-evidence.json' with { type: 'json' };
import ptSusdai from '../data/research/pt-susdai-evidence.json' with { type: 'json' };

void test('every registered source has an inspectable source record with original attribution', () => {
  for (const source of sources) {
    const record = getSourceRecord(source.id);
    assert.ok(record, source.id);
    assert.equal(record.source.id, source.id);
    assert.equal(record.source.url, source.url);
    assert.equal(record.live, false);
    for (const entry of record.packetRecords) {
      const packet: unknown = record.packetFile.includes('pt-susdai-evidence') ? ptSusdai : record.packetFile.includes('onyc-evidence') ? onyc : exponent;
      const original: unknown = entry.pointer.slice(1).split('/').reduce<unknown>((value, key) => (value as Record<string, unknown>)[key.replace(/~1/g, '/').replace(/~0/g, '~')], packet);
      assert.deepEqual(entry.record, original, `${source.id}: ${entry.pointer}`);
      assert.ok(entry.record.source_id === source.id || (Array.isArray(entry.record.source_ids) && entry.record.source_ids.includes(source.id)));
    }
    if (record.capture) assert.equal(record.capture.sourceResponseSha256, record.source.response_sha256 ?? record.source.sha256);
  }
});

void test('PT-sUSDai sources retain the supplied report provenance without invented retrievals or captures', () => {
  assert.equal(ptSusdai.sources.filter(source => /^SUSDAI-S\d{2}$/.test(source.id)).length, 33);
  assert.equal(ptSusdai.sources.find(source => source.id === 'SUSDAI-REPORT')?.url, '/ratings-data/documents/pt-susdai.md');
  for (const source of ptSusdai.sources) {
    const record = getSourceRecord(source.id)!;
    assert.equal(record.capture, null);
    assert.equal(record.recordOrigin, 'supplied_investor_assessment');
    assert.equal(record.investmentEvidenceCutoff, '2026-10-22');
    assert.equal(record.documentEditionDate, '2026-10-23');
    assert.equal(record.originalSourceRetrievedForThisPage, false);
    assert.equal(record.suppliedReportUrl, '/ratings-data/documents/pt-susdai.md');
    assert.match(record.captureLimitation, /inherited from the supplied investor assessment/);
    assert.match(record.attribution, /not new inspections/);
    assert.ok(record.packetRecords.length > 0, `${source.id}: expected attributed report records`);
  }
});

void test('market extracts preserve each actual mint, maturity and null redemption field', () => {
  const capture = getSourceCapture('EXP-API-MARKETS');
  assert.ok(capture);
  assert.equal(capture.kind, 'api_fields');
  assert.equal(capture.groups.length, 4);
  for (const market of exponent.candidate_markets) {
    const group: SourceCapture['groups'][number] | undefined = capture.groups.find(item => item.label.endsWith(market.series));
    assert.ok(group, market.series);
    const field = (name: string): string => group.fields!.find(item => item.path.endsWith(`/${name}`))!.valueText;
    assert.equal(JSON.parse(field('ptMint')), market.pt_mint);
    assert.equal(JSON.parse(field('maturityDateUnixTs')), market.maturity_timestamp);
    assert.equal(field('ptRedemptionRate'), 'null');
    assert.equal(JSON.parse(field('quoteAsset/ticker')), 'USD');
  }
  const record = getSourceRecord('EXP-API-MARKETS')!;
  assert.ok(record.packetRecords.some(entry => entry.pointer.startsWith('/candidate_markets/')));
  assert.match(record.captureLimitation, /not the complete original response/);
});

void test('API scalars retain their exact precision and timestamp limitations', () => {
  for (const [id, expected] of [['ON-S18', '1.143166274'], ['ON-S20', '287723838.800025469986198890'], ['ON-S19', '0.115411']]) {
    const record = getSourceRecord(id)!;
    assert.equal(record.capture?.groups[0].fields?.[0].valueText, expected);
    const observation = record.packetRecords.find(entry => entry.pointer.startsWith('/issuer_api_observations/'))!;
    assert.equal(observation.record.data_as_of, null);
    assert.equal(observation.record.verified_live, false);
  }
});

void test('unavailable source contents are never upgraded to a source capture', () => {
  const report = getSourceRecord('ON-S16')!;
  assert.equal(report.capture, null);
  assert.equal(report.source.inspection_status, 'linked_but_content_unavailable');
  assert.match(String(report.source.limitation), /No report contents were read/);
  assert.match(report.captureLimitation, /No exact source passage/);
  assert.equal(getSourceRecord('not-a-source'), undefined);
});

void test('source downloads serve the selected record and reject absent or unknown IDs', async () => {
  const result = GET(new Request('http://localhost/api/source-records?id=EXP-API-MARKETS&download=1'));
  assert.equal(result.status, 200);
  assert.match(result.headers.get('Content-Disposition')!, /kurtosis-source-EXP-API-MARKETS\.json/);
  const payload = await result.json() as { source: { id: string }; capture: { groups: unknown[] }; packetRecords: unknown[] };
  assert.equal(payload.source.id, 'EXP-API-MARKETS');
  assert.equal(payload.capture.groups.length, 4);
  assert.ok(payload.packetRecords.length > 0);
  assert.equal(GET(new Request('http://localhost/api/source-records')).status, 404);
  assert.equal(GET(new Request('http://localhost/api/source-records?id=unknown')).status, 404);
});
