export const viewIds = ['ratings', 'compare', 'research', 'methodology'] as const;
export const tabIds = ['dependencies', 'routes', 'questions', 'evidence'] as const;
export type WorkspaceLocation = { position: string; view: string; tab: string; route: string; source: string | null; target: string };
const oldPositions: Record<string, string> = { on: 'onyc', pt: 'pt-onyc', sr: 'pt-sronyc' };
const oldTabs: Record<string, string> = { overview: 'questions', dep: 'dependencies', exit: 'routes', oq: 'questions', ev: 'evidence' };

export function readLocation(url: URL): WorkspaceLocation {
  const p = url.searchParams;
  const rawPosition = p.get('position') || 'pt-sronyc';
  const rawTab = p.get('tab') || 'dependencies';
  const tab = oldTabs[rawTab] || rawTab;
  return {
    position: oldPositions[rawPosition] || rawPosition,
    view: viewIds.includes(p.get('view') as typeof viewIds[number]) ? p.get('view')! : 'ratings',
    tab: tabIds.includes(tab as typeof tabIds[number]) ? tab : 'dependencies',
    route: ['entry', 'settlement', 'early', 'stress'].includes(p.get('route') || '') ? p.get('route')! : 'settlement',
    source: p.get('source'), target: url.hash.slice(1),
  };
}

export function locationUrl(base: URL, next: Partial<WorkspaceLocation>): URL {
  const url = new URL(base);
  const location = { ...readLocation(url), ...next };
  for (const key of ['position', 'view', 'tab', 'route'] as const) url.searchParams.set(key, location[key]);
  if (location.source) url.searchParams.set('source', location.source); else url.searchParams.delete('source');
  url.hash = location.target;
  return url;
}
