// Variation 5 · Matrix. Organised around the four evidence gates: what has to be supported before any grade.
import { ChevronRight } from "lucide-react";
import { gateLabels, positions, RUBRIC, RUBRIC_DATE, type EvidenceState, type Position } from "@/data/ratings";
import { Btn, Eyebrow, Footnotes, GradeCell, Mono, ScenarioNote, StatusPill, TokenIcon, layerName } from "../primitives";
import { PositionTabs } from "../interactive";

const GATE_HELP: Record<string, string> = {
  rights: "An enforceable claim and recovery priority.",
  backing: "The assets and reserves, and how they absorb losses.",
  payoff: "The exact instrument and its conversion mechanics.",
  cash: "Each step from the holding to USDC.",
};

const ORDER: EvidenceState[] = ["conflicting", "missing", "unavailable", "stale", "partial", "supported"];

function StateCounts({ p }: { p: Position }) {
  const n = (s: EvidenceState) => p.evidence.filter((e) => e.state === s).length;
  return (
    <div className="flex flex-wrap gap-1.5">
      {ORDER.filter((s) => n(s) > 0).map((s) => (
        <StatusPill key={s} kind={s} label={`${n(s)} ${s === "na" ? "N/A" : s}`} className="capitalize" />
      ))}
    </div>
  );
}

function GateCell({ finding }: { finding: string }) {
  return (
    <div className="flex h-full flex-col gap-2 rounded-[14px] bg-mist p-3">
      <StatusPill kind="unresolved" />
      <p className="line-clamp-3 text-[12px] leading-4 text-ink">{finding}</p>
    </div>
  );
}

export function MatrixOverview() {
  return (
    <div className="px-4 pt-20 pb-16">
      <header className="mx-auto max-w-[1280px]">
        <Eyebrow>Research preview</Eyebrow>
        <div className="mt-2 flex flex-wrap items-end gap-4">
          <h1 className="flex-1 text-[40px] leading-[44px] tracking-[-0.045em]">Know the risks behind each position.</h1>
          <Btn variant="outline">Compare positions</Btn>
        </div>
        <p className="mt-2 max-w-[720px] text-muted-foreground">
          A grade needs all four evidence gates supported. Today no gate is supported for any position, so every evidence rating is NR.
        </p>
      </header>
      <div className="mx-auto mt-8 max-w-[1280px] overflow-x-auto rounded-[28px] bg-white">
        <table className="w-full min-w-[1100px] border-separate border-spacing-2 p-2 text-[14px]">
          <thead>
            <tr className="text-left align-bottom">
              <th className="w-[230px] px-2 pb-1 font-normal"><span className="text-[12px] text-muted-foreground">Position</span></th>
              {(["rights", "backing", "payoff", "cash"] as const).map((g) => (
                <th key={g} className="px-2 pb-1 font-normal">
                  <div className="font-display text-[15px] font-medium text-ink">{gateLabels[g]}</div>
                  <div className="text-[12px] leading-4 text-muted-foreground">{GATE_HELP[g]}</div>
                </th>
              ))}
              <th className="w-[180px] px-2 pb-1 font-normal"><span className="text-[12px] text-muted-foreground">Grade status</span></th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.slug} className="align-top">
                <td className="px-2 py-2">
                  <div className="flex items-center gap-3">
                    <TokenIcon slug={p.slug} size={32} />
                    <div>
                      <div className="font-display font-bold">{p.symbol}</div>
                      <div className="text-[12px] text-muted-foreground">{layerName(p)}</div>
                    </div>
                  </div>
                  <div className="mt-2"><Mono className="text-[12px] text-steel">{p.maturityLabel}</Mono></div>
                  <div className="mt-2"><StateCounts p={p} /></div>
                </td>
                {p.gates.map((g) => (
                  <td key={g.id}><GateCell finding={g.finding} /></td>
                ))}
                <td className="px-2 py-2">
                  <GradeCell p={p} size={20} layout="stack" />
                  {p.watchlist && <StatusPill kind="watchlist" className="mt-2" />}
                  <a href="#" className="mt-3 flex items-center gap-1 font-display text-[13px] font-bold text-navy">Assessment<ChevronRight className="size-4" aria-hidden="true" /></a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mx-auto mt-3 max-w-[1280px] text-[12px] text-muted-foreground">
        Evidence states describe individual requirements. They are not a completion percentage or a confidence score. Rubric <Mono className="text-[12px]">{RUBRIC}</Mono> · {RUBRIC_DATE}.
      </p>
      <Footnotes className="mx-auto mt-8 max-w-[1280px]" />
    </div>
  );
}

export function MatrixPosition({ p }: { p: Position }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-6 pb-16">
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex flex-1 items-center gap-4">
          <TokenIcon slug={p.slug} size={48} />
          <div>
            <h2 className="text-[40px] leading-[44px] tracking-[-0.045em]">{p.symbol}</h2>
            <p className="text-[14px] text-muted-foreground">{p.network} / {p.protocol} · {p.tokenType} · Research preview</p>
          </div>
        </div>
        <div className="rounded-[28px] bg-white px-6 py-4"><GradeCell p={p} size={28} /></div>
      </div>
      <ScenarioNote className="mt-2 text-right" />
      <div className="mt-6 grid gap-3 rounded-[42px] bg-panel p-3 md:grid-cols-2 lg:grid-cols-4">
        {p.gates.map((g, i) => (
          <div key={g.id} className="flex flex-col rounded-[28px] bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-[13px] text-steel tnum">Gate {i + 1}</span>
              <StatusPill kind="unresolved" />
            </div>
            <h3 className="mt-3 text-[18px] leading-6">{gateLabels[g.id]}</h3>
            <p className="text-[12px] text-muted-foreground">{GATE_HELP[g.id]}</p>
            <p className="mt-3 text-[14px] leading-5">{g.finding}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-[16px] bg-white px-5 py-4">
        <p className="flex-1 font-display text-[16px] leading-6 font-medium">{p.bottomLine}</p>
        <StateCounts p={p} />
      </div>
      <div className="mt-8"><PositionTabs p={p} initial="Risk factors" /></div>
      <Footnotes className="mt-12" />
    </div>
  );
}
