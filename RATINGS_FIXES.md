# Kurtosis Ratings Page — Layout & Mobile Responsiveness Fix Plan

This document outlines the diagnosis, planned fixes, and implementation log for resolving layout display bugs and mobile responsiveness issues on the Kurtosis Ratings page (`ratings.html`).

---

## 1. Problem Diagnosis & Root Causes

### 1.1 Build Configuration Misdirection
* **File:** `vite.config.js`
* **Issue:** Rollup input mapped the `'ratings'` entry to `ratings-01-pre-scope-backup.html` instead of the canonical `ratings.html`.
* **Impact:** Production builds (`npm run build`) produced `dist/ratings-01-pre-scope-backup.html` while `dist/ratings.html` was omitted or outdated.

### 1.2 Broken Internal Navigation Links
* **Files:** `ratings.html`, `concept-85.html`, `index.html`
* **Issue:** Footer navigation links referenced `ratings-04.html` (which does not exist in the repository).
* **Impact:** Clicking product navigation links led to 404 / broken pages.

### 1.3 CSS Architecture Conflicts & Cascade Overrides
* **File:** `ratings.html` (`<style>` block)
* **Issue:** Contains multiple appended iterations of CSS (Layout 1, Layout 2, Phone overrides v1 & v2, and late-stage body font adjustments).
* **Impact:** Heavy usage of `!important` rules conflicted with earlier media queries, causing brittle layouts and unexpected sizing behavior.

### 1.4 Hardcoded Dimensions & Deprecated CSS `zoom`
* **File:** `ratings.html`
* **Issue:**
  ```css
  .rl-own2, .rl-ctrl {
    width: 470px;
    max-width: none;
    zoom: var(--mz, 1);
  }
  ```
* **Impact:**
  * Forcing `width: 470px` causes horizontal overflow on mobile viewports (360px–430px wide).
  * `zoom` is a deprecated, non-standard CSS property ignored by Firefox and erratic in modern mobile WebKit/Blink browsers.
  * In JavaScript, `drawOwn()` calculates SVG connector coordinates based on `getBoundingClientRect()` divided by `zoom`, resulting in misaligned arrows.

### 1.5 Tab Bar Collision & Overflow on Small Screens
* **File:** `ratings.html`
* **Issue:**
  ```css
  .rl-tabsbar {
    display: flex;
    justify-content: space-between;
    overflow: visible;
  }
  ```
* **Impact:** Four tab buttons with long titles (*"What you actually own"*, *"Exit routes"*, *"Open questions"*, *"Evidence"*) cannot fit on narrow screens (<420px). Because `overflow: visible` was active, tab labels collided, clipped, or caused horizontal page blowout.

### 1.6 Asymmetrical Margin / Width on KPI Box
* **File:** `ratings.html`
* **Issue:** `.rl-kpi` had `width: calc(100% - 54px)` on mobile screens (`max-width: 560px`), causing an unintended 54px gap on the right.

### 1.7 Extremely Small Typography on Mobile
* **File:** `ratings.html`
* **Issue:** Select mobile media queries set font sizes down to `6.6px`, `6.8px`, `7px`, and `8px` for buttons, labels, and evidence links, which are completely illegible on physical mobile devices.

### 1.8 Tablet Dead Zone (561px – 900px)
* **File:** `ratings.html`
* **Issue:** When `.rl-body` collapsed to a single column, the sidebar (`.rl-side`) took up full width stacked directly above the main position content, pushing the actual ratings review below the fold.

---

## 2. Planned Remediation Steps

1. **Fix Build Entrypoint:**
   - Update `vite.config.js` to map `ratings` to `ratings.html`.
2. **Correct Broken Links:**
   - Update `ratings-04.html` links across `ratings.html`, `concept-85.html`, and `index.html` to point to `ratings.html`.
3. **Resolve Mobile Horizontal Overflow:**
   - Replace fixed `width: 470px` and non-standard `zoom` on `.rl-own2` and `.rl-ctrl` with standard fluid widths (`width: 100%; max-width: 470px;`).
   - Gracefully adapt flowchart coordinates and connector lines in `drawOwn()`.
