import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createResearchFiles } from '../src/ratings/lib/downloads.ts';

const root = path.resolve('dist');
for (const [url, file] of createResearchFiles()) {
  const emitted = path.join(root, url.slice(1));
  assert.ok(fs.existsSync(emitted), `Missing research file: ${url}`);
  assert.equal(fs.readFileSync(emitted, 'utf8'), file.content, `Research file differs from canonical record: ${url}`);
}
for (const page of ['index.html', 'concept-85.html', 'ratings.html', 'ratings-methodology.html', 'methodology.html', 'horizon.html', 'horizon-01.html']) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const link = match[1].replaceAll('&amp;', '&');
    if (/^(?:https?:|mailto:|data:|javascript:|#)/.test(link)) continue;
    const target = decodeURIComponent(link.split(/[?#]/)[0]);
    assert.ok(fs.existsSync(path.resolve(root, target.replace(/^\//, ''))), `${page}: broken local link ${link}`);
  }
  if (page === 'ratings.html') assert.doesNotMatch(html, /href="#"|concept-79|ratings-research\.html/);
}
assert.ok(!fs.existsSync(path.join(root, 'docs')));
for (const name of ['plan', 'visualization']) assert.ok(!fs.existsSync(path.join(root, `ratings-data/documents/${name}.md`)));
console.log('Production assets verified: 7 pages, 46 canonical research downloads, no internal documents.');
