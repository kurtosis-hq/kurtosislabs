import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSiteResearchFiles } from './site-research.mjs';

const repository = fs.realpathSync(fileURLToPath(new URL('..', import.meta.url)));
const source = path.join(repository, 'kurtosis-website');
const output = path.join(repository, 'dist');

// Clear only this repository's generated output, never a symlink target.
if (fs.existsSync(output) && fs.realpathSync(output) !== output) {
  throw new Error(`Refusing to replace redirected output directory: ${output}`);
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);

// V2 contains a prebuilt Next.js export. Copy it intact instead of rebundling it
// with Vite, and keep source, internal handoffs and quick-view copies unpublished.
const published = [
  'index.html', 'mobile.html', 'contact.html', 'coming-soon.html',
  'styles.css', 'mobile.css', 'contact.css', 'favicon.ico',
  'assets', 'js', 'ratings', 'ratings-static',
];
for (const entry of published) {
  fs.cpSync(path.join(source, entry), path.join(output, entry), { recursive: true });
}

// Keep the existing canonical research downloads available on every deployment.
for (const [url, file] of createSiteResearchFiles()) {
  const destination = path.join(output, url.slice(1));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, file.content);
}

// The supplied Ratings export points downloads at production. Use this site's
// own identical records so preview deployments work independently of that host.
function localizeDownloads(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) localizeDownloads(filename);
    else if (/\.(html|js|txt)$/.test(entry.name)) {
      const original = fs.readFileSync(filename, 'utf8');
      const updated = original.replaceAll('https://www.kurtosislabs.com/ratings-data', '/ratings-data');
      if (updated !== original) fs.writeFileSync(filename, updated);
    }
  }
}
localizeDownloads(path.join(output, 'ratings'));
localizeDownloads(path.join(output, 'ratings-static'));
console.log('Built V2 desktop, mobile, contact and Ratings pages in dist/.');
