import { Suspense } from "react";
import { Download } from "lucide-react";
import type { Variant } from "@/components/site/variants";
import { Container, Group, PageHeader, Surface } from "@/components/site/ui";
import { SiteFooter } from "@/components/site/blocks";
import { SourcesRegister } from "@/components/site/sources-register";
import { Eyebrow } from "@/components/ratings/primitives";
import { library } from "@/data/ratings";


const LIVE = "https://www.kurtosislabs.com/ratings-data";
// The live site's per-position report files. [CONFIRM] which downloads the final page should offer.
const REPORTS = [
  ["Real-world asset", "ONyc assessment report", "Claims, reserves, asset valuations, controls and the route to cash.", `${LIVE}/briefs/onyc.txt`],
  ["Principal token", "PT-ONyc assessment report", "Matured PT settlement, inherited ONyc exposure and the cash exit.", `${LIVE}/briefs/pt-onyc.txt`],
  ["Principal token", "PT-srONyc assessment report", "Senior loss allocation, withdrawal locks and recovery.", `${LIVE}/briefs/pt-sronyc.txt`],
  ["Investor report", "PT-sUSDai assessment", "Full investor edition, 23 Oct 2026. Investment evidence cutoff: 22 Oct 2026.", `${LIVE}/documents/pt-susdai.md`],
];

export function SourcesPage({ v }: { v: Variant }) {
  return (
    <>
      <PageHeader
        v={v}
        title="Sources."
        sub="Trace each investment case to its sources. Check the dates, supporting records and limitations."
      >
        <p className="text-[13px] text-muted-foreground tnum">
          {library.length} dated sources · {library.filter((s) => s.retained).length} saved extracts. PT-sUSDai uses the 22 Oct 2026 cutoff; original sources have not been refreshed.
        </p>
      </PageHeader>
      <Container>
        <Suspense>
          <SourcesRegister />
        </Suspense>
        <h2 className="mt-12 mb-3 text-[24px] leading-[30px] tracking-[-0.03em]">Assessment reports</h2>
        <Group className="grid gap-3 md:grid-cols-2">
          {REPORTS.map(([eyebrow, title, body, href]) => (
            <Surface key={title} className="flex flex-col">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h3 className="mt-2 text-[18px] leading-6">{title}</h3>
              <p className="mt-1 flex-1 text-[14px] leading-5 text-muted-foreground">{body}</p>
              <a href={href} className="mt-4 inline-flex h-9 w-fit items-center gap-1.5 rounded-[10px] bg-navy px-3.5 font-display text-[14px] font-bold text-white"><Download className="size-4" aria-hidden="true" />Download</a>
            </Surface>
          ))}
        </Group>
        <a href={`${LIVE}/research.json`} className="mt-4 inline-flex items-center gap-1.5 text-[14px] text-horizon hover:underline"><Download className="size-4" aria-hidden="true" />Download assessment data (JSON)</a>
      </Container>
      <SiteFooter />
    </>
  );
}
