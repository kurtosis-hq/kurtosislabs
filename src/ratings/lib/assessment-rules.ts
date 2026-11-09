import { assessments, sources, type Assessment } from './assessments.ts';
import onycPacket from '../data/research/onyc-evidence.json' with { type: 'json' };
import exponentPacket from '../data/research/exponent-evidence.json' with { type: 'json' };

const states = new Set(['complete', 'partial', 'stale', 'contradictory', 'missing', 'unevaluable']);
const roles = new Set(['held', 'D', 'S', 'R']);
const routeIds = ['entry', 'settlement', 'early', 'stress'];
const base58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const evmAddress = /^0x[0-9a-fA-F]{40}$/;
const onycIds = ['onyc', 'pt-onyc', 'pt-sronyc'];
const supportedIds = [...onycIds, 'pt-susdai'];
const susdaiIdentity = {
  mint: '0xb459db106f645d698e74027eef6019a26a0675cc',
  market: '0xcbf629c8d396b1261f81f55175afa010e94787d8',
  maturity: '2026-10-15T00:00:00Z',
};
const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

function isDate(value: unknown, requireTimestamp = false): value is string {
  if (!isText(value)) return false;
  const pattern = /^(\d{4})-(\d{2})-(\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d))?$/;
  const match = pattern.exec(value);
  if (!match || (requireTimestamp && !value.includes('T')) || !Number.isFinite(Date.parse(value))) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  return calendar.getUTCFullYear() === year && calendar.getUTCMonth() === month - 1 && calendar.getUTCDate() === day;
}

