import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createResearchFiles } from '../src/ratings/lib/downloads.ts';

const root = path.resolve('dist');
const researchFiles = createResearchFiles();
for (const [url, file] of researchFiles) {
  const emitted = path.join(root, url.slice(1));
  assert.ok(fs.existsSync(emitted), `Missing research file: ${url}`);
  assert.equal(fs.readFileSync(emitted, 'utf8'), file.content, `Research file differs from canonical record: ${url}`);
}
for (const [position, document] of Object.entries({ onyc: 'onyc', 'pt-onyc': 'exponent', 'pt-sronyc': 'exponent', 'pt-susdai': 'pt-susdai' })) {
  assert.equal(fs.readFileSync(path.join(root, `ratings-data/briefs/${position}.txt`), 'utf8'),
    researchFiles.get(`/ratings-data/documents/${document}.md`).content,
    `V2 report must preserve its complete source document: ${position}`);
}
const pages = ['index.html', 'mobile.html', 'contact.html', 'coming-soon.html',
  'ratings/index.html', 'ratings/compare/index.html', 'ratings/sources/index.html',
  'ratings/methodology/index.html', ...['onyc', 'pt-onyc', 'pt-sronyc', 'pt-susdai']
    .map(slug => `ratings/positions/${slug}/index.html`)];
function checkLink(link, base, owner) {
  link = link.replaceAll('&amp;', '&');
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(link)) return;
  const target = decodeURIComponent(link.split(/[?#]/)[0]);
  const filename = target.startsWith('/')
    ? path.join(root, target.slice(1)) : path.resolve(base, target);
  assert.ok(fs.existsSync(filename), `${owner}: broken local link ${link}`);
  if (fs.statSync(filename).isDirectory()) {
    assert.ok(fs.existsSync(path.join(filename, 'index.html')), `${owner}: missing directory index ${link}`);
  }
}
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  // ratings_fix.py injects a root <base> into the exported Ratings pages.
  const base = page.startsWith('ratings/') ? root : path.dirname(path.join(root, page));
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    // Ignore the dynamic <base> expression in the inline bootstrap script.
    if (match[1] === '+root+') continue;
    checkLink(match[1], base, page);
  }
  assert.doesNotMatch(html, /https:\/\/www\.kurtosislabs\.com\/ratings-data\//);
}
for (const file of fs.readdirSync(root, { recursive: true })) {
  if (!file.endsWith('.css')) continue;
  const css = fs.readFileSync(path.join(root, file), 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
    checkLink(match[1], path.dirname(path.join(root, file)), file);
  }
}
assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'),
  fs.readFileSync('kurtosis-website/index.html', 'utf8'), 'Homepage must be V2');
for (const excluded of ['docs', 'src', 'ratings-app', 'quick-view', 'README.md', 'concept-85.html']) {
  assert.ok(!fs.existsSync(path.join(root, excluded)), `Unpublished file was included: ${excluded}`);
}
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
assert.equal(config.outputDirectory, 'dist');
assert.ok(!config.rewrites?.some(rule => rule.source === '/'), 'Homepage must not rewrite to V1');
for (const redirect of config.redirects) checkLink(redirect.destination, root, redirect.source);
for (const name of ['plan', 'visualization']) assert.ok(!fs.existsSync(path.join(root, `ratings-data/documents/${name}.md`)));
console.log(`Production assets verified: ${pages.length} pages, ${researchFiles.size} canonical research downloads, no internal documents.`);
