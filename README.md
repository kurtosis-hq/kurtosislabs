# Kurtosis Labs website

Vite multi-page website. Use Node 24 and npm. `npm run dev` starts local development; `npm run check` runs the Ratings checks, builds the site and verifies production links and research downloads. Vercel serves `dist/`; the homepage rewrite continues to use `concept-85.html`.

## Ratings

`ratings.html` provides the branded shell; `src/ratings/main.ts` controls interactions and browser history, `views.ts` renders the shared records, and `workspace.css` adapts the existing visual design. The models, validation and research records under `src/ratings/lib/` and `data/` were imported from the local `Official Website/website/features/ratings` project. The source directory was left untouched.

All four positions remain `NOT APPROVED`, with null scores, grades and approved confidence. ONyc, PT-ONyc and PT-srONyc retain their historical September 2026 evidence; the two Exponent PTs matured on 10 September 2026. PT-sUSDai is the Arbitrum `PT-sUSDai-15OCT2026`, with a 22 October 2026 UTC investment-evidence cutoff inherited from the supplied investor assessment. Its 23 October 2026 Singapore edition revises language without refreshing that evidence, and preserves the source report’s `NOT APPROVED` status and required watchlist. Refreshing the page does not refresh evidence. January Exponent series and the February 2027 Pendle candidate are distinct instruments, not approved replacement assessments.

Vite generates allowlisted JSON and Markdown downloads under `ratings-data/` from the same records used by the page. These include the complete supplied PT-sUSDai investor edition and its attributed evidence packet; linked PT-sUSDai source records are inherited from the report, without new source retrievals or invented original-source captures. Each assessment export retains its own research date; combined exports identify the date range and per-position cutoffs. Production requires no API server, keys or database. Internal design documents are not imported or published. The dev-server middleware exposes the same allowlist, and the production check verifies the generated download count and contents.

URLs retain `position`, `view`, `tab`, `route` and optional `source`, plus evidence anchors. Notes use `kurtosis-note-<position>` in local storage and `kurtosis-draft-<position>` in session storage. Existing `rl-note-on`, `rl-note-pt`, and `rl-note-sr` notes on the same origin are read as a fallback. Notes do not move between domains or browsers and are never uploaded.

The checks cover assessment identity, evidence references, graph integrity, comparison applicability, source attribution, downloads, note persistence/failure handling, URL state and shared view rendering. Browser QA should also cover desktop/mobile layouts, dialog focus, history, filtering and clipboard access.
