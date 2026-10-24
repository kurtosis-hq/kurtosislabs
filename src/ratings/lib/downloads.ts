import documents from '../data/documents.json' with { type: 'json' };
import onyc from '../data/research/onyc-evidence.json' with { type: 'json' };
import exponent from '../data/research/exponent-evidence.json' with { type: 'json' };
import ptSusdai from '../data/research/pt-susdai-evidence.json' with { type: 'json' };
import ptSusdaiDocument from '../data/pt-susdai-document.json' with { type: 'json' };
import { assessments, sources, type Assessment } from './assessments.ts';
import { validateResearchData } from './assessment-rules.ts';
import { getSourceRecord } from './source-observations.ts';

const metadata = {
  methodologyVersion: 'v0.3-alpha', methodologyApproval: 'pending',
  approvalDisposition: 'NOT APPROVED', live: false,
  observationNote: 'Observation dates are historical research observations, not verified current market-state timestamps. PT-sUSDai source dates inherit the supplied report’s investment-evidence cutoff; its sources were not retrieved again for this page. Sources do not refresh automatically.',
  disclaimer: 'These preliminary assessments have not received rating approval. No scores or grades have been assigned. Evidence reflects the stated research dates.',
};

function researchMetadata(selectedAssessments: Assessment[]) {
  const dates = [...new Set(selectedAssessments.map(assessment => assessment.observedAt.slice(0, 10)))].sort();
  const timezones = [...new Set(selectedAssessments.map(assessment => assessment.id === 'pt-susdai' ? ptSusdaiDocument.researchTimezone : 'Asia/Singapore'))];
  return {
    ...metadata,
    researchDate: dates.length === 1 ? dates[0] : null,
    researchDateRange: { from: dates[0], to: dates.at(-1) },
    researchDates: Object.fromEntries(selectedAssessments.map(assessment => [assessment.id, assessment.observedAt.slice(0, 10)])),
    researchTimezone: timezones.length === 1 ? timezones[0] : null,
    documentEditions: selectedAssessments.filter(assessment => assessment.id === 'pt-susdai').map(assessment => ({
      assessmentId: assessment.id,
      documentEditionDate: ptSusdaiDocument.documentEditionDate,
      documentEditionTimezone: ptSusdaiDocument.documentEditionTimezone,
      investmentEvidenceCutoff: ptSusdaiDocument.researchDate,
      investmentEvidenceTimezone: ptSusdaiDocument.researchTimezone,
      investmentEvidenceRefreshed: ptSusdaiDocument.investmentEvidenceRefreshed,
    })),
  };
}

export function assessmentExport(assessment?: Assessment) {
  const selectedSources = assessment ? sources.filter(source => assessment.sourceIds.includes(source.id)) : sources;
  return {
    schemaVersion: 'kurtosis.assessment-read-model.v1', dataKind: 'assessment_read_model',
    metadata: { ...researchMetadata(assessment ? [assessment] : assessments), sourceObservationDates: [...new Set(selectedSources.map(source => source.observedAt))] },
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
    metadata: { ...researchMetadata(assessments), sourceObservationDates: [onyc.observed_at, exponent.observed_at, ptSusdai.observed_at] },
    packets: { onyc, exponent, 'pt-susdai': ptSusdai },
  });
  for (const source of sources) json(`sources/${source.id}`, `kurtosis-source-${source.id}.json`, getSourceRecord(source.id));
  for (const [name, document] of Object.entries({ ...documents, 'pt-susdai': ptSusdaiDocument })) files.set(`/ratings-data/documents/${name}.md`, {
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