/** Research-only integrity and honesty checks. This does not approve or calculate a rating. */
export function validateAssessment(assessment: Assessment): string[] {
  const errors: string[] = [];
  if (!isObject(assessment)) return ['Assessment must be an object.'];
  const prefix = typeof assessment.id === 'string' ? assessment.id : 'assessment';
  const fail = (message: string) => errors.push(`${prefix}: ${message}`);
  const sourceSet = new Set(sources.map((source) => source.id));
  const requiredText = ['id', 'symbol', 'name', 'type', 'protocol', 'chain', 'mint', 'identityBasis', 'summary', 'blocker', 'lane', 'lossObject', 'methodologyVersion'];
  for (const field of requiredText) if (!isText(assessment[field as keyof Assessment])) fail(`${field} must be nonempty.`);
  if (!supportedIds.includes(assessment.id)) fail('Unsupported assessment identity.');
  if (assessment.disposition !== 'NOT APPROVED') fail('Research-only assessments must retain NOT APPROVED.');
  for (const field of ['approvedScore', 'approvedGrade', 'approvedConfidence', 'indicatedScore', 'indicatedGrade'] as const) {
    if (assessment[field] !== null) fail(`${field} must remain null until supported scoring and approval exist.`);
  }
  if (assessment.methodologyVersion !== 'v0.3-alpha') fail('Methodology change requires a reviewed research-data revision.');
  if (!isDate(assessment.observedAt)) fail('Observed date is missing or invalid.');
  if (assessment.id === 'pt-susdai') {
    if (assessment.approvalStatus !== 'NOT APPROVED' || assessment.watchlist !== true || assessment.indicatedEvidenceConfidence !== 'Low') fail('PT-sUSDai must retain the report’s NOT APPROVED status, required watchlist and Low indicated evidence confidence.');
    if (assessment.chain !== 'Arbitrum One') fail('PT-sUSDai must retain its Arbitrum One network identity.');
    if (!isText(assessment.mint) || !evmAddress.test(assessment.mint)) fail('A valid-format EVM PT address is required.');
    if (!isText(assessment.market) || !evmAddress.test(assessment.market)) fail('A valid-format EVM market address is required.');
    if (!isText(assessment.mint) || assessment.mint.toLowerCase() !== susdaiIdentity.mint || !isText(assessment.market) || assessment.market.toLowerCase() !== susdaiIdentity.market) fail('PT-sUSDai PT and market must match the documented October research position.');
    if (!isDate(assessment.maturity, true) || Date.parse(assessment.maturity) !== Date.parse(susdaiIdentity.maturity)) fail('PT-sUSDai maturity must match the documented October research position.');
  } else if (onycIds.includes(assessment.id)) {
    if (assessment.chain !== 'Solana') fail('ONyc-family research packets cover Solana only.');
    if (!isText(assessment.mint) || !base58.test(assessment.mint)) fail('A valid-format Solana mint is required.');
    if (assessment.id === 'onyc') {
      if (assessment.mint !== onycPacket.identity.mint) fail('ONyc mint must match the documented research identity.');
      if (assessment.maturity !== null) fail('ONyc does not have a PT maturity.');
      if (assessment.market !== null) fail('A spot-token assessment must not borrow a PT market identity.');
    } else {
      if (!isDate(assessment.maturity, true)) fail('A PT requires an explicit valid maturity timestamp with timezone.');
      if (!isText(assessment.market) || !base58.test(assessment.market)) fail('A PT requires its exact vault/market identifier.');
      const expected = exponentPacket.candidate_markets.find((market) => market.series === (assessment.id === 'pt-sronyc' ? 'srONyc-10SEPT26' : 'ONyc-10SEPT26'));
      if (!expected || assessment.mint !== expected.pt_mint || assessment.market !== expected.vault_address) fail('PT mint and vault must match the selected September research series.');
      if (expected && isDate(assessment.maturity, true) && Date.parse(assessment.maturity) !== Date.parse(expected.maturity_utc)) fail('PT maturity must match the exact selected research series.');
    }
  }
  if (!Array.isArray(assessment.scopeAssumptions) || assessment.scopeAssumptions.length === 0 || assessment.scopeAssumptions.some((item) => !isText(item))) fail('Explicit nonempty scope assumptions are required.');

  function checkSources(value: unknown, location: string) {
    if (!Array.isArray(value) || value.length === 0) { fail(`${location} must name supporting source IDs.`); return; }
    const seen = new Set<string>();
    for (const id of value) {
      if (!isText(id) || !sourceSet.has(id)) fail(`${location} references unknown source ${String(id)}.`);
      if (seen.has(String(id))) fail(`${location} repeats source ${String(id)}.`);
      seen.add(String(id));
    }
  }
  checkSources(assessment.sourceIds, 'sourceIds');
  const declaredSourceIds = new Set(Array.isArray(assessment.sourceIds) ? assessment.sourceIds : []);
  function checkItemSources(item: Record<string, unknown>, location: string) {
    checkSources(item.sourceIds, location);
    if (Array.isArray(item.sourceIds)) for (const id of item.sourceIds) if (!declaredSourceIds.has(id)) fail(`${location} source ${String(id)} is absent from the assessment source register.`);
  }
  function items(value: unknown, location: string): Record<string, unknown>[] {
    if (!Array.isArray(value) || value.length === 0) { fail(`${location} must be a nonempty array.`); return []; }
    const valid: Record<string, unknown>[] = [];
    const ids = new Set<string>();
    for (const item of value) {
      if (!isObject(item)) { fail(`${location} contains a malformed item.`); continue; }
      if (!isText(item.id)) fail(`${location} contains a missing ID.`);
      else if (ids.has(item.id)) fail(`${location} repeats ID ${item.id}.`);
      else ids.add(item.id);
      valid.push(item);
    }
    return valid;
  }
  const factors = items(assessment.factors, 'factors');
  for (const factor of factors) {
    if (!isText(factor.title) || !isText(factor.detail)) fail('Each factor needs a title and explanation.');
    if (!states.has(String(factor.state))) fail(`Factor ${String(factor.id)} has invalid evidence state.`);
    checkItemSources(factor, `factor ${String(factor.id)}`);
  }
  const evidence = items(assessment.evidence, 'evidence');
  for (const area of evidence) {
    if (!isText(area.title) || !isText(area.summary) || !isText(area.gap)) fail('Each evidence area needs a title, finding and unresolved input.');
    if (!states.has(String(area.state))) fail(`Evidence ${String(area.id)} has invalid evidence state.`);
    checkItemSources(area, `evidence ${String(area.id)}`);
  }
  const layers = items(assessment.layers, 'layers');
  const byId = new Map(layers.filter((layer) => isText(layer.id)).map((layer) => [String(layer.id), layer]));
  const held = layers.filter((layer) => layer.role === 'held');
  if (held.length !== 1) fail('Exactly one held-position layer is required.');
  for (const layer of layers) {
    for (const key of ['title', 'subtitle', 'description', 'risk']) if (!isText(layer[key])) fail(`Layer ${String(layer.id)} needs ${key}.`);
    if (!roles.has(String(layer.role))) fail(`Layer ${String(layer.id)} has an invalid graph role.`);
    if (layer.role === 'held' && layer.parentId !== undefined) fail('The held-position root cannot have a parent.');
    if (layer.role !== 'held' && (!isText(layer.parentId) || !byId.has(layer.parentId))) fail(`Layer ${String(layer.id)} needs an existing parent.`);
    checkItemSources(layer, `layer ${String(layer.id)}`);
    const visited = new Set<string>();
    let current: Record<string, unknown> | undefined = layer;
    while (current) {
      const id = String(current.id);
      if (visited.has(id)) { fail(`Dependency cycle at ${id}.`); break; }
      visited.add(id);
      current = isText(current.parentId) ? byId.get(current.parentId) : undefined;
    }
  }
  if (assessment.id === 'pt-sronyc') {
    const junior = byId.get('junior');
    if (!junior || junior.role !== 'S' || junior.parentId !== 'senior') fail('Junior capital must remain a protection dependency attached to senior, not an owned scoring child.');
    if (!byId.has('senior') || !byId.has('onyc-token')) fail('Senior and inherited ONyc exposure must remain visible.');
  }
  if (onycIds.includes(assessment.id) && (!byId.has('reinsurance') || !byId.has('collateral'))) fail('Reinsurance exposures and supporting collateral functions must remain visible.');

  const routes = items(assessment.routes, 'routes');
  for (const id of routeIds) if (!routes.some((route) => route.id === id)) fail(`Missing ${id} route.`);
  for (const route of routes) {
    if (!routeIds.includes(String(route.id))) fail(`Unsupported route ${String(route.id)}.`);
    if (!isText(route.label) || !isText(route.summary)) fail(`Route ${String(route.id)} needs a label and summary.`);
    if (!Array.isArray(route.steps) || route.steps.length === 0) { fail(`Route ${String(route.id)} needs ordered steps.`); continue; }
    for (const step of route.steps) {
      if (!isObject(step)) { fail(`Route ${String(route.id)} contains a malformed step.`); continue; }
      for (const key of ['title', 'input', 'output', 'condition', 'risk']) if (!isText(step[key])) fail(`Route ${String(route.id)} step needs ${key}.`);
      checkItemSources(step, `route ${String(route.id)}`);
    }
  }
  return errors;
}