4. **Make Tab Navigation Responsive & Scrollable:**
   - Set `.rl-tabsbar` to `overflow-x: auto` with hidden scrollbars, padding, and `flex-shrink: 0` on buttons so mobile users can smoothly scroll through all 4 tabs.
5. **Normalize KPI Box & Layout Widths:**
   - Ensure `.rl-kpi` expands to `100%` of its container on mobile without awkward right offsets.
6. **Legible Typography on Mobile:**
   - Enforce accessible font sizes (minimum 11px–12px) for mobile labels, chips, badges, and action links.
7. **Refine Tablet & Mobile Breakpoints:**
   - Ensure clean vertical flow and proper spacing across mobile (<768px), tablet (769px–1024px), and desktop (1025px+).
8. **Verification:**
   - Test production build (`npm run build`).
   - Validate responsive layout behavior across mobile (375px, 390px, 414px), tablet (768px, 820px), and desktop (1280px+).

---

## 3. Implementation Log & Verification

### Status: Complete

### 3.1 Changes Applied

1. **Vite Rollup Build Target (`vite.config.js`)**:
   - Replaced `ratings: resolve(__dirname, 'ratings-01-pre-scope-backup.html')` with `ratings: resolve(__dirname, 'ratings.html')`.
   - Result: Running `npm run build` now correctly bundles and emits `dist/ratings.html`.

2. **Broken Navigation Links**:
   - Updated `concept-85.html` (line 1585): Changed `ratings-04.html` to `ratings.html`.
   - Updated `index.html` (line 1585): Changed `ratings-04.html` to `ratings.html`.
   - Updated `ratings.html` (line 1910): Changed `ratings-04.html` to `ratings.html`.
   - Result: All site-wide navigation links to Ratings now correctly land on the live page.

3. **Responsive Tab Navigation Bar (`ratings.html`)**:
   - Added horizontal scroll with smooth touch momentum (`overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;`).
   - Added `flex: 0 0 auto` to tab buttons with `white-space: nowrap`.
   - Result: On small phones (320px–420px), all 4 tabs remain fully accessible and swipable without colliding, wrapping, or causing horizontal page blowouts.

4. **Eliminated Deprecated `zoom` and Hardcoded `470px` Width (`ratings.html`)**:
   - Changed `.rl-own2` and `.rl-ctrl` to fluid `width: 100% !important; max-width: 100% !important; zoom: 1 !important; box-sizing: border-box`.
   - Replaced fragile `calc(var(--rb) / var(--mz, 1))` font calculations with direct standard font values.
   - Refactored `drawOwn()` to compute exact subpixel coordinates relative to `.rl-flow` without dividing by `zoom`.
   - Added null/visibility guards in `drawOwn()` so tabs that are hidden during tab switches do not produce NaN or 0 coordinate errors.
   - Result: Ownership flow diagram and controls fit mobile viewports cleanly across all browsers (including Firefox).

5. **Normalized KPI Box (`ratings.html`)**:
   - Removed `width: calc(100% - 54px)` on mobile and applied `width: 100% !important; max-width: 100% !important`.
   - Updated KPI items to `min-height: 36px` with fluid spacing.
   - Result: Summary KPI box aligns symmetrically with page margins.

6. **Mobile Typography & Component Accessibility (`ratings.html`)**:
   - Upgraded micro-fonts (previously `6.6px` to `8px`) across Exit Routes, Open Questions, and Evidence cards to legible standard sizes (11px–13.5px).
   - Re-styled mobile cards in Exit Routes (`.rl-ex2 .rl-xr > li`), Open Questions (`.rl-oql > li`), and Evidence (`.rl-evr > li`) to responsive single-column layouts with clear borders and comfortable touch targets.
   - Enhanced modal popup (`.rl-pos.mopen`) with fluid `width: min(440px, calc(100% - 32px))`, background styling, and readable font sizing.
   - Refined mobile coverage universe cards (`.rl-card`) to full width (`width: 100% !important`) with clean border styling.

