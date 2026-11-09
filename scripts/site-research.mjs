import { createResearchFiles } from '../src/ratings/lib/downloads.ts';

// V2 links to plain-text reports. Preserve the complete supplied documents;
// both Exponent positions are covered by the same Exponent research report.
export function createSiteResearchFiles() {
  const files = createResearchFiles();
  const reports = { onyc: 'onyc', 'pt-onyc': 'exponent', 'pt-sronyc': 'exponent', 'pt-susdai': 'pt-susdai' };
  for (const [position, document] of Object.entries(reports)) {
    files.set(`/ratings-data/briefs/${position}.txt`, {
      content: files.get(`/ratings-data/documents/${document}.md`).content,
      type: 'text/plain; charset=utf-8', filename: `${position}.txt`,
    });
  }
  return files;
}
