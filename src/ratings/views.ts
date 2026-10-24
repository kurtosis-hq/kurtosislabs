import { assessments, getAssessment, gradeLadder, sourceById, sources, type Assessment, type Layer } from './lib/assessments.ts';
import { approvalSummary, factorEvidence, factorTakeaways, investmentImplications, prioritizedFactors } from './lib/assessment-guidance.ts';
import { comparisonEvidenceCell, comparisonEvidenceRows } from './lib/comparison.ts';
import { getSourceRecord } from './lib/source-observations.ts';
import { locationUrl, type WorkspaceLocation } from './lib/navigation.ts';
import type { Note } from './lib/notes.ts';
import exponent from './data/research/exponent-evidence.json' with { type: 'json' };

export const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export const date = (value: string, exact = false) => new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  ...(exact ? { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' as const } : {}),
}).format(new Date(value)) + (exact ? ' UTC' : '');
const short = (value: string) => `${value.slice(0, 6)}…${value.slice(-5)}`;
export const evidenceLabels: Record<string, string> = { complete: 'Complete', partial: 'Partial', stale: 'Stale', contradictory: 'Conflicting', missing: 'Missing', unevaluable: 'Unavailable' };
const arrow = '<span aria-hidden="true">↗</span>';
const badge = (state: string) => `<span class="rw-badge state-${escape(state)}">${escape(evidenceLabels[state] || state)}</span>`;
const section = (title: string, number = '') => `<div class="rw-section-heading">${number ? `<span>${number}</span>` : ''}<h2>${title}</h2></div>`;
export function workspaceHref(location: WorkspaceLocation, next: Partial<WorkspaceLocation>) {
  const url = locationUrl(new URL('https://local.invalid/ratings.html'), { ...location, source: null, target: '', ...next });
  return escape(url.pathname.slice(1) + url.search + url.hash);
}
function sourceLinks(ids: string[]) {
  return `<div class="rw-sources">${ids.map(id => {
    const source = sourceById(id);
    return source ? `<button type="button" class="rw-link" data-source="${escape(id)}">${escape(source.title)} ${arrow}</button>` : '';
  }).join('')}</div>`;
}
const exportLink = (p: Assessment) => `<a class="rw-button primary" href="ratings-data/assessments/${p.id}.json" download="kurtosis-${p.id}-assessment-research.json"><span aria-hidden="true">↓</span> Export assessment</a>`;

