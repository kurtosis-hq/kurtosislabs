# Kurtosis Labs website (responsive homepage, 2026-11-10)

Everything in one repository: one responsive landing page, the contact page, the Coming Soon page,
the Kurtosis Ratings pages, and the Ratings app source code.

## See it
- **Quickest:** open `quick-view/Kurtosis-Labs-Website.html` in a browser. This standalone homepage adapts to every
  screen width and links to the standalone Contact and Coming Soon previews. The old mobile preview forwards to it.
  Fonts need an internet connection; Ratings needs the local server below.
- **Everything, Ratings included:** double-click `start-website-mac.command` (Mac) or `start-website-windows.bat`
  (Windows). It runs the site at http://localhost:8080. Needs Python, which Macs already have.
  Opening `index.html` straight from the folder will not work properly: browsers block the 3D coins and the Ratings
  pages when files are opened that way.

## Put it online with GitHub Pages
After pushing this repository: Settings, Pages, "Deploy from a branch", branch `main`, folder `/ (root)`, Save.
The site appears at `https://YOUR-NAME.github.io/REPOSITORY-NAME/` a minute later. The Ratings pages work in that
sub-folder. `.nojekyll` must stay: without it GitHub Pages hides the `ratings-static/_next` folder and Ratings breaks.

## Put it on GitHub

GitHub's website upload takes at most 100 files at a time, and this folder has more, so use
**GitHub Desktop** (free, desktop.github.com) or the command line.

**GitHub Desktop**
1. Unzip, then open GitHub Desktop: File, Add Local Repository, choose this folder.
2. It says the folder is not a repository yet: click "create a repository", then "Create Repository".
3. Click "Publish repository", pick the name and whether it is private, then "Publish".

**Command line** (from inside this folder)
```
git init
git add .
git commit -m "Kurtosis Labs website V160"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/kurtosis-website.git
git push -u origin main
```
(Create the empty repository on github.com first, without a README, then use its address above.)

## What is where
| Path | What it is |
|---|---|
| `index.html`, `home.css` | One responsive homepage for desktop, tablet and mobile; content reflows without navigating or reloading |
| `styles.css` | Shared brand styles and artwork styles |
| `mobile.html` | Compatibility redirect for old bookmarks; contains no separate layout |
| `menu.css` | Shared collapsed navigation styles for Contact and Coming Soon |
| `contact.html`, `contact.css` | Request a walkthrough form (every "Request a demo" and "Sign up" button opens it). Not connected to an inbox yet |
| `coming-soon.html` | About Us and Blog |
| `ratings/`, `ratings-static/` | Kurtosis Ratings: static export of `ratings-app/`, light mode first, theme button in the corner |
| `js/` | Animations and behaviour (coin flip, coin ring, scroll holds, Horizon chart, nav, contact form) |
| `assets/` | Images, logos, token artwork |
| `src/` | Editable sources; `python -X utf8 src/build.py` rebuilds HTML, CSS and the shared homepage preview |
| `quick-view/` | Standalone homepage, Contact and Coming Soon previews, plus an alias for the old mobile preview |
| `ratings-app/` | Next.js source of Kurtosis Ratings (see below) |

## Edit the landing pages
Edit `src/index.src.html` and `src/home.css` for the homepage, then run `python -X utf8 src/build.py`.
The homepage uses normal document flow, flexible grids and bounded type sizes. Its main layout changes at
576, 768 and 1024 CSS pixels, while widths between those thresholds remain fluid. The same links, content,
product selection and animations remain in the document when resizing. Scroll-driven card sequences run only
when their whole section fits on a wide screen; buttons remain available at every size.

`src/styles.src.css`, `src/menu.src.css` and `src/contact.src.css` maintain the shared styles and secondary pages.
These older shared sources still use the build's `px!` notation for fixed CSS pixels. `src/home.css` is copied
unchanged and does not use design-canvas units, except inside the decorative Horizon dashboard illustration.

## Rebuild Kurtosis Ratings
```
cd ratings-app
npm install
npm run build
```
Then copy `ratings-app/out/ratings` to `ratings/`, `ratings-app/out/_next` to `ratings-static/_next`, and run
`python3 src/ratings_fix.py` from the top folder. It makes the Ratings pages work in any folder and start in light mode,
preserving their native responsive breakpoints and text sizes. It also restores breakpoints in older exports that were
previously scaled as one canvas. `ratings-app/_left-out-of-static-build/` holds pages kept out of the static build.
`src/ratings-responsive.css` supplies the exported navigation and footer's responsive corrections; the fixer embeds it
in every Ratings page, so rerun the fixer and the root build after changing it.

Contact and Coming Soon use fixed-size text and controls inside fluid containers. Contact fields stack below 600 px;
the shared collapsed menu is used below 1024 px.

## Not connected yet
The contact form does not send anywhere.
