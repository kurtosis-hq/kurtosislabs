import { assessments, getAssessment } from './lib/assessments.ts';
import { validateResearchData } from './lib/assessment-rules.ts';
import { readLocation, locationUrl, tabIds, type WorkspaceLocation } from './lib/navigation.ts';
import { createNotes } from './lib/notes.ts';
import { noteStatus, renderWorkspace, renderSource, type ViewState } from './views.ts';

const workspace = document.getElementById('ratings-workspace')!;
const dialog = document.getElementById('source-dialog') as HTMLDialogElement;
const status = document.getElementById('ratings-status')!;
const search = document.querySelector<HTMLInputElement>('.rl-msbox input')!;
const cards = Array.from(document.querySelectorAll<HTMLButtonElement>('.rl-card'));
const notes = createNotes(() => window.localStorage, () => window.sessionStorage);
const ui: ViewState = { layerId: '', evidenceFilter: 'all', expandedFactors: false, note: notes.get };
let current = readLocation(new URL(window.location.href));
let toastTimer: ReturnType<typeof setTimeout>;
let sourceOpener: HTMLElement | null = null;
let shownSource: string | null = null;
const previousScrollRestoration = history.scrollRestoration;
history.scrollRestoration = 'manual';
window.addEventListener('pagehide', () => { history.scrollRestoration = previousScrollRestoration; });

function toast(message: string) {
  clearTimeout(toastTimer);
  status.textContent = message;
  status.classList.add('visible');
  toastTimer = setTimeout(() => status.classList.remove('visible'), 3500);
}

function saveScroll() {
  const active = document.activeElement as HTMLElement | null;
  const focusId = active?.id || '';
  history.replaceState({ ...history.state, ratingsScroll: { x: scrollX, y: scrollY, focusId } }, '');
}
function render() {
  workspace.innerHTML = renderWorkspace(current, ui);
  const position = getAssessment(current.position);
  document.title = current.view === 'ratings' ? `${position?.symbol || 'Position not covered'} — Kurtosis Ratings` : `${current.view[0].toUpperCase() + current.view.slice(1)} — Kurtosis Ratings`;
  cards.forEach((card, i) => card.setAttribute('aria-pressed', String(assessments[i].id === current.position && current.view === 'ratings')));
  document.querySelectorAll<HTMLElement>('.rw-nav [data-view]').forEach(link => {
    if (link.dataset.view === current.view) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    const url = locationUrl(new URL(window.location.href), { view: link.dataset.view, source: null, target: '' });
    link.setAttribute('href', url.pathname + url.search);
  });
  syncSource();
}
function syncSource() {
  if (current.source) {
    if (shownSource !== current.source) dialog.innerHTML = renderSource(current.source, current.view === 'ratings' ? getAssessment(current.position) : undefined);
    shownSource = current.source;
    if (!dialog.open) dialog.showModal();
  } else {
    if (dialog.open) dialog.close();
    shownSource = null;
    if (sourceOpener?.isConnected) sourceOpener.focus({ preventScroll: true });
    sourceOpener = null;
  }
}
function moveTo(target?: string, focusId?: string) {
  requestAnimationFrame(() => {
    const destination = document.getElementById(target || (current.view === 'ratings' ? 'assessment-panel' : 'top')) || document.getElementById('top')!;
    const focus = (focusId && document.getElementById(focusId)) || destination.querySelector<HTMLElement>('h1, h2') || destination;
    if (!focus.hasAttribute('tabindex')) focus.tabIndex = -1;
    focus.focus({ preventScroll: true });
    destination.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
}
function navigate(next: Partial<WorkspaceLocation>, options: { focusId?: string; replace?: boolean } = {}) {
  saveScroll();
  const url = locationUrl(new URL(window.location.href), { source: null, target: '', ...next });
  const updated = readLocation(url);
  if (updated.position !== current.position) { ui.layerId = ''; ui.evidenceFilter = 'all'; ui.expandedFactors = false; }
  if (next.target?.startsWith('evidence-')) ui.evidenceFilter = 'all';
  if (options.replace) history.replaceState({}, '', url); else history.pushState({}, '', url);
  current = updated;
  render();
  if (!current.source) moveTo(current.target || (next.position || next.view ? 'top' : undefined), options.focusId);
}
function openSource(id: string, opener: HTMLElement) {
  saveScroll();
  sourceOpener = opener;
  const url = locationUrl(new URL(window.location.href), { source: id });
  history.pushState({ ratingsSource: true }, '', url);
  current = readLocation(url);
  syncSource();
}
function closeSource() {
  if (history.state?.ratingsSource) history.back();
  else {
    const url = locationUrl(new URL(window.location.href), { source: null });
    history.replaceState(history.state, '', url);
    current = readLocation(url);
    syncSource();
  }
}
window.addEventListener('popstate', event => {
  const before = current;
  current = readLocation(new URL(window.location.href));
  if (before.position !== current.position) { ui.layerId = ''; ui.evidenceFilter = 'all'; ui.expandedFactors = false; }
  if (current.target.startsWith('evidence-')) ui.evidenceFilter = 'all';
  // Dialog history does not unmount the page or its opener.
  if (before.position === current.position && before.view === current.view && before.tab === current.tab && before.route === current.route) syncSource();
  else render();
  const scroll = event.state?.ratingsScroll;
  if (!current.source) requestAnimationFrame(() => {
    if (scroll) { document.getElementById(scroll.focusId)?.focus({ preventScroll: true }); window.scrollTo(scroll.x, scroll.y); }
    else moveTo(current.target || 'top');
  });
});
dialog.addEventListener('cancel', event => { event.preventDefault(); closeSource(); });
dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeSource(); } });