export type ViewState = { layerId: string; evidenceFilter: string; expandedFactors: boolean; note: (id: string) => Note };
export function roleName(layer: Layer) {
  if (layer.id === 'junior') return 'Protection dependency';
  return { held: 'Position held', D: 'Economic dependency', S: 'Shared control dependency', R: 'Exit route dependency' }[layer.role];
}
function layerDetail(layer: Layer) {
  return `<span class="rw-eyebrow">${roleName(layer)}</span><h3>${escape(layer.title)}</h3><p>${escape(layer.description)}</p>
    <h4>What needs scrutiny</h4><p>${escape(layer.risk)}</p><h4>Evidence</h4>${sourceLinks(layer.sourceIds)}
    <p class="rw-caption">${layer.id === 'junior' ? 'Junior capital is finite support, not another asset owned by this holder.' : layer.role === 'S' ? 'This shared control may affect several layers together.' : layer.role === 'R' ? 'This is an alternative exit, not an underlying asset.' : 'Economic relationships are proposed analytical treatments.'} No layer score is issued.</p>`;
}
function dependencies(p: Assessment, state: ViewState) {
  const selected = p.layers.find(l => l.id === state.layerId) ?? p.layers.find(l => l.role === 'held')!;
  function node(layer: Layer) {
    const active = selected.id === layer.id;
    return `<button type="button" class="rw-layer${active ? ' selected' : ''}" id="layer-${layer.id}" data-layer="${layer.id}" aria-expanded="${active}"${active ? ` aria-controls="layer-inspector inline-${layer.id}"` : ''}>
      <span class="rw-layer-icon" aria-hidden="true">${layer.role === 'held' ? '01' : layer.id === 'junior' ? '↳' : layer.role === 'S' ? '◇' : layer.role === 'R' ? '↗' : '↓'}</span>
      <span><strong>${escape(layer.title)}</strong><small>${escape(layer.subtitle)}</small><span class="rw-layer-role">${roleName(layer)}</span></span><span aria-hidden="true">›</span></button>
      ${active ? `<div class="rw-inline-inspector" id="inline-${layer.id}">${layerDetail(layer)}</div>` : ''}`;
  }
  function branch(layer: Layer): string {
    const children = p.layers.filter(l => l.parentId === layer.id && (l.role === 'D' || l.id === 'junior'));
    return `<li class="${layer.id === 'junior' ? 'rw-protection-branch' : ''}">${node(layer)}${children.length ? `<ol>${children.map(branch).join('')}</ol>` : ''}</li>`;
  }
  const root = p.layers.find(l => l.role === 'held')!;
  const controls = p.layers.filter(l => (l.role === 'S' || l.role === 'R') && l.id !== 'junior');
  return `${p.id === 'pt-sronyc' ? protection() : ''}<div class="rw-dependencies">
    <div><section class="rl-box rw-card">${section('What you actually own')}<p class="rw-intro">Follow the held position down to its economic exposure. Select a layer for its role, risks and evidence.</p><ol class="rw-tree">${branch(root)}</ol></section>
    <section class="rl-box rw-card rw-controls">${section('Controls and exit dependencies')}${controls.map(l => `<div><p class="rw-caption">${l.role === 'R' ? 'Alternative exit for' : 'Shared controls affecting'} ${escape(p.layers.find(parent => parent.id === l.parentId)?.title)}</p>${node(l)}</div>`).join('')}</section></div>
    <aside class="rl-box rw-inspector" id="layer-inspector" aria-label="Selected layer" aria-live="polite">${layerDetail(selected)}</aside></div>`;
}
function protection() {
  const s = exponent.tranching_snapshot;
  const coverage = (Number(s.coverage_ratio) * 100).toFixed(2);
  const min = Number(s.minimum_coverage_ratio) * 100;
  const money = (value: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
  return `<section class="rl-box rw-card rw-protection">${section('Senior protection snapshot')}<div class="rw-protection-grid"><div>
    <p>Junior share of total effective NAV</p><p class="rw-protection-value">${coverage}<span>%</span></p><p>Junior capital absorbs losses first. That support can be depleted.</p>
    <div class="rw-coverage" role="img" aria-label="Junior share ${coverage}% of total effective NAV; configured minimum ${min}%"><div class="rw-coverage-track"><i style="width:${coverage}%"></i><b style="left:${min}%"><span>Min ${min}%</span></b></div><div class="rw-coverage-scale"><span>0%</span><span>20%</span><span>40%</span><span>60%</span><span>80%</span><span>100%</span></div></div>
    <p class="rw-caption">Coverage = junior effective NAV ÷ total effective NAV. This is not a risk score or guaranteed protection.</p></div>
    <div><dl class="rw-facts"><div><dt>Junior effective NAV</dt><dd>${money(s.junior_effective_nav_usd)}</dd></div><div><dt>Total effective NAV</dt><dd>${money(s.total_effective_nav_usd)}</dd></div><div><dt>Reported last NAV sync</dt><dd>${date(s.last_sync_utc, true)}</dd></div></dl><p class="rw-caption">Retrieved ${date(s.observed_at)}. Recovery may pause senior withdrawals beyond PT maturity.</p>${sourceLinks(['EXP-API-TRANCHING', 'EXP-WATERFALL'])}</div></div></section>`;
}
function routes(p: Assessment, location: WorkspaceLocation) {
  const route = p.routes.find(r => r.id === location.route)!;
  return `<section class="rl-box rw-card">${section('Exit routes')}<p class="rw-intro">Each conversion introduces its own conditions. The comparison cash destination is USDC; executable outputs remain unverified.</p>
    ${p.maturity ? `<p class="rw-caption">Historical series maturity: ${date(p.maturity, true)}. Maturity and cash availability are separate events.</p>` : '<p class="rw-caption">ONyc has no contractual PT maturity. Issuer redemption and a secondary sale are separate routes.</p>'}
    <div class="rw-scenarios" role="group" aria-label="Exit scenarios">${p.routes.map(r => `<button type="button" id="scenario-${r.id}" data-route="${r.id}" aria-pressed="${r.id === route.id}">${escape(r.label)}</button>`).join('')}</div>
    <div class="rw-route-summary"><span class="rw-eyebrow">${route.id === 'stress' ? 'Stress scenario' : 'Route under review'}</span><h3>${escape(route.summary)}</h3></div>
    <ol class="rw-route-steps">${route.steps.map((s, i) => `<li><span class="rw-step-number">${String(i + 1).padStart(2, '0')}</span><div><h3>${escape(s.title)}</h3><div class="rw-conversion"><span>${escape(s.input)}</span><span aria-hidden="true">→</span><span>${escape(s.output)}</span></div><div class="rw-step-details"><div><h4>Required condition</h4><p>${escape(s.condition)}</p></div><div><h4>Failure point</h4><p>${escape(s.risk)}</p></div></div>${sourceLinks(s.sourceIds)}</div></li>`).join('')}</ol>
    <p class="rw-notice">Historical research map. No transaction was simulated or submitted. Exit capacity, fees and settlement units require verification for the chosen size and wallet.</p></section>`;
}
function questions(p: Assessment, location: WorkspaceLocation, state: ViewState) {
  const factors = prioritizedFactors(p);
  return `<section class="rl-box rw-card rw-result">${section('Assessment result')}<div><p class="rw-not-approved">NOT APPROVED${p.watchlist ? ' · WATCHLIST' : ''}</p>${exportLink(p)}</div><p>${escape(approvalSummary[p.id])}</p><p class="rw-caption">Technical status: NOT APPROVED · No score, grade or approved confidence assigned · Methodology v0.3-alpha, approval pending${p.indicatedEvidenceConfidence ? `</p><p class="rw-caption">Evidence confidence for an investment rating: ${escape(p.indicatedEvidenceConfidence)}. This is separate from approved confidence, which is not assigned.` : ''}</p></section>
    <section class="rl-box rw-card" id="risk-factors">${section('What prevents approval')}<p class="rw-intro">Three priority evidence requirements. Additional unresolved issues remain relevant to approval.</p>
    <ol class="rw-factors">${factors.filter((_, i) => state.expandedFactors || i < 3).map((factor, i) => {
      const takeaway = factorTakeaways[factor.id];
      const evidence = p.evidence.find(e => e.id === factorEvidence[factor.id]);
      return `<li><div><span class="rw-eyebrow">${String(i + 1).padStart(2, '0')}</span><h3>${escape(takeaway?.finding || factor.title)}</h3><p>${escape(takeaway?.implication || factor.detail)}</p></div><div><h4>Evidence</h4><p>${escape(factor.detail)}</p></div><div><h4>To resolve</h4><p>${escape(evidence?.gap || p.blocker)}</p></div><div>${badge(factor.state)}${evidence ? `<a class="rw-link" data-evidence="${evidence.id}" href="${workspaceHref(location, { tab: 'evidence', target: `evidence-${evidence.id}` })}">Review full evidence ${arrow}</a>` : ''}${sourceLinks(factor.sourceIds)}</div></li>`;
    }).join('')}</ol><button type="button" class="rw-button secondary" data-toggle-factors aria-expanded="${state.expandedFactors}">${state.expandedFactors ? 'Show three priority issues' : `Show all ${factors.length} issues`}</button></section>
    <section class="rw-implication"><span class="rw-eyebrow">Investment implication</span><h2>${escape(investmentImplications[p.id].title)}</h2><p>${escape(investmentImplications[p.id].detail)}</p><a class="rw-link" data-tab="routes" href="${workspaceHref(location, { tab: 'routes' })}">Inspect the route to cash →</a></section>`;
}
function scope(p: Assessment) {
  return `<section class="rl-box rw-card" id="position-scope">${section('Position scope')}<p class="rw-intro">${escape(p.identityBasis)}</p><dl class="rw-scope"><div><dt>Full token ${p.chain === 'Solana' ? 'mint' : 'contract'}</dt><dd><code>${escape(p.mint)}</code><button type="button" class="rw-link" data-copy="mint">Copy address</button></dd></div>${p.market ? `<div><dt>Vault / market identifier</dt><dd><code>${escape(p.market)}</code><button type="button" class="rw-link" data-copy="market">Copy identifier</button></dd></div>` : ''}<div><dt>Series maturity</dt><dd>${p.maturity ? date(p.maturity, true) : 'No contractual PT maturity'}</dd></div><div><dt>Lane / loss object</dt><dd>${escape(p.lane)} / ${escape(p.lossObject)}</dd></div><div><dt>Evidence ${p.id === 'pt-susdai' ? 'cutoff' : 'retrieved'}</dt><dd>${date(p.observedAt)} · No automatic refresh</dd></div></dl><h3 class="rw-subheading">Scope assumptions</h3><ul class="rw-assumptions">${p.scopeAssumptions.map(a => `<li>${escape(a)}</li>`).join('')}</ul></section>`;
}
export function noteStatus(note: Note) {
  return note.error || (note.value !== note.savedValue ? 'Unsaved draft' : note.saved ? 'Saved in this browser' : `${note.value.length.toLocaleString('en-US')} / 5,000 characters`);
}
function evidence(p: Assessment, state: ViewState) {
  const filtered = p.evidence.filter(e => state.evidenceFilter === 'all' || e.state === state.evidenceFilter);
  const note = state.note(p.id);
  return `<section class="rl-box rw-card">${section('Evidence and open questions')}<p class="rw-intro">Documentation establishes described mechanics. Deployment, legal rights and execution require their own evidence.</p>
    <div class="rw-evidence-toolbar"><label>Filter evidence <select id="evidence-filter"><option value="all">All evidence states</option>${Object.entries(evidenceLabels).map(([key, label]) => `<option value="${key}"${state.evidenceFilter === key ? ' selected' : ''}>${label}</option>`).join('')}</select></label><a class="rw-link" href="#position-scope">Position scope ↓</a><a class="rw-link" href="#research-note">Your research note ↓</a></div>
    <div class="rw-evidence-list">${filtered.map(e => `<article class="rw-evidence-item" id="evidence-${e.id}" tabindex="-1"><div><h3>${escape(e.title)}</h3>${badge(e.state)}</div><p>${escape(e.summary)}</p><div class="rw-evidence-gap"><h4>To resolve</h4><p>${escape(e.gap)}</p></div>${sourceLinks(e.sourceIds)}</article>`).join('') || '<div class="rw-empty"><p>No evidence items have this state.</p><button type="button" class="rw-link" data-clear-filter>Show all evidence</button></div>'}</div></section>
    ${scope(p)}<section class="rl-box rw-card" id="research-note">${section('Your research note')}<p class="rw-intro">Saved only in this browser. Notes are not sent to Kurtosis.</p><label class="rw-note-label" for="research-note-field">Follow-up for ${p.symbol}</label><textarea id="research-note-field" rows="5" maxlength="5000" placeholder="Record a question to resolve before allocation…">${escape(note.value)}</textarea><div class="rw-note-actions"><output id="note-status" aria-live="polite">${escape(noteStatus(note))}</output><button type="button" class="rw-button primary" data-save-note>Save note</button></div></section>`;
}
function compare(location: WorkspaceLocation) {
  const groups = [['position', 'Position and protocol requirements'], ['underlying', 'Underlying assets, claims and cash access']];
  const titles = `<thead><tr><th scope="col">Required area</th>${assessments.map(p => `<th scope="col">${p.symbol}</th>`).join('')}</tr></thead>`;
  const structure = [
    ['Network / protocol', (p: Assessment) => `${p.chain} / ${p.protocol}`],
    ['Evidence date', (p: Assessment) => date(p.observedAt)],
    ['Monitoring status', (p: Assessment) => p.watchlist ? 'WATCHLIST required' : 'See evidence requirements'],
    ['Position exposure', (p: Assessment) => p.summary],
    ['Exact maturity', (p: Assessment) => p.maturity ? date(p.maturity, true) : 'No contractual PT maturity'],
    ['Loss object', (p: Assessment) => p.lossObject],
    ['Binding research gap', (p: Assessment) => p.blocker],
  ] as const;
  return `<p class="rl-eyebrow">COVERAGE UNIVERSE / COMPARISON</p><h1 class="rl-title rw-view-title">Different positions.<br>Different dependencies.</h1><p class="rw-lede">Compare what each holder owns, what can interrupt realization, and what evidence is still needed.</p><p class="rw-notice">All ${assessments.length} assessments are not approved. No score, grade or approved confidence is assigned. Evidence dates and underlying assets differ; the assessed September and October PT series have matured.</p>
    <div class="rw-position-links">${assessments.map(p => `<a class="rw-link" data-position="${p.id}" href="${workspaceHref(location, { position: p.id, view: 'ratings', tab: 'dependencies' })}">Open ${p.symbol} →</a>`).join('')}</div>
    <section class="rl-box rw-card">${section('Evidence across the positions')}<p class="rw-intro">Each state describes evidence for that exact position and its underlying assets. Select a state to inspect its evidence.</p>
    <div class="rw-table-scroll" role="region" aria-label="Evidence comparison, scroll horizontally on small screens" tabindex="0"><table class="rw-table"><caption>Shared and position-specific evidence. N/A means the mechanism is not part of that position.</caption>${titles}${groups.map(([group, title]) => `<tbody><tr class="rw-table-group"><th colspan="${assessments.length + 1}" scope="rowgroup">${title}</th></tr>${comparisonEvidenceRows.filter(r => r.group === group).map(row => `<tr><th scope="row">${escape(row.title)}</th>${assessments.map(p => {
      const cell = comparisonEvidenceCell(p, row);
      return `<td>${cell.kind === 'recorded' ? `<a class="rw-link" data-position="${p.id}" data-evidence="${row.id}" aria-label="${p.symbol}: ${escape(row.title)}, ${cell.evidence.state}. Inspect evidence" href="${workspaceHref(location, { position: p.id, view: 'ratings', tab: 'evidence', target: `evidence-${row.id}` })}">${badge(cell.evidence.state)} ${arrow}</a>` : `<span class="rw-caption"${cell.kind === 'not-applicable' ? ` title="${escape(cell.reason)}"` : ''}>${cell.kind === 'not-applicable' ? `N/A<span class="sr">: ${escape(cell.reason)}</span>` : 'Not recorded'}</span>`}</td>`;
    }).join('')}</tr>`).join('')}</tbody>`).join('')}</table></div><p class="rw-caption">Evidence states describe individual requirements. They are not a completion percentage, confidence score or investment ranking.</p></section>
    <section class="rl-box rw-card">${section('Structure and realization')}<div class="rw-table-scroll" role="region" aria-label="Position structure comparison" tabindex="0"><table class="rw-table"><caption>Each PT has its own contract, chain and maturity. Evidence states across different assets do not imply comparable risk.</caption>${titles}<tbody>${structure.map(([title, value]) => `<tr><th scope="row">${title}</th>${assessments.map(p => `<td>${escape(value(p))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}
function research() {
  return `<p class="rl-eyebrow">SOURCE REGISTER / SEP–OCT 2026</p><h1 class="rl-title rw-view-title">The evidence behind<br>the assessment.</h1><p class="rw-lede">Dated documents, protocol observations and audit research define the assessments. Unresolved claims remain visible.</p><a class="rw-button primary" href="ratings-data/research.json" download="kurtosis-source-research-packets.json">↓ Download research packet</a>
    <div class="rw-research-documents">${[['onyc', '01 / Underlying', 'ONyc evidence', 'Account claims, reserves, NAV, controls and the route to cash.'], ['exponent', '02 / Structure', 'Exponent evidence', 'Exact PT series, wrappers, junior protection, recovery and deployment gaps.'], ['research', '03 / Summary', 'ONyc research findings', 'The ONyc assessment findings and requirements for approval.'], ['pt-susdai', '04 / Investor report', 'PT-sUSDai assessment', 'Full investor edition, 23 Oct 2026. Investment evidence cutoff: 22 Oct 2026. Includes all 68 investor questions and the historical depeg review.']].map(([id, label, title, detail]) => `<a class="rl-box rw-card" href="ratings-data/documents/${id}.md" download><span class="rw-eyebrow">${label}</span><h2>${title} ${arrow}</h2><p>${detail}</p><span class="rw-link">Download research document</span></a>`).join('')}</div>
    <section class="rl-box rw-card">${section('Research source register')}<p class="rw-intro">${sources.length} source records; 13 have retained source extracts. PT-sUSDai records are transcribed from the supplied assessment; original sources have not been retrieved again. A source count is inventory, not assurance.</p><div class="rw-source-register">${sources.map(s => `<button type="button" data-source="${escape(s.id)}"><span class="rw-source-id">${escape(s.id)}</span><span><strong>${escape(s.title)}</strong><small>${escape(s.publisher)} · Evidence date ${date(s.observedAt)}</small></span>${arrow}</button>`).join('')}</div></section>`;
}
export function methodology() {
  return `<p class="rl-eyebrow">METHODOLOGY / V0.3-ALPHA</p><h1 class="rl-title rw-view-title">Rate the position.<br>Trace every material claim.</h1><p class="rw-lede">Decompose the held position into its economic layers. Assess the underlying substance, then transmit risk upward with each material contribution counted once.</p><a class="rw-button primary" href="ratings-data/documents/methodology.md" download="kurtosis-token-risk-methodology-v0.3-alpha.md">↓ Download full methodology</a><p class="rw-notice">Unapproved alpha. These preliminary assessments have not received rating approval. No calibrated score or committee approval is implied.</p>
    <section class="rl-box rw-card">${section('How the assessment is formed')}<ol class="rw-method-steps">${[
      ['Fix the exact position', 'Identify the mint, series, custody, size, horizon, access and intended exit. Changing the route changes the object being assessed.'],
      ['Decompose the material layers', 'Follow claims, wrappers, underlying assets and yield sources. Retain shared controls and route conditions without duplicating economic exposure.'],
      ['Assess substance, then propagate', 'A parent inherits the highest-risk material direct child and adds only independently new contributions. Evidence constrains approval and is excluded from the economic sum.'],
      ['Apply approval gates', 'Resolve required evidence, score formation, material contradictions and independent sign-off before issuing a rating. Missing evidence remains NOT APPROVED.'],
    ].map(([title, detail], i) => `<li><span class="rw-step-number">0${i + 1}</span><div><h3>${title}</h3><p>${detail}</p></div></li>`).join('')}</ol></section>
    <section class="rl-box rw-card">${section('Status and grade answer different questions')}<dl class="rw-scope"><div><dt>NOT APPROVED</dt><dd>An approved assessment cannot yet be issued. Missing evidence does not establish structural uninvestibility.</dd></div><div><dt>REJECT</dt><dd>Sufficient evidence identifies a fundamental structural problem.</dd></div><div><dt>WATCHLIST</dt><dd>A separate monitoring requirement, which may accompany a grade or unresolved assessment.</dd></div></dl></section>
    <section class="rl-box rw-card">${section('Internal token-risk grade ladder')}<p class="rw-intro">Pre-calibration ranges. Lower scores represent lower assessed token risk within the relevant lane and loss object. These are not default probabilities or external credit ratings.</p><div class="rw-table-scroll" role="region" aria-label="Grade ladder" tabindex="0"><table class="rw-table rw-grade-table"><caption>v0.3-alpha · No grades assigned to the assessed positions</caption><thead><tr><th scope="col">Grade</th><th scope="col">Raw token-risk score</th><th scope="col">Classification</th></tr></thead><tbody>${gradeLadder.map(g => `<tr><th scope="row">${g.grade}</th><td>${g.min.toFixed(2)} ≤ score${g.max === null ? '' : ` &lt; ${g.max.toFixed(2)}`}</td><td>${g.classification}</td></tr>`).join('')}</tbody></table></div><p class="rw-caption">Senior protection does not automatically improve the inherited grade. A tranche-specific transformation requires an approved methodology change and an effective mitigation record.</p></section>`;
}
export function renderWorkspace(location: WorkspaceLocation, state: ViewState) {
  if (location.view === 'compare') return compare(location);
  if (location.view === 'research') return research();
  if (location.view === 'methodology') return methodology();
  const p = getAssessment(location.position);
  if (!p) return `<div class="rw-empty"><h1>Position not covered</h1><p>The identifier “${escape(location.position)}” does not match an assessment in this research edition.</p><a class="rw-button primary" href="ratings.html?position=onyc" data-position="onyc">Open ONyc assessment</a></div>`;
  const tabNames: Record<string, string> = { dependencies: 'Dependencies', routes: 'Exit routes', questions: 'Open questions', evidence: 'Evidence' };
  const addressLabel = p.chain === 'Solana' ? 'Token mint' : 'Token contract';
  const reportNotice = p.id === 'pt-susdai' ? `<aside class="rw-notice rw-assessment-notice"><strong>NOT APPROVED · WATCHLIST</strong><p>Evidence cutoff: ${date(p.observedAt)}. Investor edition: 23 Oct 2026; investment evidence has not been refreshed. Evidence confidence: Low; approved confidence is unassigned.</p><a class="rw-link" href="ratings-data/documents/pt-susdai.md" download="kurtosis-pt-susdai-investor-assessment.md">↓ Read the full investor assessment</a></aside>` : '';
  return `<p class="rl-eyebrow">${p.chain.toUpperCase()} <span class="s">/</span> ${p.protocol.toUpperCase()}</p><div class="rw-position-heading"><div><h1 class="rl-title">${p.symbol}</h1><p class="rl-subt">${escape(p.name)}</p><p class="rl-mint">${addressLabel} <code>${short(p.mint)}</code><button type="button" class="rw-copy" data-copy="mint" aria-label="Copy full ${p.symbol} ${addressLabel.toLowerCase()}">Copy</button></p></div><a class="rw-link rw-overview-link" href="${workspaceHref(location, { tab: 'questions' })}" data-tab="questions"><span class="rw-status-dot" aria-hidden="true"></span>Not approved${p.watchlist ? ' · Watchlist' : ''} →</a></div>${reportNotice}
    <dl class="rl-box rw-kpi"><div><dt>Category</dt><dd>${p.maturity ? 'Fixed maturity' : 'NAV-based'}</dd></div><div><dt>Series</dt><dd>${p.maturity ? `${date(p.maturity)} · Matured` : 'Open-ended'}</dd></div><div><dt>Market data</dt><dd>Historical snapshot</dd></div><div><dt>Risk rating</dt><dd>Not yet rated</dd></div><div><dt>Token type</dt><dd>${p.type}</dd></div></dl>
    <nav class="rw-tabs" role="tablist" aria-label="Assessment views">${Object.entries(tabNames).map(([id, name]) => `<button type="button" role="tab" id="tab-${id}" data-tab="${id}" aria-controls="assessment-panel" aria-selected="${location.tab === id}" tabindex="${location.tab === id ? 0 : -1}">${name}</button>`).join('')}</nav>
    <div class="rw-panel" id="assessment-panel" role="tabpanel" aria-labelledby="tab-${location.tab}">${location.tab === 'dependencies' ? dependencies(p, state) : location.tab === 'routes' ? routes(p, location) : location.tab === 'questions' ? questions(p, location, state) : evidence(p, state)}</div>
    <p class="rw-edition">Kurtosis Ratings / Evidence date ${date(p.observedAt)} <span>Methodology v0.3-alpha · No automatic refresh</span></p>`;
}
export function renderSource(id: string, position?: Assessment) {
  const source = sourceById(id);
  if (!source) return `<div class="rw-dialog-top"><span class="rw-eyebrow">Source record</span><button type="button" class="rw-button secondary" data-close-source>Close</button></div><h2 id="source-title">Source not found</h2><p>The source identifier “${escape(id)}” is not in this research edition.</p>`;
  const record = getSourceRecord(id)!;
  const capture = record.capture;
  const selectedGroup = position && capture?.groups.find(group => group.fields?.some(field => field.valueText === JSON.stringify(position.mint) || (position.market && field.valueText === JSON.stringify(position.market))));
  const groups = selectedGroup ? [selectedGroup, ...capture!.groups.filter(g => g !== selectedGroup)] : capture?.groups ?? [];
  return `<div class="rw-dialog-top"><span class="rw-eyebrow">Source record / ${escape(id)}</span><button type="button" class="rw-button secondary" data-close-source>Close</button></div><h2 id="source-title">${escape(source.title)}</h2><p class="rw-source-publisher">${escape(source.publisher)} · ${id.startsWith('SUSDAI-') ? 'Assessment evidence cutoff' : 'Retrieved'} ${date(source.observedAt)}</p><p class="rw-notice">${escape(source.limitation)}</p>
    <h3>${capture ? capture.kind === 'document_excerpt' ? 'Captured source passage' : 'Captured source observations' : 'Source metadata and research notes'}</h3><p class="rw-caption">${escape(record.captureLimitation)}</p>
    ${capture ? groups.map((group, i) => capture.kind === 'document_excerpt' ? `<blockquote>${escape(group.quote)}</blockquote><p class="rw-caption">${escape(group.label)} · ${escape(group.location)}</p>` : `<details class="rw-capture"${i === 0 ? ' open' : ''}><summary>${escape(group.label)}${group === selectedGroup ? ' · Assessed position' : ''}</summary><p class="rw-caption">${escape(group.location)}</p><dl>${group.fields?.map(f => `<div><dt><code>${escape(f.path)}</code></dt><dd><code>${escape(f.valueText)}</code></dd></div>`).join('') ?? ''}</dl></details>`).join('') : '<p>No exact source passage or API extract is retained. Metadata and attributed research notes remain available in the preserved record.</p>'}
    ${capture ? `<details class="rw-capture"><summary>Capture provenance</summary><p>${escape(capture.provenance)}</p><h4>Original response SHA-256</h4><code>${escape(capture.sourceResponseSha256)}</code></details>` : ''}
    <p class="rw-caption">${escape(record.attribution)}</p><div class="rw-dialog-actions"><a class="rw-button primary" href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">Open original source ${arrow}</a><a class="rw-button secondary" href="ratings-data/sources/${escape(id)}.json" download="kurtosis-source-${escape(id)}.json">Download preserved record</a></div><p class="rw-caption">External sources may change. This record preserves the research date and limitations.</p>`;
}
