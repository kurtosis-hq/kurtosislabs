#!/usr/bin/env bash
# Kurtosis Ratings redesign: one-time setup for Claude Code.
# Run from the root of the website repo:  bash setup-ratings-redesign.sh
# Safe to run again: each step skips itself if it's already done.

set -euo pipefail

say()  { printf '\n\033[1m%s\033[0m\n' "$1"; }
stop() { printf '\n\033[31mStopped:\033[0m %s\n' "$1"; exit 1; }

# 1. Check the project and tools ------------------------------------------------
say "1/7 Checking the project and tools"
[ -f package.json ] || stop "No package.json here. Run this from the website repo root, or the site is plain HTML (tell Claude before going further)."
grep -q '"next"' package.json || stop "This project doesn't use Next.js, so shadcn can't be installed. Tell Claude before going further."
command -v node   >/dev/null || stop "Node.js isn't installed. Install Node 20 or later from nodejs.org."
NODE_MAJOR=$(node -v | sed 's/v//; s/\..*//')
[ "$NODE_MAJOR" -ge 20 ] || stop "Node $(node -v) is too old. Install Node 20 or later."
command -v claude >/dev/null || stop "Claude Code isn't installed. Install it first, then rerun."
command -v git >/dev/null || stop "git isn't installed. Run: xcode-select --install   then rerun."
# No GitHub needed. If this folder has no local git history yet, start one so every change can be undone.
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "No git history in this folder yet. Starting one locally (nothing is sent to GitHub)."
  git init -q
  git config user.name  >/dev/null || git config user.name  "Kurtosis website"
  git config user.email >/dev/null || git config user.email "website@localhost"
  git add -A
  git commit -q -m "Snapshot of the site before the ratings redesign"
  echo "Saved a snapshot of the site as it is now. You can always return to it."
fi
# New files (docs, screenshots, this script) are fine; edits to existing files are not.
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  stop "You have uncommitted edits to existing files. Commit or stash them first, then rerun."
fi
echo "OK: Next.js project, Node $(node -v), Claude Code found, no uncommitted edits."

# 2. Branch ---------------------------------------------------------------------
say "2/7 Switching to the ratings-redesign branch"
if git show-ref --verify --quiet refs/heads/ratings-redesign; then
  git checkout ratings-redesign
else
  git checkout -b ratings-redesign
fi

# 3. Reference files ------------------------------------------------------------
say "3/7 Checking the reference files"
mkdir -p docs design-ref
missing=()
for f in docs/kurtosis-ratings-context.md docs/ratings-redesign-brief.md docs/kurtosis-brand-guidelines.html; do
  [ -f "$f" ] || missing+=("$f")
done
if ! compgen -G 'design-ref/*.png' >/dev/null && ! compgen -G 'design-ref/*.jpg' >/dev/null; then
  missing+=("design-ref/ (no screenshots yet)")
fi
if [ ${#missing[@]} -gt 0 ]; then
  echo "Put these in place, then rerun this script:"
  printf '  - %s\n' "${missing[@]}"
  echo
  echo "Where each one comes from:"
  echo "  docs/kurtosis-ratings-context.md     your context prompt text, saved as .md"
  echo "  docs/ratings-redesign-brief.md       the brief Claude sent"
  echo "  docs/kurtosis-brand-guidelines.html  the brand guide (index.html), renamed"
  echo "  design-ref/                          Ondo, Elfa and current-page screenshots"
  exit 1
fi
echo "OK: all reference files present."

# 4. CLAUDE.md ------------------------------------------------------------------
say "4/7 Adding the redesign instructions to CLAUDE.md"
MARKER="## Kurtosis Ratings redesign"
if [ -f CLAUDE.md ] && grep -qF "$MARKER" CLAUDE.md; then
  echo "Already there, skipping."
else
  cat >> CLAUDE.md <<'EOF'

## Kurtosis Ratings redesign
Before any work on /ratings, read in this order:
1. docs/kurtosis-ratings-context.md (rules; wins on conflict)
2. docs/kurtosis-brand-guidelines.html (colours, type, surfaces)
3. docs/ratings-redesign-brief.md (layout and build plan)
Reference screenshots are in design-ref/.
Never fill a [CONFIRM] item; leave it as a visible placeholder.
Work one build step at a time and stop for review after each.
EOF
  echo "Added."
fi

# 5. shadcn ---------------------------------------------------------------------
say "5/7 Installing shadcn"
if [ -f components.json ]; then
  echo "shadcn already set up (components.json found), skipping init."
else
  echo "Answer the prompts: any base colour is fine (Slate), and say yes to CSS variables."
  npx shadcn@latest init
fi
npx shadcn@latest add --yes \
  navigation-menu button badge tabs toggle-group input select table tooltip \
  hover-card popover accordion collapsible card separator pagination \
  scroll-area textarea skeleton sheet

# 6. Connections for Claude Code ------------------------------------------------
say "6/7 Connecting shadcn and Figma to Claude Code"
npx shadcn@latest mcp init --client claude
if claude mcp get figma >/dev/null 2>&1; then
  echo "Figma already connected, skipping."
else
  claude mcp add --transport http figma https://mcp.figma.com/mcp
fi

# 7. Save the setup -------------------------------------------------------------
say "7/7 Committing the setup"
git add -A
git commit -m "Ratings redesign: setup (docs, CLAUDE.md, shadcn, MCP)" || echo "Nothing new to commit."

say "Setup done. Three things left, done by hand:"
cat <<'EOF'
  1. Start Claude Code here:   claude
  2. Type /mcp, select figma, and sign in. Check that shadcn shows as connected too.
  3. Paste this as your first prompt:

     Read the three docs listed in CLAUDE.md and look at every image in design-ref/.
     Don't write code yet. Tell me back: (1) the grade display rule in your own words,
     (2) every [CONFIRM] item across the three docs, (3) which existing files you'll
     change or replace for /ratings, (4) anything in the brief that conflicts with the
     brand guide or the context prompt.

Then build one step at a time:
     Do build step 1 from docs/ratings-redesign-brief.md. Stop when done and tell me what to check.
EOF
