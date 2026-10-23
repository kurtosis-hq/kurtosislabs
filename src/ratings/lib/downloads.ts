import documents from '../data/documents.json' with { type: 'json' };
import onyc from '../data/research/onyc-evidence.json' with { type: 'json' };
import exponent from '../data/research/exponent-evidence.json' with { type: 'json' };
import { assessments, sources, type Assessment } from './assessments.ts';
import { validateResearchData } from './assessment-rules.ts';
import { getSourceRecord } from './source-observations.ts';

const metadata = {
  researchDate: '2026-09-08', researchTimezone: 'Asia/Singapore',
  methodologyVersion: 'v0.3-alpha', methodologyApproval: 'pending',
  approvalDisposition: 'NO_RATE', live: false,
  observationNote: 'Observation dates identify retrieval, not a verified market-state timestamp. Sources do not refresh automatically.',
  disclaimer: 'These preliminary assessments have not received rating approval. No scores or grades have been assigned. Evidence reflects the stated research dates.',
};

export function assessmentExport(assessment?: Assessment) {
  const selectedSources = assessment ? sources.filter(source => assessment.sourceIds.includes(source.id)) : sources;
  return {
    schemaVersion: 'kurtosis.assessment-read-model.v1', dataKind: 'assessment_read_model',
    metadata: { ...metadata, sourceObservationDates: [...new Set(selectedSources.map(source => source.observedAt))] },
    ...(assessment ? { assessment } : { assessments }), sources: selectedSources,
  };
}

export type ResearchFile = { content: string; type: string; filename: string };

/** This allowlist is shared by the dev server and production asset generator. */
export function createResearchFiles(): Map<string, ResearchFile> {
  const errors = validateResearchData();
  if (errors.length) throw new Error(`Research validation failed: ${errors.join('; ')}`);
  const files = new Map<string, ResearchFile>();
  const json = (name: string, filename: string, body: unknown) => files.set(`/ratings-data/${name}.json`, {
    content: JSON.stringify(body, null, 2) + '\n', type: 'application/json; charset=utf-8', filename,
  });
  json('assessments', 'kurtosis-assessments-research.json', assessmentExport());
  for (const assessment of assessments) json(`assessments/${assessment.id}`, `kurtosis-${assessment.id}-assessment-research.json`, assessmentExport(assessment));
  json('research', 'kurtosis-source-research-packets.json', {
    schemaVersion: 'kurtosis.research-bundle.v1', dataKind: 'research_evidence_bundle',
    metadata: { ...metadata, sourceObservationDates: [onyc.observed_at, exponent.observed_at] },
    packets: { onyc, exponent },
  });
  for (const source of sources) json(`sources/${source.id}`, `kurtosis-source-${source.id}.json`, getSourceRecord(source.id));
  for (const [name, document] of Object.entries(documents)) files.set(`/ratings-data/documents/${name}.md`, {
    content: document.text, type: 'text/markdown; charset=utf-8', filename: document.filename,
  });
  return files;
}

export function serveResearchFile(path: string, download = false): Response {
  const file = createResearchFiles().get(path);
  if (!file) return Response.json({ error: 'Research file not found.' }, { status: 404 });
  return new Response(file.content, { headers: {
    'Content-Type': file.type, 'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${file.filename}"`,
  } });
}
