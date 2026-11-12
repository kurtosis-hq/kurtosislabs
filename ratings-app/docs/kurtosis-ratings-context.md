Kurtosis Ratings: context prompt for building the Ratings website

You are helping build and refine the Kurtosis Ratings website, part of kurtosislabs.com. Read all of this before writing code or copy. If anything you plan to build would break a rule below, stop and ask instead of guessing. Anything marked [CONFIRM] is unverified: leave it as a visible placeholder, never fill it in yourself.

1. What Kurtosis Ratings is

Kurtosis Labs is a Singapore company building research and monitoring tools for onchain (blockchain-based) investments. Ratings is its first product.

One-line job: before someone invests in an onchain position, Ratings shows what they actually own, what could make them lose money, and how they would get back to cash. While they hold it, Ratings keeps watching and flags what has changed.

Product status: Research preview. No rating has been approved yet. Monitoring while you hold is in development. The site must never suggest otherwise.

Who it is for, in priority order [CONFIRM order]:

Onchain asset managers: their PMs (portfolio managers), risk teams and LPs (limited partners, i.e. their investors).
Institutional allocators building an investment case for a committee.
Treasuries and DAOs (decentralised autonomous organisations) explaining allocations to token holders.

They are professionals. They will check sources, and they need something they can take to an investment committee.

2. Why it exists (the reasoning behind every design choice)
Layers hide risk. One onchain asset can be wrapped, deposited into a yield protocol, split into a principal token and a yield token, and used as collateral elsewhere. Each layer changes what can go wrong. This is the same pattern as mortgage-backed securities feeding CDOs (collateralised debt obligations) before the 2008 crisis. Ratings peels back each layer. Kurtosis calls this the Russian Doll method.
Ratings reduce repeated due diligence. Every investor shouldn't have to redo the same research. A rating is a researched starting point that can be reused, challenged and updated.
A rating is not a verdict. The client's PM still decides price, size and timing. Real investment judgement stays with them.
Missing evidence is not the same as safety or distress. If something can't be verified, the site says so and shows the gap. It never fills the gap with an assumption.
The team sleeps on Singapore time. An exploit, depeg or liquidation can happen overnight, so monitoring has to flag changes without someone watching X and Telegram.
Kurtosis has a conflict to manage. It runs its own strategies and tests its ratings on them, so exposures and conflicts must be visible.
Kurtosis sells explainability, so the product has to be explainable too. Every figure carries its source, its date and its status (current, delayed, or waiting for review).
3. The rating model (get this exactly right)

Every position shows two separate things, which must never be merged:

Current evidence rating. The real rating, based only on verified evidence. Today every position is NR (not rated): insufficient basis for a grade, with low evidence confidence.
Scenario grade. A conditional letter (e.g. BB-) meaning: if the stated assumptions held, this is how resilient the position would be under a common stress. It is always labelled Assumptions unverified. It is not a rating, not a forecast and not a most-likely outcome.

Required wording near any scenario grade: "Scenario letters reflect unverified assumptions, not established differences in current credit quality."

Scale: AAA, AA, A, BBB, BB, B, CCC, CC, C, D, with plus and minus modifiers. Only BB, B and CCC are defined categories so far. The scale borrows S&P's published notation as a reference only. These are Kurtosis judgements, not ratings issued by S&P or any rating agency.

What a grade needs:

BB requires supported, stronger speculative-grade resilience.
B requires evidenced current capacity to meet the relevant obligations.
CCC requires evidenced present vulnerability.
Missing evidence earns NR, never CCC. An earlier version automatically assigned CCC to unverified positions. That was a methodology error and has been corrected; the site states this openly.

Four evidence gates (all four must be supported before a grade):

Holder rights: an enforceable claim and recovery priority.
Backing: the assets and reserves, and how they absorb losses.
Token payoff: the exact instrument and its conversion mechanics.
Cash access: each step from the holding to USDC.

Common stress used for scenario grades: material asset losses and delayed collections, combined with an exit-liquidity squeeze and no new funding. Reference position: US$1 million at reported NAV (net asset value), unlevered, with a 30-day objective of getting to native USDC.

From evidence to an approved rating:

Define the exact position: network, contract or mint, wrapper, series, maturity, holder access and position size.
Score four components: instrument, claims, substance and venue.
Trace each risk once. Use the most adverse factor, with no averaging and no automatic credit for buffers.
Validate before release: reconcile, test alternatives, get external review, then record a dated committee release decision.

Calculation rules: factor anchors are 0, 0.5 and 1, where higher means more modelled risk. Missing evidence leaves a blank and blocks approval. The economic score, the rating, evidence confidence, watchlist flags and release blocks are separate decisions. Confidence is capped at Moderate until the rubric is calibrated; there are zero matched factor-to-outcome observations so far. Current rubric: kurtosis-underwriting.v3, dated 25 Oct 2026.

Evidence states: Supported, Partial, Conflicting, Missing, Unavailable, Stale, N/A. They describe individual requirements only. They are not a completion percentage or a confidence score.

Live updates never change a grade automatically. They prompt a review only.

4. Positions currently covered (example data, as of 25 Oct 2026)
Position	Network / protocol	What it is	Maturity	Scenario grade	Evidence rating	Flags
ONyc	Solana / OnRe	Tokenised reinsurance; NAV-based token	Open-ended	BB-	NR	
PT-ONyc	Solana / Exponent / OnRe	Principal token on ONyc	Matured 10 Sept 2026	B+	NR	
PT-srONyc	Solana / Exponent / OnRe	Principal token on senior ONyc tranche	Matured 10 Sept 2026	BB	NR	
PT-sUSDai	Arbitrum One / Pendle / USD.AI	Principal token on sUSDai (GPU-backed loans)	Matured 15 Oct 2026	B	NR	Watchlist