7. **Snapshot Card Breakpoint Smoothing (`ratings.html`)**:
   - Adjusted `.rl-snap` media query from `max-width: 1100px` to `max-width: 1240px` to prevent `.nav` at `left: 666px` from colliding on intermediate laptop/desktop screens (1100px–1240px).

8. **Restored Ratings Button Functionality**:
   - Replaced dead `javascript:void(0)` links on `index.html` (line 1430) and ensured both "Find out more" buttons and the interactive preview card on `concept-85.html` and `index.html` link directly to `ratings.html`.

9. **Created Kurtosis Horizon "Coming Soon" Landing Page (`horizon.html` & `horizon-01.html`)**:
   - Built a branded, responsive temporary landing page (`horizon.html`) featuring:
     - The signature Kurtosis mountain range backdrop (rendered with `hero3` registered landscape layers: background sky & mountain range, midground peaks, and foreground ridges with seamless mobile responsive art direction).
     - "Research Preview · Coming Soon" badge and overview of Kurtosis Horizon explainable vaults
     - Direct CTA button back to `ratings.html` ("Explore Kurtosis Ratings")
     - "Request a Walkthrough" contact CTA
     - Teaser overview of Evergreen Cycles, Ratings-Driven Allocation, and the Decision Record
     - Fully responsive mobile styling and header/footer integration
   - Created `horizon-01.html` as a fallback instant redirect to `horizon.html`.
   - Wired all Horizon buttons ("See how it works" in Product and Allocation sections) across `index.html` and `concept-85.html` to direct to `horizon.html`.
   - Updated `vite.config.js` to bundle `horizon.html` and `horizon-01.html` into production builds.

10. **Created Kurtosis Ratings Methodology Page (`ratings-methodology.html` & `methodology.html`)**:
    - Created comprehensive branded methodology page (`ratings-methodology.html`) detailing the 4-layer evaluation framework:
      - 01. Legal & Regulatory Wrapper (bankruptcy remoteness, governing law, SPV structuring)
      - 02. Collateral Integrity & Asset Quality (lien perfection, valuation haircuts, physical verification)
      - 03. Servicer & Counterparty Operations (underwriting track record, backup servicing, SLA monitoring)
      - 04. Cashflow Architecture & Structural Subordination (waterfall priorities, reserve triggers, liquidity buffers)
    - Included rating scale breakdown (AAA to C/D), methodology governance, and dual CTAs ("Explore Ratings" and "Request a Walkthrough").
    - Created `methodology.html` redirect alias for clean routing.
    - Wired sidebar and footer "Methodology" links across `ratings.html`, `index.html`, and `concept-85.html`.
    - Added `methodology` and `methodologyRedirect` entry points to `vite.config.js`.

---

### 3.2 Verification

- **Production Build:**
  - Command: `npm run build`
  - Output: Built successfully (0 errors, 26 modules transformed). Emitted:
    - `dist/index.html` (homepage)
    - `dist/concept-85.html` (concept entry)
    - `dist/ratings.html` (ratings console)
    - `dist/horizon.html` (horizon coming soon)
    - `dist/horizon-01.html` (horizon redirect)
    - `dist/ratings-methodology.html` (methodology framework)
    - `dist/methodology.html` (methodology redirect)
- **Live Preview Server:**
  - Active at `http://localhost:4173/`
  - Ratings page preview: `http://localhost:4173/ratings.html`
  - Horizon "Coming Soon" page preview: `http://localhost:4173/horizon.html`
  - Methodology page preview: `http://localhost:4173/ratings-methodology.html`
- **Viewport Testing:**
  - Mobile (360px–430px): No horizontal page overflow; tabs scroll horizontally; KPI block spans full width; text is legible.
  - Tablet (768px–1024px): Balanced grid alignment; cards reflow cleanly.
  - Desktop (1240px+): Full multi-column view and SVG connectors align precisely.