cards.forEach((card, i) => { card.dataset.position = assessments[i].id; card.id = `position-${assessments[i].id}`; });
const emptySearch = document.createElement('p');
emptySearch.className = 'rw-search-empty'; emptySearch.hidden = true; emptySearch.setAttribute('role', 'status');
emptySearch.textContent = 'No matching position. Try ONyc or Exponent.';
document.querySelector('.rl-cards')!.after(emptySearch);
search.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  let matches = 0;
  cards.forEach((card, i) => {
    const p = assessments[i];
    const match = `${p.symbol} ${p.name} ${p.protocol} ${p.type} ${p.maturity || ''}`.toLowerCase().includes(query);
    card.closest('li')!.hidden = !match;
    if (match) matches++;
  });
  emptySearch.hidden = matches > 0;
});

document.addEventListener('click', async event => {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const action = (event.target as Element).closest<HTMLElement>('[data-source], [data-close-source], [data-position], [data-tab], [data-view], [data-route], [data-layer], [data-evidence], [data-toggle-factors], [data-copy], [data-save-note], [data-clear-filter]');
  if (!action) return;
  event.preventDefault();
  const d = action.dataset;
  if ('closeSource' in d) return closeSource();
  if (d.source) return openSource(d.source, action);
  if (d.evidence) return navigate({ position: d.position || current.position, view: 'ratings', tab: 'evidence', target: `evidence-${d.evidence}` });
  if (d.position) return navigate({ position: d.position, view: 'ratings', tab: 'dependencies', route: 'settlement' });
  if (d.view) return navigate({ view: d.view });
  if (d.tab) return navigate({ tab: d.tab });
  if (d.route) return navigate({ route: d.route }, { focusId: `scenario-${d.route}` });
  if (d.layer) {
    ui.layerId = d.layer;
    const y = scrollY;
    render();
    const node = document.getElementById(`layer-${d.layer}`)!;
    node.focus({ preventScroll: true });
    if (window.matchMedia('(max-width: 1023px)').matches) node.scrollIntoView({ block: 'start' }); else window.scrollTo(0, y);
    return;
  }
  if ('toggleFactors' in d) {
    ui.expandedFactors = !ui.expandedFactors;
    const y = scrollY; render();
    document.querySelector<HTMLElement>('[data-toggle-factors]')?.focus({ preventScroll: true });
    if (!ui.expandedFactors) document.getElementById('risk-factors')!.scrollIntoView({ block: 'start' }); else window.scrollTo(0, y);
    return;
  }
  if ('clearFilter' in d) { ui.evidenceFilter = 'all'; render(); document.getElementById('evidence-filter')?.focus(); return; }
  if (d.copy) {
    const p = getAssessment(current.position);
    const value = d.copy === 'market' ? p?.market : p?.mint;
    if (value) try { await navigator.clipboard.writeText(value); toast('Full address copied'); }
    catch { toast('Copy unavailable. Select the full address in Position scope.'); }
    return;
  }
  if ('saveNote' in d) {
    const note = notes.save(current.position);
    document.getElementById('note-status')!.textContent = noteStatus(note);
    toast(note.error || 'Research note saved in this browser');
  }
});
workspace.addEventListener('input', event => {
  const field = event.target as HTMLTextAreaElement;
  if (field.id !== 'research-note-field') return;
  const note = notes.edit(current.position, field.value);
  document.getElementById('note-status')!.textContent = `${noteStatus(note)} · ${note.value.length.toLocaleString('en-US')} / 5,000 characters`;
});
workspace.addEventListener('change', event => {
  const field = event.target as HTMLSelectElement;
  if (field.id !== 'evidence-filter') return;
  ui.evidenceFilter = field.value;
  const y = scrollY;
  render(); document.getElementById('evidence-filter')!.focus({ preventScroll: true }); window.scrollTo(0, y);
});
workspace.addEventListener('keydown', event => {
  const tab = (event.target as Element).closest<HTMLElement>('[role="tab"][data-tab]');
  if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const i = tabIds.indexOf(current.tab as typeof tabIds[number]);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabIds.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabIds.length) % tabIds.length;
  navigate({ tab: tabIds[next] }, { focusId: `tab-${tabIds[next]}` });
});

const errors = validateResearchData();
if (errors.length) {
  workspace.innerHTML = `<section class="rw-notice"><h1>Research snapshot unavailable</h1><p>The research did not pass its integrity checks. No assessment can be displayed.</p><a href="mailto:kai@kurtosis-labs.com">Contact Kurtosis Labs</a></section>`;
  console.error('Ratings research validation failed', errors);
} else {
  render();
  if (current.target && !current.source) moveTo(current.target);
}
