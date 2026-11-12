import type { Variant } from "@/components/site/variants";
import { Container, Group, PageHeader, Surface } from "@/components/site/ui";
import { Accordion, RubricPill, SiteFooter } from "@/components/site/blocks";
import { GradeCell, ScenarioNote, StatusPill } from "@/components/ratings/primitives";
import { gateLabels, positions } from "@/data/ratings";


const TOC = [
  ["gates", "Four evidence gates"],
  ["scenario", "Scenario grades"],
  ["scale", "How to read the scale"],
  ["withheld", "Why each grade is withheld"],
  ["path", "From evidence to an approved rating"],
  ["calc", "How the calculation works"],
  ["dates", "Dates, quotes and updates"],
  ["glossary", "Glossary"],
];

const GATES = [
  ["rights", "An enforceable claim and recovery priority."],
  ["backing", "The assets and reserves, and how they absorb losses."],
  ["payoff", "The exact instrument and its conversion mechanics."],
  ["cash", "Each step from the holding to USDC."],
] as const;

const p = "text-[16px] leading-[26px]";
const dl = "space-y-4";
const dt = "text-[12px] text-muted-foreground";

export function MethodologyPage({ v }: { v: Variant }) {
  return (
    <>
      <PageHeader v={v} title="Methodology." sub="How we assess risk, what supports a grade and where the evidence stops." right={<RubricPill dark={v.header === "navy"} />} />
      <Container className="grid gap-10 lg:grid-cols-[220px_minmax(0,720px)]">
        <nav aria-label="On this page" className="hidden lg:sticky lg:top-[var(--sticky-top,92px)] lg:block lg:self-start">
          <div className="text-[12px] text-muted-foreground">On this page</div>
          <ol className="mt-3 space-y-2 border-l border-divider text-[14px]">
            {TOC.map(([id, l]) => (
              <li key={id}><a href={`#${id}`} className="-ml-px block border-l-2 border-transparent pl-3 text-steel hover:border-navy hover:text-ink">{l}</a></li>
            ))}
          </ol>
        </nav>

        <div className="space-y-4">
          <Surface className="bg-sky">
            <p className="text-[15px] leading-6">
              <b className="font-display">All four positions: NR, insufficient basis for a grade.</b> Missing evidence does not prove distress, and working mechanisms alone do not prove payment capacity. Evidence confidence remains Low; calibration and independent model review are still pending.
            </p>
          </Surface>

          <section id="gates" className="scroll-mt-36 pt-4">
            <h2 className="mb-3 text-[24px] leading-[30px] tracking-[-0.03em]">Four evidence gates</h2>
            <p className={`${p} mb-4`}>All four must be supported before any grade. Today none is supported for any position.</p>
            <Group className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {GATES.map(([id, text], i) => (
                <Surface key={id}>
                  <div className="font-display text-[13px] text-steel tnum">Gate {i + 1}</div>
                  <h3 className="mt-1 text-[17px] leading-6">{gateLabels[id]}</h3>
                  <p className="mt-1 text-[14px] leading-5 text-muted-foreground">{text}</p>
                </Surface>
              ))}
            </Group>
          </section>

          <div className="space-y-3 pt-4">
            <Accordion id="scenario" title="Scenario grades" meta="Conditional cases" open>
              <p className={p}>A scenario grade is a conditional letter: if the stated assumptions held, this is how resilient the position would be under a common stress. It is not a rating, not a forecast and not the most likely outcome. The evidence rating stays NR for every position.</p>
              <p className={`${p} mt-3`}><b className="font-display">Common stress:</b> material asset losses and delayed collections, combined with an exit-liquidity squeeze and no new funding. Reference position: US$1 million at reported NAV (net asset value), unlevered, aiming to reach native USDC within 30 days.</p>
              <ul className="mt-5 divide-y divide-divider">
                {positions.map((x) => (
                  <li key={x.slug} className="grid gap-3 py-4 md:grid-cols-[180px_1fr]">
                    <div>
                      <div className="font-display font-bold">{x.symbol}</div>
                      <div className="mt-2"><GradeCell p={x} size={18} layout="stack" showLabels={false} /></div>
                    </div>
                    <dl className={dl}>
                      <div><dt className={dt}>Scenario</dt><dd className="text-[15px] leading-6">{x.scenarioName}</dd></div>
                      <div><dt className={dt}>Assume</dt><dd className="text-[15px] leading-6">{x.keyAssumption}</dd></div>
                      <div><dt className={dt}>What would change it</dt><dd className="text-[15px] leading-6">{x.changeTrigger}</dd></div>
                    </dl>
                  </li>
                ))}
              </ul>
              <ScenarioNote className="mt-2" />
            </Accordion>

            <Accordion id="scale" title="How to read the scale">
              <dl className={dl}>
                <div><dt className={dt}>Scale</dt><dd className={p}>AAA, AA, A, BBB, BB, B, CCC, CC, C, D, with plus and minus modifiers. Only BB, B and CCC are defined categories so far.</dd></div>
                <div><dt className={dt}>What each grade needs</dt><dd className={p}>BB needs supported, stronger speculative-grade resilience. B needs evidenced current capacity to meet the relevant obligations. CCC needs evidenced present vulnerability.</dd></div>
                <div><dt className={dt}>NR</dt><dd className={p}>Not rated: insufficient basis for a grade. It is neither a safe rating nor a distress rating.</dd></div>
                <div><dt className={dt}>A corrected error</dt><dd className={p}>An earlier version gave CCC to positions with unverified evidence. That treated missing information as distress, which was a methodology error. Missing evidence now earns NR, never CCC. Removing CCC is a correction, not an upgrade.</dd></div>
                <div><dt className={dt}>Notation</dt><dd className={p}>The scale borrows S&amp;P&apos;s published notation as a reference only. These are Kurtosis judgements, not ratings issued or endorsed by S&amp;P or any rating agency.</dd></div>
              </dl>
            </Accordion>

            <Accordion id="withheld" title="Why each grade is withheld">
              <ul className="divide-y divide-divider">
                {positions.map((x) => (
                  <li key={x.slug} className="py-4">
                    <div className="flex items-center gap-2"><span className="font-display font-bold">{x.symbol}</span><StatusPill kind="missing" label={`NR · ${x.confidence} evidence confidence`} /></div>
                    <dl className="mt-3 space-y-3">
                      <div><dt className={dt}>Documented risk</dt><dd className="text-[15px] leading-6">{x.actualRisk}</dd></div>
                      <div><dt className={dt}>Supporting observations</dt><dd className="text-[15px] leading-6">{x.positiveEvidence}</dd></div>
                      <div><dt className={dt}>Still unknown</dt><dd className="text-[15px] leading-6">{x.missingEvidence}</dd></div>
                      {x.whyNotCCC && <div><dt className={dt}>Why not CCC</dt><dd className="text-[15px] leading-6">{x.whyNotCCC}</dd></div>}
                      {x.whyNotB && <div><dt className={dt}>Why not B</dt><dd className="text-[15px] leading-6">{x.whyNotB}</dd></div>}
                    </dl>
                  </li>
                ))}
              </ul>
            </Accordion>

            <Accordion id="path" title="From evidence to an approved rating">
              <ol className="space-y-5">
                {[
                  ["Define the exact position", "Network, contract or mint, wrapper, series, maturity, holder access and position size."],
                  ["Score four components", "Instrument, claims, substance and venue."],
                  ["Trace each risk once", "Use the most adverse factor, with no averaging and no automatic credit for buffers."],
                  ["Validate before release", "Reconcile, test alternatives, get external review, then record a dated committee release decision."],
                ].map(([t, b], i) => (
                  <li key={t} className="grid grid-cols-[36px_1fr] gap-3">
                    <span className="font-display text-[15px] text-steel tnum">{String(i + 1).padStart(2, "0")}</span>
                    <div><h3 className="text-[17px] leading-6">{t}</h3><p className="text-[15px] leading-6">{b}</p></div>
                  </li>
                ))}
              </ol>
            </Accordion>

            <Accordion id="calc" title="How the calculation works">
              <dl className={dl}>
                <div><dt className={dt}>Factor anchors</dt><dd className={p}>0, 0.5 and 1, where higher means more modelled risk.</dd></div>
                <div><dt className={dt}>Missing evidence</dt><dd className={p}>Leaves a blank and blocks approval. It is never filled with an assumed value.</dd></div>
                <div><dt className={dt}>Separate decisions</dt><dd className={p}>The economic score, the rating, evidence confidence, watchlist flags and release blocks are decided separately.</dd></div>
                <div><dt className={dt}>Confidence cap</dt><dd className={p}>Confidence is capped at Moderate until the rubric is calibrated. There are zero matched factor-to-outcome observations so far.</dd></div>
                <div><dt className={dt}>Evidence states</dt><dd className={p}>Supported, Partial, Conflicting, Missing, Unavailable, Stale and N/A describe individual requirements only. They are not a completion percentage or a confidence score.</dd></div>
              </dl>
            </Accordion>

            <Accordion id="dates" title="Dates, quotes and updates">
              <dl className={dl}>
                <div><dt className={dt}>Evidence dates</dt><dd className={p}>Each assessment keeps its own cutoff date. Refreshing the page does not refresh the evidence.</dd></div>
                <div><dt className={dt}>Quotes</dt><dd className={p}>A quote simulation is not an executed trade. No transaction was simulated or submitted for any exit route.</dd></div>
                <div><dt className={dt}>Live updates</dt><dd className={p}>Reported developments prompt a review only. They never change a grade, confidence or status automatically. Checks run at most every five minutes while a page is visible.</dd></div>
                <div><dt className={dt}>Times</dt><dd className={p}>All times are shown in UTC.</dd></div>
              </dl>
            </Accordion>

            <Accordion id="glossary" title="Glossary">
              <dl className={dl}>
                <div><dt className="font-display font-bold">NR</dt><dd className={p}>Not rated. Insufficient basis for a grade; it establishes neither safety nor distress.</dd></div>
                <div><dt className="font-display font-bold">PT (principal token)</dt><dd className={p}>A token for a specific maturity. Maturity alone does not establish payment in cash; check the exact assets and exit route.</dd></div>
                <div><dt className="font-display font-bold">Live updates</dt><dd className={p}>Reported developments shown separately from the dated assessment.</dd></div>
                <div><dt className="font-display font-bold">Downloads and private notes</dt><dd className={p}>Assessment and source records download as JSON; reports as Markdown or plain text. Your notes stay in this browser and are never sent anywhere.</dd></div>
              </dl>
            </Accordion>
          </div>
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