The library holds 71 dated sources, with IDs such as ON-S01, each labelled Retained extract or Reference only. Use these numbers only as sample data, with their dates shown.

5. Site structure (current build)

Top bar: Kurtosis / Ratings, then Overview, Compare, Sources, Methodology.

Overview: "Know the risks behind each position." One row per position, showing the position (network, evidence date, maturity), the rating status (scenario grade with "Assumptions unverified", plus the current evidence rating and confidence), three key risks, an evidence-gap line, and two buttons: View assessment and View risk factors. Footer line: "Missing information establishes neither distress nor safety. Live updates prompt review and never change a grade automatically."

Position page: a rating status card, evidence date, series and token type, three key risks, and a one-line bottom line (e.g. "Treat this as insurance exposure with conditional cash access…"). Below that, expandable "Why this grade" and "Scope, sources and downloads" sections, then five tabs:

Dependencies: the Russian Doll layer stack, from the position held down to the underlying assets, plus "Who controls your access to cash".
Exit routes: Acquire, Issuer redemption, Secondary sale and Stress exit. Each route is a set of numbered steps, each with what needs to happen and what could go wrong. Always labelled indicative: "No transaction was simulated or submitted."
Risk factors: each risk with its evidence, what still needs checking, and its evidence state. Ends with a "Before you commit" box.
Evidence: validation status, each evidence item with its state and sources, the position scope (mint address, maturity, category, scope assumptions), and a private note saved only in the viewer's browser.
Live updates: reported developments tagged For context or For review, refresh and pause controls, and coverage limits. Checks run at most every five minutes while the page is visible.

Compare: all positions side by side, with search, filters (All or Needs attention), sorting and a shareable view. Columns: scenario grade, risk updates, key assumption, what would change it. Expandable sections: what could affect your decision, an evidence comparison across 16 requirements, and exposure and routes to cash.

Sources: a searchable, filterable list of dated sources with IDs, assessment report downloads (Markdown and plain text), and the assessment data as JSON.

Methodology: the four gates, scenario grades, how to read the scale, why each grade is withheld, the path from evidence to an approved rating, the calculation rules, and dates, quotes and updates. Ends with a glossary: NR, PT (principal token), live updates, downloads.

6. Writing rules
Say the plain thing. Short declarative headlines ending with a full stop, written to "you".
Spell out jargon in brackets the first time it appears on each page: NAV, PT, LP, PM, DeFi (decentralised finance), RWA (real-world asset).
Every product mention carries its status: Research preview, Prototype or In development.
Show the gap: say what Kurtosis cannot explain yet.
Never promise returns, repayment, safety or a cash-equivalent exit.
Name Kurtosis's own conflicts.
Use British and Singapore spelling (decentralised, tokenised, colour). Dates as "08 Sept 2026"; times in UTC with the label.
No hype, no exclamation marks, no em-dashes.
Mandatory disclaimer on every page: "Ratings are research, not investment advice."
Approved lines: "A researched starting point, not a verdict." "When we cannot explain part of a return, you see the gap."
7. Visual rules (Kurtosis Brand Guidelines, VERSION 2.0, October 2026)
Light-only. Navy 
#0F2D4B as the primary colour, because it signals trust and institutional finance. Ink 
#152D49, logo navy 
#172A42.
Ratings uses the navy 
#0F2D4B as its product colour. Supporting steel blues: 
#375987, 
#637B9D, 
#899BB1. Muted text: 
#7D8FA7.
Backgrounds: white, Mist 
#F4F9FD, Sky tint 
#E9F3FC, Panel 
#E3E9F0. Dividers 
#CED5DB.
Type: Plus Jakarta Sans Medium 500 for headings, labels and numbers; Bold 700 for buttons and chips. Helvetica Neue Regular 400 for body text.
Buttons are 36 px tall with 10 px corners. Cards are white with 28 px corners on a pale navy panel. The navigation bar floats.
Icons: Lucide, 24 × 24, 2 px stroke, in Horizon blue 
#456E99 or navy.
Motion is calm and in order. Nothing bounces or flashes.
[CONFIRM] The guideline has no status colours. The current build uses amber for scenario grades, Partial and Watchlist, and red for Conflicting. Propose a status set that passes WCAG AA contrast (at least 4.5:1 for small text) before adding more.
8. Never do these
Never show a scenario grade without "Assumptions unverified" right next to it, or make it look more important than the evidence rating.
Never use the words "rated", "approved" or "verified" for a position that is NR.
Never let a live update change a grade, confidence or status automatically.
Never present an exit route as executable, or a NAV or quote as proof of capital protection.
Never fill an unverified fact with a plausible-looking value.
Never send the user's private notes anywhere. They stay in that browser only.
Never call these S&P ratings or imply any rating agency endorses them.
9. Known issues in the current build
The Dependencies panel shows a duplicated, clipped "EVIDENCE" heading, and "ONyc product description" is listed twice.
Live updates show "Unable to refresh: provider identity could not be verified" on all four positions.
Three of the four showcase positions have already matured.
The scenario letter is visually dominant (large, coloured) while the NR evidence rating is small.
10. Open items [CONFIRM before building around them]
Whether letter grades on this scale fall under Singapore's regulated "credit rating services" activity. Legal review is pending, and the outcome may change what the grade is called or how it is shown.
Audience priority order.
Which partner and protocol names may appear in marketing outside the ratings data itself.
The contact email address for the "Contact Kurtosis" link.