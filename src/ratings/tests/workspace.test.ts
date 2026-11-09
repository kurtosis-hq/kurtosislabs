import assert from 'node:assert/strict';
import test from 'node:test';
import { createNotes } from '../lib/notes.ts';
import { readLocation, locationUrl } from '../lib/navigation.ts';
import { assessments } from '../lib/assessments.ts';
import { renderWorkspace, renderSource, type ViewState } from '../views.ts';

function memoryStorage() {
  const items = new Map<string, string>();
  return { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => { items.set(key, value); }, removeItem: (key: string) => { items.delete(key); } };
}
const state = (): ViewState => ({ layerId: '', evidenceFilter: 'all', expandedFactors: false, note: () => ({ value: '', savedValue: '', saved: false, error: '' }) });

test('notes preserve drafts across position changes, saves and workspace reloads', () => {
  const local = memoryStorage(), session = memoryStorage();
  const notes = createNotes(() => local, () => session);
  notes.edit('onyc', 'ONyc draft');
  notes.edit('pt-onyc', 'PT draft');
  assert.equal(notes.get('onyc').value, 'ONyc draft');
  assert.equal(createNotes(() => local, () => session).get('onyc').value, 'ONyc draft');
  notes.save('onyc');
  assert.equal(session.getItem('kurtosis-draft-onyc'), null);
  assert.equal(createNotes(() => local, () => session).get('onyc').saved, true);
  assert.equal(notes.get('pt-onyc').value, 'PT draft');
});
test('existing current and legacy note keys are compatible without overwriting newer notes', () => {
  const local = memoryStorage(), session = memoryStorage();
  local.setItem('rl-note-sr', 'Current-site note');
  local.setItem('rl-note-on', 'Older note');
  local.setItem('kurtosis-note-onyc', 'Newer note');
  const notes = createNotes(() => local, () => session);
  assert.equal(notes.get('pt-sronyc').value, 'Current-site note');
  assert.equal(notes.get('onyc').value, 'Newer note');
});
test('unavailable storage never claims that a failed save succeeded and preserves the in-memory draft', () => {
  const unavailable = () => { throw new Error('Storage blocked'); };
  const notes = createNotes(unavailable, unavailable);
  notes.edit('onyc', 'Keep this draft');
  const note = notes.save('onyc');
  assert.equal(note.saved, false);
  assert.match(note.error, /Save failed/);
  assert.equal(note.value, 'Keep this draft');
});
test('shared URLs retain position, view, tab, scenario, evidence target and source', () => {
  const url = locationUrl(new URL('https://example.test/ratings.html'), { position: 'pt-onyc', view: 'ratings', tab: 'evidence', route: 'stress', source: 'EXP-API-MARKETS', target: 'evidence-conversion' });
  assert.deepEqual(readLocation(url), { position: 'pt-onyc', view: 'ratings', tab: 'evidence', route: 'stress', source: 'EXP-API-MARKETS', target: 'evidence-conversion' });
  assert.equal(readLocation(new URL('https://example.test/ratings.html?position=on&tab=ev')).position, 'onyc');
  assert.equal(readLocation(new URL('https://example.test/ratings.html?tab=invalid&view=invalid&route=invalid')).tab, 'dependencies');
});
test('every position and assessment tab renders from the same model without missing values', () => {
  for (const p of assessments) for (const tab of ['dependencies', 'routes', 'questions', 'evidence']) {
    const location = readLocation(new URL(`https://example.test/ratings.html?position=${p.id}&tab=${tab}`));
    const html = renderWorkspace(location, state());
    assert.ok(html.includes(p.symbol));
    assert.doesNotMatch(html, /undefined|NaN|href="#"|\/api\/ratings/);
    if (tab === 'evidence') { assert.ok(html.includes(p.mint)); assert.ok(html.includes('research-note-field')); }
  }
  const senior = renderWorkspace(readLocation(new URL('https://example.test/ratings.html')), state());
  assert.match(senior, /2,025,914\.14/);
  assert.match(senior, /6,994,668\.52/);
  assert.match(senior, /28\.96/);
});
test('unsupported identifiers and personal notes are escaped; unavailable evidence stays explicit', () => {
  const url = new URL('https://example.test/ratings.html');
  url.searchParams.set('position', '<img src=x onerror=alert(1)>');
  const html = renderWorkspace(readLocation(url), state());
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img/);
  const source = renderSource('ON-S16');
  assert.match(source, /No exact source passage/);
  assert.doesNotMatch(source, /Captured source passage/);
  const ui = state();
  ui.note = () => ({ value: '</textarea><script>alert(1)</script>', savedValue: '', error: '', saved: false });
  assert.doesNotMatch(renderWorkspace({ ...readLocation(new URL('https://example.test/ratings.html')), tab: 'evidence' }, ui), /<script>/);
});

test('PT-sUSDai keeps the October scope, watchlist and separate confidence states visible', () => {
  const location = readLocation(new URL('https://example.test/ratings.html?position=pt-susdai&tab=questions'));
  const html = renderWorkspace(location, state());
  assert.match(html, /ARBITRUM ONE/);
  assert.match(html, /Token contract/);
  assert.match(html, /NOT APPROVED · WATCHLIST/);
  assert.match(html, /22 Oct 2026/);
  assert.match(html, /Investor edition: 23 Oct 2026/);
  assert.match(html, /15 Oct 2026 · Matured/);
  assert.match(html, /Evidence confidence: Low; approved confidence is unassigned/);
  assert.match(html, /ratings-data\/documents\/pt-susdai\.md/);
  assert.match(html, /February 2027 candidate needs a separate assessment/);
  assert.doesNotMatch(html, /1\.450|grade B|Solana/);
});

test('comparison and research include the new position and dated full report', () => {
  const base = readLocation(new URL('https://example.test/ratings.html?position=pt-susdai'));
  const comparison = renderWorkspace({ ...base, view: 'compare' }, state());
  assert.match(comparison, /PT-sUSDai/);
  assert.match(comparison, /All 4 assessments/);
  assert.match(comparison, /colspan="5"/);
  assert.doesNotMatch(comparison, /All three|Shared ONyc requirements|Same source/);
  const research = renderWorkspace({ ...base, view: 'research' }, state());
  assert.match(research, /ratings-data\/documents\/pt-susdai\.md/);
  assert.match(research, /Investment evidence cutoff: 22 Oct 2026/);
  assert.match(research, /original sources have not been retrieved again/);
});

test('PT-sUSDai sources show inherited report provenance without implying a new capture', () => {
  const html = renderSource('SUSDAI-S01');
  assert.match(html, /Assessment evidence cutoff 22 Oct 2026/);
  assert.match(html, /No exact source passage/);
  assert.doesNotMatch(html, /undefined|Captured source passage/);
  assert.match(html, /ratings-data\/sources\/SUSDAI-S01\.json/);
});