export function validateResearchData(): string[] {
  const errors: string[] = [];
  const sourceIds = new Set<string>();
  for (const source of sources) {
    if (sourceIds.has(source.id)) errors.push(`Duplicate source ID ${source.id}.`);
    sourceIds.add(source.id);
    for (const key of ['id', 'title', 'publisher', 'url'] as const) if (!isText(source[key])) errors.push(`Source ${source.id} needs ${key}.`);
    if (source.id === 'SUSDAI-REPORT' && source.url === '/ratings-data/documents/pt-susdai.md') {
      // The supplied report itself supports its methodology and approval conclusions.
    } else try {
      if (new URL(source.url).protocol !== 'https:') errors.push(`Source ${source.id} must link directly to HTTPS evidence.`);
    } catch { errors.push(`Source ${source.id} has an invalid URL.`); }
    if (!isDate(source.observedAt)) errors.push(`Source ${source.id} needs a valid observation date.`);
  }
  const assessmentIds = new Set<string>();
  const mints = new Set<string>();
  for (const assessment of assessments) {
    if (assessmentIds.has(assessment.id)) errors.push(`Duplicate assessment ID ${assessment.id}.`);
    if (mints.has(assessment.mint)) errors.push(`Distinct positions must not share a mint: ${assessment.mint}.`);
    assessmentIds.add(assessment.id);
    mints.add(assessment.mint);
    errors.push(...validateAssessment(assessment));
  }
  for (const id of supportedIds) if (!assessmentIds.has(id)) errors.push(`Missing research assessment ${id}.`);
  return errors;
}
