import onycPacket from '../data/research/onyc-evidence.json' with { type: 'json' };
import exponentPacket from '../data/research/exponent-evidence.json' with { type: 'json' };
import ptSusdaiPacket from '../data/research/pt-susdai-evidence.json' with { type: 'json' };
import retainedCaptures from '../data/research/source-captures.json' with { type: 'json' };

type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue | undefined };
type PacketSource = JsonObject & { id: string; limitation?: string };
export type SourceCapture = {
  sourceId: string;
  kind: 'api_fields' | 'api_scalar' | 'document_excerpt';
  sourceResponseSha256: string;
  provenance: string;
  groups: {
    label: string;
    location: string;
    fields?: { path: string; valueText: string }[];
    quote?: string;
  }[];
};
export type PacketRecord = { pointer: string; record: JsonObject };

const packets: { name: string; data: JsonObject }[] = [
  { name: 'onyc-evidence.json', data: onycPacket },
  { name: 'exponent-evidence.json', data: exponentPacket },
  { name: 'pt-susdai-evidence.json', data: ptSusdaiPacket },
];

/** Capture keys are original response JSON pointers, not normalized packet keys. */
export function getSourceCapture(sourceId: string): SourceCapture | undefined {
  return (retainedCaptures.captures as SourceCapture[]).find(capture => capture.sourceId === sourceId);
}

function recordsForSource(value: JsonValue | undefined, sourceId: string, pointer = ''): PacketRecord[] {
  if (value === null || typeof value !== 'object') return [];
  if (Array.isArray(value)) return value.flatMap((record, index) => recordsForSource(record, sourceId, `${pointer}/${index}`));
  if (value.source_id === sourceId || (Array.isArray(value.source_ids) && value.source_ids.includes(sourceId))) {
    return [{ pointer, record: value }];
  }
  return Object.entries(value).flatMap(([key, record]) => key === 'sources' ? [] : recordsForSource(record, sourceId, `${pointer}/${key.replace(/~/g, '~0').replace(/\//g, '~1')}`));
}

/** Read-only projection of the historical source packet; never fetches a live URL. */
export function getSourceRecord(sourceId: string) {
  const packet = packets.find(({ data }) => (data.sources as JsonObject[]).some(source => source.id === sourceId));
  if (!packet) return undefined;
  const source = (packet.data.sources as PacketSource[]).find(item => item.id === sourceId)!;
  const inheritedReport = packet.name === 'pt-susdai-evidence.json';
  return {
    schemaVersion: 'kurtosis.source-record.v1',
    dataKind: 'preserved_source_record',
    live: false,
    packetFile: `data/research/${packet.name}`,
    ...(inheritedReport ? {
      recordOrigin: 'supplied_investor_assessment',
      investmentEvidenceCutoff: ptSusdaiPacket.evidence_cutoff,
      documentEditionDate: ptSusdaiPacket.edition_date,
      originalSourceRetrievedForThisPage: false,
      suppliedReportUrl: '/ratings-data/documents/pt-susdai.md',
    } : {}),
    source,
    capture: getSourceCapture(sourceId) ?? null,
    captureLimitation: getSourceCapture(sourceId)
      ? 'Selected fields or a short passage from the historical response. This is not the complete original response. Original response hashes identify the input checked before extraction.'
      : inheritedReport
        ? 'Source metadata and attributed observations were inherited from the supplied investor assessment, whose investment-evidence cutoff is 22 October 2026. No original source was retrieved again for this page and no verbatim original-source capture is retained here.'
        : 'No exact source passage or API extract is retained here. The source metadata and attributed research records below do not constitute a verbatim source capture.',
    attribution: inheritedReport
      ? 'Packet records project the supplied investor assessment’s observations, interpretations and open questions. They are not new inspections of the linked sources. SUSDAI-S01–S33 correspond to S01–S33 in that report. A record citing multiple sources is not solely attributable to the selected source.'
      : 'Packet records contain researcher-normalized observations, paraphrases, interpretation and open questions. Each record retains its original source IDs; a record citing multiple sources is not solely attributable to the selected source.',
    packetRecords: recordsForSource(packet.data, sourceId),
    fullResearchPacketUrl: '/ratings-data/research.json',
  };
}
