# Kurtosis Labs website

Vite multi-page website. Use Node 24 and npm. `npm run dev` starts local development; `npm run check` runs the Ratings checks, builds the site and verifies production links and research downloads. Vercel serves `dist/`; the homepage rewrite continues to use `concept-85.html`.

## Ratings

`ratings.html` provides the branded shell; `src/ratings/main.ts` controls interactions and browser history, `views.ts` renders the shared records, and `workspace.css` adapts the existing visual design. The models, validation and research records under `src/ratings/lib/` and `data/` were imported from the local `Official Website/website/features/ratings` project. The source directory was left untouched.

All three positions remain `NO_RATE`, with null scores, grades and confidence. Evidence is a historical September 2026 snapshot, and the assessed PTs matured on 10 September 2026. Refreshing the page does not refresh the evidence. January candidate series in the source packet are distinct instruments, not approved replacement assessments.

Vite generates 46 allowlisted JSON and Markdown downloads under `ratings-data/` from the same records used by the page. Production requires no API server, keys or database. Internal design documents are not imported or published. The dev-server middleware exposes the same allowlist.

URLs retain `position`, `view`, `tab`, `route` and optional `source`, plus evidence anchors. Notes use `kurtosis-note-<position>` in local storage and `kurtosis-draft-<position>` in session storage. Existing `rl-note-on`, `rl-note-pt`, and `rl-note-sr` notes on the same origin are read as a fallback. Notes do not move between domains or browsers and are never uploaded.

The checks cover assessment identity, evidence references, graph integrity, comparison applicability, source attribution, downloads, note persistence/failure handling, URL state and shared view rendering. Browser QA should also cover desktop/mobile layouts, dialog focus, history, filtering and clipboard access.
