import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteBase, type Variant } from "@/components/site/variants";
import { Container, PageHeader, Surface } from "@/components/site/ui";
import { Accordion, SiteFooter } from "@/components/site/blocks";
import { CompareTable } from "@/components/site/compare-table";
import { ScenarioNote, StatusPill } from "@/components/ratings/primitives";
import { positions, requirementState, requirements } from "@/data/ratings";


const th = "px-3 py-2.5 text-left text-[12px] font-normal text-muted-foreground";
const td = "px-3 py-3 align-top text-[13px] leading-5";

export function ComparePage({ v }: { v: Variant }) {
  const groups = [
    ["position", "Position and protocol requirements"],
    ["underlying", "Underlying assets, claims and cash access"],
  ] as const;
  return (
    <>
      <PageHeader
        v={v}
        title="Compare positions."
        sub="Weigh risks, exit options and evidence gaps side by side."
        right={<Link href={siteBase(v)} className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-divider bg-white px-3.5 font-display text-[14px] font-bold text-ink">All positions <ArrowRight className="size-4" aria-hidden="true" /></Link>}
      />
      <Container className="space-y-4">
        <Surface className="flex flex-wrap items-center gap-3">
          <StatusPill kind="partial" label="Unable to refresh" />
          <span className="text-[14px]"><b className="font-display">Last available check 30 Oct, 03:58 UTC.</b> <span className="text-muted-foreground">All four positions need a fresh or complete check.</span></span>
        </Surface>
        <CompareTable v={v} />
        <ScenarioNote />
        <p className="text-[12px] leading-4 text-muted-foreground">All four current evidence ratings remain NR. Changed assumptions prompt reassessment, never an automatic upgrade.</p>

        <div className="space-y-3 pt-4">
          <Accordion title="What could affect your decision" meta="Key risks, supporting evidence and open questions" open>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead><tr className="border-b border-divider"><th className={th} />{positions.map((p) => <th key={p.slug} className={th}>{p.symbol}</th>)}</tr></thead>
                <tbody className="divide-y divide-divider">
                  <tr><th className={th}>Key risks</th>{positions.map((p) => <td key={p.slug} className={td}><ul className="space-y-1">{p.keyRisks.map((k) => <li key={k.id}>{k.title}</li>)}</ul></td>)}</tr>
                  <tr><th className={th}>Documented risk</th>{positions.map((p) => <td key={p.slug} className={td}>{p.actualRisk}</td>)}</tr>
                  <tr><th className={th}>Supporting observations</th>{positions.map((p) => <td key={p.slug} className={td}>{p.positiveEvidence}</td>)}</tr>
                  <tr><th className={th}>Still unknown</th>{positions.map((p) => <td key={p.slug} className={td}>{p.missingEvidence}</td>)}</tr>
                </tbody>
              </table>
            </div>
          </Accordion>

          <Accordion title="Evidence comparison" meta={`${requirements.length} requirements · Position and underlying assets`}>
            <p className="mb-3 text-[14px] text-muted-foreground">Shared and position-specific evidence. N/A means the mechanism is not part of that position.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead><tr className="border-b border-divider"><th className={th}>Required area</th>{positions.map((p) => <th key={p.slug} className={th}>{p.symbol}</th>)}</tr></thead>
                {groups.map(([g, label]) => (
                  <tbody key={g} className="divide-y divide-divider">
                    <tr><th colSpan={5} className="bg-mist px-3 py-2 text-left font-display text-[12px] font-medium text-steel">{label}</th></tr>
                    {requirements.filter((r) => r.group === g).map((r) => (
                      <tr key={r.id}>
                        <th className="px-3 py-2.5 text-left font-display text-[13px] font-medium text-ink">{r.title}</th>
                        {positions.map((p) => (
                          <td key={p.slug} className="px-3 py-2.5"><StatusPill kind={requirementState(p, r)} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">Evidence states describe individual requirements. They are not a completion percentage, confidence score or investment ranking.</p>
          </Accordion>

          <Accordion title="Exposure and routes to cash" meta="Protocols, holder exposure and routes to cash">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead><tr className="border-b border-divider"><th className={th}>Required area</th>{positions.map((p) => <th key={p.slug} className={th}>{p.symbol}</th>)}</tr></thead>
                <tbody className="divide-y divide-divider">
                  {[
                    ["Network / protocol", (p: (typeof positions)[number]) => `${p.network} / ${p.protocol}`],
                    ["Evidence date", (p: (typeof positions)[number]) => p.evidenceDate],
                    ["Watchlist designation", (p: (typeof positions)[number]) => (p.watchlist ? "Watchlist" : "Not designated")],
                    ["Position exposure", (p: (typeof positions)[number]) => p.summary],
                    ["Exact maturity", (p: (typeof positions)[number]) => p.maturityExact ?? "No contractual PT (principal token) maturity"],
                    ["Loss being assessed", (p: (typeof positions)[number]) => p.lossObject],
                    ["Material evidence gap", (p: (typeof positions)[number]) => p.evidenceGapLine],
                  ].map(([label, f]) => (
                    <tr key={label as string}>
                      <th className={th}>{label as string}</th>
                      {positions.map((p) => <td key={p.slug} className={td}>{(f as (p: (typeof positions)[number]) => string)(p)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">Each PT (principal token) has its own contract, chain and maturity. Evidence states across different assets do not imply comparable risk.</p>
          </Accordion>
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
