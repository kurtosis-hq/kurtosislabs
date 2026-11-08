# Kurtosis Labs website (V160, 2026-11-08)

Everything in one repository: the landing page (desktop and phone), the contact page, the Coming Soon page,
the Kurtosis Ratings pages, and the Ratings app source code.

## See it
- **Quickest:** open `quick-view/Kurtosis-Labs-Website.html` in a browser. The four files in `quick-view/` each work
  on their own (everything is built in) and link to each other. They do not include the Ratings pages.
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
| `index.html`, `styles.css` | Desktop landing page (520 px wide and up) |
| `mobile.html`, `mobile.css` | Phone landing page (below 520 px). Each page switches to the other when the window crosses 520 px |
| `contact.html`, `contact.css` | Request a walkthrough form (every "Request a demo" and "Sign up" button opens it). Not connected to an inbox yet |
| `coming-soon.html` | About Us and Blog |
| `ratings/`, `ratings-static/` | Kurtosis Ratings: static export of `ratings-app/`, light mode first, theme button in the corner |
| `js/` | Animations and behaviour (coin flip, coin ring, scroll holds, Horizon chart, nav, contact form) |
| `assets/` | Images, logos, token artwork |
| `src/` | Editable sources. Pages are written in Figma pixels; `python3 src/build.py` rebuilds the HTML and CSS |
| `quick-view/` | Single-file copies of the four pages, for sharing by email or opening without a server |
| `ratings-app/` | Next.js source of Kurtosis Ratings (see below) |

## Edit the landing pages
Edit `src/index.src.html`, `src/mobile.src.html`, `src/styles.src.css`, `src/mobile.src.css` or `src/contact.src.css`,
then run `python3 src/build.py`. Sizes are Figma pixels on the 1440 px (desktop) and 375 px (phone) frames; the build
turns them into widths that scale with the window.

## Rebuild Kurtosis Ratings
```
cd ratings-app
npm install
npm run build
```
Then copy `ratings-app/out/ratings` to `ratings/`, `ratings-app/out/_next` to `ratings-static/_next`, and run
`python3 src/ratings_fix.py` from the top folder. It makes the Ratings pages work in any folder, scale like the landing
page and start in light mode. `ratings-app/_left-out-of-static-build/` holds pages kept out of the static build.

## Not connected yet
The contact form and the phone email field do not send anywhere.
